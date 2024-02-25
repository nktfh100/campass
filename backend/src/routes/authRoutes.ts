import { FastifyPluginCallback, FastifySchema } from "fastify";

import { adminLogin, userLogin } from "@/controllers/authController";
import { Type } from "@sinclair/typebox";

const adminSchema: FastifySchema = {
	body: Type.Object({
		password: Type.String(),
	}),
	response: {
		200: Type.Object({
			token: Type.String(),
		}),
	},
};

const userSchema: FastifySchema = {
	body: Type.Object({
		idNumber: Type.String(),
	}),
	response: {
		200: Type.Object({
			token: Type.String(),
			userId: Type.Number(),
		}),
	},
};

const authRoutes: FastifyPluginCallback = (fastify, options, done) => {
	// Authenticate admin with a password
	fastify.route({
		method: "POST",
		url: "/admin",
		handler: adminLogin,
		schema: adminSchema,
	});

	// Authenticate user with id number
	fastify.route({
		method: "POST",
		url: "/user",
		handler: userLogin,
		schema: userSchema,
	});

	done();
};

export default authRoutes;
