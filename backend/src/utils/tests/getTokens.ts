import { FastifyInstance } from "fastify";

import {
	defaultTestEventAdmin,
	defaultTestUser,
} from "@/../seeds/test/testData";
import config from "@/lib/config";

export async function getTestSuperAdminToken(fastify: FastifyInstance) {
	const response = await fastify.inject({
		method: "POST",
		url: "/auth/admin",
		payload: {
			username: "admin",
			password: config.adminPassword,
		},
	});
	const jsonRes = response.json();

	if (response.statusCode !== 200 || !jsonRes.token) {
		throw new Error("Failed to get test admin token");
	}

	return response.json().token;
}

export async function getTestEventAdminToken(fastify: FastifyInstance) {
	const response = await fastify.inject({
		method: "POST",
		url: "/auth/admin",
		payload: {
			username: defaultTestEventAdmin.username,
			password: defaultTestEventAdmin.password,
		},
	});
	const jsonRes = response.json();

	if (response.statusCode !== 200 || !jsonRes.token) {
		throw new Error("Failed to get test event admin token");
	}

	return response.json().token;
}

export async function getTestUserToken(fastify: FastifyInstance) {
	const response = await fastify.inject({
		method: "POST",
		url: "/auth/user",
		payload: {
			idNumber: defaultTestUser.id_number,
		},
	});
	const jsonRes = response.json();

	if (response.statusCode != 200 || !jsonRes.token) {
		throw new Error("Failed to get test user token");
	}

	return jsonRes.token;
}
