import { RouteHandlerMethod } from "fastify";
import { NewUser } from "knex/types/tables";
import xlsx from "node-xlsx";

import { AdminRole } from "@/lib/types";
import { Static, Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

const userType = Type.Object({
	id_number: Type.String(),
	full_name: Type.String(),
	event_id: Type.Optional(Type.Number()),
});

type newUserBodyType = Static<typeof userType>;

export const createUser: RouteHandlerMethod = async (request, reply) => {
	const { knex } = request.fastify;
	const newUserData = Value.Clean(userType, request.body) as newUserBodyType;

	// Make sure a user with that id_number doesn't already exist
	const userExist = await knex("users")
		.select("id")
		.where("id_number", newUserData.id_number)
		.first();

	if (userExist) {
		reply.status(409);
		return { error: "A user with that ID number already exists" };
	}

	if (request.adminData!.role == AdminRole.SuperAdmin) {
		if (!newUserData.event_id) {
			reply.status(400);
			return { error: "event_id is required" };
		}
	} else {
		newUserData.event_id = request.adminData!.eventId;
	}

	// Make sure the event exists
	const event = await knex("events")
		.select("id")
		.where("id", newUserData.event_id)
		.first();

	if (!event) {
		reply.status(400);
		return { error: "Event not found" };
	}

	const newUser = await knex("users")
		.insert({
			...newUserData,
		})
		.returning("*");

	return { user: newUser[0] };
};

export const getUser: RouteHandlerMethod = async (request, reply) => {
	const { knex } = request.fastify;
	let { id } = request.params as { id: string };

	if (request.userData) {
		if (id == "me") {
			id = request.userData.id + "";
		} else if (request.userData.id + "" != id) {
			// Make sure the user is not trying to get someone else's data
			reply.status(403);
			return;
		}
	}

	const user = await knex("users")
		.select(
			"users.*",
			"events.name as event_name",
			"events.invitation_count as event_invitation_count",
			"events.weapon_form as event_weapon_form"
		)
		.leftJoin("events", "users.event_id", "events.id")
		.where("users.id", id)
		.first();

	if (!user) {
		reply.status(404);
		return { error: "User not found" };
	}

	if (request.adminData) {
		if (
			request.adminData.role != AdminRole.SuperAdmin &&
			user.event_id != request.adminData.eventId
		) {
			reply.status(403);
			return;
		}
	}

	return { user };
};

export const getUsers: RouteHandlerMethod = async (request, reply) => {
	const { knex } = request.fastify;
	let { page, limit, event_id } = request.query as {
		page: number;
		limit: number;
		event_id?: number;
	};

	if (request.adminData?.role == AdminRole.SuperAdmin) {
		if (!event_id) {
			reply.status(400);
			return { error: "Event ID query is required" };
		}
	} else {
		event_id = request.adminData?.eventId;
	}

	const offset = (page - 1) * limit;

	const users = await knex("users")
		.select("*")
		.where("event_id", event_id)
		.orderBy("full_name", "asc")
		.offset(offset)
		.limit(limit);

	const totalCount = await knex("users")
		.where("event_id", event_id)
		.count<Record<string, number>>("id as count")
		.first();

	const pageCount = Math.ceil((totalCount?.count || 0) / limit);

	return {
		users,
		pagination: {
			page,
			pageCount,
			totalCount: totalCount?.count || 0,
		},
	};
};

const updateUserType = Type.Object({
	id_number: Type.String(),
	full_name: Type.String(),
});

type updateUserBodyType = Static<typeof updateUserType>;

export const updateUser: RouteHandlerMethod = async (request, reply) => {
	const { knex } = request.fastify;
	const { id } = request.params as { id: string };
	const newUserData = Value.Clean(
		userType,
		request.body
	) as updateUserBodyType;

	if (request.adminData?.role != AdminRole.SuperAdmin) {
		const user = await knex("users")
			.select("event_id")
			.where("id", id)
			.first();

		if (user && user.event_id != request.adminData?.eventId) {
			reply.status(403);
			return;
		}
	}

	const user = await knex("users")
		.where("id", id)
		.update(newUserData)
		.returning("*");

	if (!user.length) {
		reply.status(404);
		return { error: "User not found" };
	}

	return { user: user[0] };
};

export const deleteUser: RouteHandlerMethod = async (request, reply) => {
	const { knex } = request.fastify;
	const { id } = request.params as { id: string };

	if (request.adminData?.role != AdminRole.SuperAdmin) {
		const user = await knex("users")
			.select("event_id")
			.where("id", id)
			.first();

		if (user && user.event_id != request.adminData?.eventId) {
			reply.status(403);
			return;
		}
	}

	await knex("users").where("id", id).del();

	// Delete all guests associated with the user
	await knex("guests").where("user_id", id).del();

	reply.status(204);
	return;
};

export const importUsersExcel: RouteHandlerMethod = async (request, reply) => {
	const { knex } = request.fastify;
	const { event_id } = request.query as { event_id: number };

	if (!event_id) {
		reply.status(400);
		return { error: "event_id is required" };
	}

	const event = await knex("events")
		.select("id")
		.where("id", event_id)
		.first();

	if (!event) {
		reply.status(400);
		return { error: "Event not found" };
	}

	const data = await request.file();
	if (!data) {
		reply.status(400);
		return { error: "File not found" };
	}

	const buffer = await data.toBuffer();

	const workSheetsFromBuffer = xlsx.parse(buffer);

	const usersSheet = workSheetsFromBuffer[0].data;

	const users: NewUser[] = [];

	usersSheet.forEach((user) => {
		let idNumberColumnIndex = -1;
		let fullNameColumnIndex = -1;

		// Find the column index for id_number (only digits)
		for (let i = 0; i < user.length; i++) {
			if (/^\d+$/.test(user[i])) {
				idNumberColumnIndex = i;
				break;
			}
		}

		// Find the column index for full_name (cell without digits)
		for (let i = 0; i < user.length; i++) {
			if (i !== idNumberColumnIndex && !/^\d+$/.test(user[i])) {
				fullNameColumnIndex = i;
				break;
			}
		}

		if (idNumberColumnIndex == -1 || fullNameColumnIndex == -1) {
			return;
		}

		let idNumber = user[idNumberColumnIndex];
		const fullName = user[fullNameColumnIndex];

		if (typeof idNumber !== "string") {
			idNumber = idNumber.toString();
		}

		users.push({
			id_number: idNumber,
			full_name: fullName,
			event_id,
		});
	});

	if (users.length == 0) {
		reply.status(400);
		return { error: "No users found in the file" };
	}

	// Skip users that already exist
	const existingUsers = await knex("users")
		.select("id_number")
		.where("event_id", event_id);

	const newUsers = users.filter(
		(user) => !existingUsers.find((u) => u.id_number == user.id_number)
	);

	if (newUsers.length == 0) {
		reply.status(204);
		return;
	}

	await knex("users").insert(newUsers);

	reply.status(204);

	return;
};
