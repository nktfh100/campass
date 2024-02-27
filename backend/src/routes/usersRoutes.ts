import { FastifyPluginCallback, FastifySchema } from "fastify";

import {
	createUser,
	deleteUser,
	getUser,
	getUsers,
	importUsersExcel,
	updateUser,
} from "@/controllers/usersController";
import { AdminRole } from "@/lib/types";
import { Type } from "@sinclair/typebox";

export const userType = Type.Object({
	id: Type.Number(),
	event_id: Type.Number(),
	id_number: Type.String(),
	full_name: Type.String(),
});

const createUserSchema: FastifySchema = {
	body: Type.Object({
		id_number: Type.String(),
		full_name: Type.String(),
	}),
	response: {
		200: Type.Object({
			user: userType,
		}),
	},
};

const getUsersSchema: FastifySchema = {
	querystring: Type.Partial(
		Type.Object({
			page: Type.Number({ default: 1 }),
			limit: Type.Number({ default: 25 }),
			event_id: Type.Number(),
		})
	),
	response: {
		200: Type.Object({
			users: Type.Array(userType),
			pagination: Type.Object({
				page: Type.Number(),
				pageCount: Type.Number(),
				totalCount: Type.Number(),
			}),
		}),
	},
};

const getUserSchema: FastifySchema = {
	response: {
		200: Type.Object({
			user: Type.Composite([
				userType,
				Type.Object({
					event_name: Type.String(),
					event_invitation_count: Type.Number(),
				}),
			]),
		}),
	},
};

const updateUserSchema: FastifySchema = {
	body: Type.Omit(Type.Partial(userType), ["id"]),
	response: {
		200: Type.Object({
			user: userType,
		}),
	},
};

const importUsersExcelSchema: FastifySchema = {
	querystring: Type.Object({
		event_id: Type.Number(),
	}),
};

const usersRoutes: FastifyPluginCallback = (fastify, options, done) => {
	fastify.route({
		method: "POST",
		url: "/excel-import",
		handler: importUsersExcel,
		schema: importUsersExcelSchema,
		onRequest: fastify.auth([fastify.verifyAdmin(AdminRole.EventAdmin)]),
	});

	fastify.route({
		method: "POST",
		url: "/",
		handler: createUser,
		schema: createUserSchema,
		onRequest: fastify.auth([fastify.verifyAdmin(AdminRole.EventAdmin)]),
	});

	fastify.route({
		method: "GET",
		url: "/",
		handler: getUsers,
		schema: getUsersSchema,
		onRequest: fastify.auth([fastify.verifyAdmin(AdminRole.EventAdmin)]),
	});

	fastify.route({
		method: "GET",
		url: "/:id",
		handler: getUser,
		schema: getUserSchema,
		onRequest: fastify.auth([
			fastify.verifyUser,
			fastify.verifyAdmin(AdminRole.EventAdmin),
		]),
	});

	fastify.route({
		method: "DELETE",
		url: "/:id",
		handler: deleteUser,
		onRequest: fastify.auth([fastify.verifyAdmin(AdminRole.EventAdmin)]),
	});

	fastify.route({
		method: "PATCH",
		url: "/:id",
		handler: updateUser,
		schema: updateUserSchema,
		onRequest: fastify.auth([fastify.verifyAdmin(AdminRole.EventAdmin)]),
	});

	done();
};

export default usersRoutes;
