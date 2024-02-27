import { RouteHandlerMethod } from "fastify";
import xlsx from "node-xlsx";

import { AdminRole } from "@/lib/types";
import { getRandomUUID } from "@/utils/utils";
import { Static, Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

const guestType = Type.Object({
	full_name: Type.String(),
	id_number: Type.String(),
	weapon: Type.Boolean(),
});

const newGuestBody = Type.Composite([
	guestType,
	Type.Object({
		user_id: Type.Optional(Type.Number()),
	}),
]);

type newGuestBodyType = Static<typeof newGuestBody> & { event_id?: number };

export const createGuest: RouteHandlerMethod = async (request, reply) => {
	const { knex } = request.fastify;
	const newGuestData = Value.Clean(
		newGuestBody,
		request.body
	) as newGuestBodyType;

	if (request.userData) {
		// Make sure the user is not trying to create a guest for someone else
		newGuestData.user_id = request.userData.id;
	} else if (request.adminData && !newGuestData.user_id) {
		reply.status(400);
		return { error: "user_id is required" };
	}

	// Get the event_id from the user
	const user = await knex("users")
		.select("event_id")
		.where("id", newGuestData.user_id)
		.first();

	if (!user) {
		reply.status(400);
		return { error: "User not found" };
	}

	newGuestData.event_id = user.event_id;

	// Get the maximum number of guests for the event
	const event = await knex("events")
		.select("invitation_count")
		.where("id", newGuestData.event_id)
		.first();

	if (!event) {
		reply.status(400);
		return { error: "Event not found" };
	}

	// Make sure a guest with that id_number doesn't already exist
	const guest = await knex("guests")
		.select("id")
		.where("id_number", newGuestData.id_number)
		.first();

	if (guest) {
		reply.status(409);
		return { error: "A guest with that ID number already exists" };
	}

	// Make sure the user have not exceeded the maximum number of guests
	const userGuests = await knex("guests")
		.select("uuid")
		.where("user_id", newGuestData.user_id);

	if (userGuests.length >= event.invitation_count) {
		reply.status(403);
		return { error: "Maximum number of guests exceeded" };
	}

	const newGuest = await knex("guests")
		.insert({
			...newGuestData,
			user_id: newGuestData.user_id,
			uuid: getRandomUUID(),
		})
		.returning("*");

	return { guest: newGuest[0] };
};

export const getGuests: RouteHandlerMethod = async (request, reply) => {
	const { knex } = request.fastify;

	// Only return the user's guests
	if (request.userData) {
		const guests = await knex("guests")
			.select("*")
			.where("user_id", request.userData.id)
			.orderBy("full_name");

		return { guests };
	}

	if (request.adminData) {
		const { page, limit, event_id, user_id } = request.query as {
			page: number;
			limit: number;
			event_id?: number;
			user_id?: number;
		};

		const offset = (page - 1) * limit;

		let query = knex("guests");

		if (event_id) {
			query.where("guests.event_id", event_id);
		}

		if (request.adminData.role != AdminRole.SuperAdmin) {
			query = knex("guests").where(
				"guests.event_id",
				request.adminData.eventId
			);
		}

		if (user_id) {
			query.where("guests.user_id", user_id);
		}

		const guests = await query
			.leftJoin("users", "guests.user_id", "users.id")
			.select(
				"guests.*",
				"users.full_name as user_full_name",
				"users.id_number as user_id_number"
			)
			.orderBy("guests.full_name", "asc")
			.offset(offset)
			.limit(limit);

		let totalCountQuery = knex("guests");

		if (event_id) {
			totalCountQuery.where("event_id", event_id);
		}

		if (request.adminData.role != AdminRole.SuperAdmin) {
			totalCountQuery = knex("guests").where(
				"event_id",
				request.adminData.eventId
			);
		}

		if (user_id) {
			totalCountQuery.where("user_id", user_id);
		}

		const totalCount = await totalCountQuery
			.count<Record<string, number>>("id as count")
			.first();

		const pageCount = Math.ceil((totalCount?.count || 0) / limit);

		return {
			guests,
			pagination: {
				page,
				pageCount,
				totalCount: totalCount?.count || 0,
			},
		};
	}
};

export const getGuestByUUIDOrIdNumber: RouteHandlerMethod = async (
	request,
	reply
) => {
	const { knex } = request.fastify;
	const { id } = request.params as { id: string };

	const { scan } = request.query as { scan: string };

	const guest = await knex("guests")
		.select("guests.*", "events.name as event_name")
		.leftJoin("events", "guests.event_id", "events.id")
		.where("guests.uuid", id)
		.orWhere("guests.id_number", id)
		.first();

	if (!guest) {
		reply.status(404);
		return { error: "Guest not found" };
	}

	if (scan == "true") {
		await knex("guests")
			.update({ entered_at: knex.fn.now() })
			.where("id", guest.id);
	}

	return { guest };
};

const updateGuestBody = Type.Partial(guestType);

export const updateGuest: RouteHandlerMethod = async (request, reply) => {
	const { knex } = request.fastify;
	const { uuid } = request.params as { uuid: string };
	const updateGuestData = Value.Clean(
		updateGuestBody,
		request.body
	) as Static<typeof updateGuestBody>;

	if (Object.keys(updateGuestData).length === 0) {
		reply.status(400);
		return { error: "No data provided" };
	}

	const guest = await knex("guests").select("*").where("uuid", uuid).first();

	if (!guest) {
		reply.status(404);
		return { error: "Guest not found" };
	}

	// If request by user - make sure the user owns the guest
	if (request.userData && guest.user_id != request.userData.id) {
		reply.status(403);
		return {
			error: "You do not have permission to update this guest",
		};
	} else if (
		request.adminData &&
		request.adminData.role != AdminRole.SuperAdmin &&
		guest.event_id != request.adminData.eventId
	) {
		// If request by admin - make sure the admin is from the same event
		reply.status(403);
		return {
			error: "You do not have permission to update this guest",
		};
	}

	const [newGuest] = await knex("guests")
		.update(updateGuestData)
		.where("uuid", uuid)
		.returning("*");

	return { guest: newGuest };
};

export const deleteGuest: RouteHandlerMethod = async (request, reply) => {
	const { knex } = request.fastify;
	const { uuid } = request.params as { uuid: string };

	const guest = await knex("guests").select("*").where("uuid", uuid).first();

	if (!guest) {
		reply.status(404);
		return;
	}

	if (request.adminData && request.adminData.role != AdminRole.SuperAdmin) {
		if (guest.event_id != request.adminData.eventId) {
			reply.status(403);
			return;
		}
	} else if (request.userData) {
		if (guest.user_id !== request.userData.id) {
			reply.status(403);
			return;
		}
	}

	await knex("guests").where("uuid", uuid).del();

	reply.status(204);
	return;
};

// Export all guests for the event using excel4node
export const exportGuestsExcel: RouteHandlerMethod = async (request, reply) => {
	const { knex } = request.fastify;
	const { event_id } = request.query as { event_id: number };

	const event = await knex("events")
		.select("name")
		.where("id", event_id)
		.first();

	if (!event) {
		reply.status(404);
		return { error: "Event not found" };
	}

	if (request.adminData && request.adminData.role != AdminRole.SuperAdmin) {
		if (request.adminData.eventId != event_id) {
			reply.status(403);
			return {
				error: "You do not have permission to export this event's guests",
			};
		}
	}

	const guests = await knex("guests")
		.select("full_name", "id_number", "weapon")
		.where("event_id", event_id);

	const data: any[] = [["שם מלא", "תעודת זהות", "נושא נשק"]];

	guests.forEach((guest, _i) => {
		data.push([
			guest.full_name,
			guest.id_number,
			guest.weapon ? "כן" : "לא",
		]);
	});

	reply.header(
		"Content-Type",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
	);

	const sheetOptions = {
		"!cols": [{ wch: 20 }, { wch: 20 }, { wch: 20 }],
	};

	const buffer = xlsx.build([
		{ name: `אורחים - ${event.name}`, data, options: sheetOptions },
	]);

	reply.send(buffer);
};
