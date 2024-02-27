import { RouteHandlerMethod } from "fastify";

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
			"events.invitation_count as event_invitation_count"
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
