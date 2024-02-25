import { FastifyInstance } from "fastify";

import { defaultTestUser } from "@/../seeds/test/testData";
import config from "@/lib/config";

export async function getTestAdminToken(fastify: FastifyInstance) {
	const response = await fastify.inject({
		method: "POST",
		url: "/auth/admin",
		payload: {
			password: config.adminPassword,
		},
	});
	const jsonRes = response.json();

	if (response.statusCode !== 200 || !jsonRes.token) {
		throw new Error("Failed to get test admin token");
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

	if (response.statusCode !== 200 || !jsonRes.token) {
		throw new Error("Failed to get test user token");
	}

	return jsonRes.token;
}
