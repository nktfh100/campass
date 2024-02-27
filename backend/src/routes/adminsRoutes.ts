import { FastifyPluginCallback, FastifySchema } from "fastify";

import {
	createAdmin,
	deleteAdmin,
	getAdmin,
	getAdmins,
	updateAdmin,
} from "@/controllers/adminsController";
import { AdminRole } from "@/lib/types";
import { Type } from "@sinclair/typebox";

const adminType = Type.Object({
	id: Type.Number(),
	username: Type.String(),
	event_id: Type.Number(),
});

const createAdminSchema: FastifySchema = {
	body: Type.Object({
		username: Type.String(),
		event_id: Type.Number(),
		password: Type.String(),
	}),
	response: {
		200: Type.Object({
			admin: adminType,
		}),
	},
};

const getAdminsSchema: FastifySchema = {
	querystring: Type.Object({
		event_id: Type.Optional(Type.String()),
	}),
	response: {
		200: Type.Object({
			admins: Type.Array(adminType),
		}),
	},
};

const getAdminSchema: FastifySchema = {
	response: {
		200: Type.Object({
			admin: adminType,
		}),
	},
};

const updateAdminSchema: FastifySchema = {
	body: Type.Partial(
		Type.Object({
			username: Type.String(),
			event_id: Type.Number(),
		})
	),
	response: {
		200: Type.Object({
			admin: adminType,
		}),
	},
};

const adminsRoutes: FastifyPluginCallback = (fastify, options, done) => {
	fastify.route({
		method: "POST",
		url: "/",
		handler: createAdmin,
		schema: createAdminSchema,
		onRequest: fastify.auth([fastify.verifyAdmin(AdminRole.SuperAdmin)]),
	});

	fastify.route({
		method: "GET",
		url: "/",
		handler: getAdmins,
		schema: getAdminsSchema,
		onRequest: fastify.auth([fastify.verifyAdmin(AdminRole.SuperAdmin)]),
	});

	fastify.route({
		method: "GET",
		url: "/:id",
		handler: getAdmin,
		schema: getAdminSchema,
		onRequest: fastify.auth([fastify.verifyAdmin(AdminRole.SuperAdmin)]),
	});

	fastify.route({
		method: "PATCH",
		url: "/:id",
		handler: updateAdmin,
		schema: updateAdminSchema,
		onRequest: fastify.auth([fastify.verifyAdmin(AdminRole.EventAdmin)]),
	});

	fastify.route({
		method: "DELETE",
		url: "/:id",
		handler: deleteAdmin,
		onRequest: fastify.auth([fastify.verifyAdmin(AdminRole.SuperAdmin)]),
	});

	done();
};

export default adminsRoutes;
