import { RouteHandlerMethod } from "fastify";

import { Static, Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

const adminType = Type.Object({
	username: Type.String(),
	event_id: Type.Number(),
});

const newAdminType = Type.Composite([
	adminType,
	Type.Object({
		password: Type.String(),
	}),
]);

type adminBodyType = Static<typeof newAdminType>;

export const createAdmin: RouteHandlerMethod = async (request, reply) => {
	const { knex } = request.fastify;
	const newAdminData = Value.Clean(
		newAdminType,
		request.body
	) as adminBodyType;

	newAdminData.password = await request.bcryptHash(newAdminData.password);

	const [admin] = await knex("admins").insert(newAdminData).returning("*");

	return { admin };
};

export const getAdmins: RouteHandlerMethod = async (request) => {
	const { knex } = request.fastify;
	const { event_id } = request.query as { event_id?: string };
	let query = knex("admins").select("*");

	if (event_id) {
		query = query.where("event_id", event_id);
	}

	const admins = await query;
	return { admins };
};

export const getAdmin: RouteHandlerMethod = async (request, reply) => {
	const { knex } = request.fastify;
	const { id } = request.params as { id: string };
	const admin = await knex("admins").select("*").where("id", id).first();

	if (!admin) {
		reply.status(404);
		return;
	}

	return { admin };
};

export const updateAdmin: RouteHandlerMethod = async (request, reply) => {
	const { knex } = request.fastify;
	const { id } = request.params as { id: string };
	const newAdminData = Value.Clean(
		newAdminType,
		request.body
	) as adminBodyType;

	if (newAdminData.password) {
		newAdminData.password = await request.bcryptHash(newAdminData.password);
	}

	const admin = await knex("admins")
		.where("id", id)
		.update(newAdminData)
		.returning("*");

	if (!admin.length) {
		reply.status(404);
		return { error: "Admin not found" };
	}

	return { admin: admin[0] };
};

export const deleteAdmin: RouteHandlerMethod = async (request, reply) => {
	const { knex } = request.fastify;
	const { id } = request.params as { id: string };

	await knex("admins").delete().where("id", id);

	reply.status(204);
	return;
};
