import { FastifyInstance } from "fastify";

import { defaultTestUser } from "@/../seeds/test/testData";
import buildFastify from "@/app";
import config from "@/lib/config";
import setupTestDB from "@/utils/tests/setupTestDB";
import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";

describe("Auth routes", () => {
	let fastify: FastifyInstance;

	beforeAll(async () => {
		return (async () => {
			fastify = await buildFastify({ logger: false });
			await setupTestDB(fastify.knex);
		})();
	});

	afterAll(() => {
		fastify.close();
	});

	test("POST /auth/admin with correct password should return a token", async () => {
		const response = await fastify.inject({
			method: "POST",
			url: "/auth/admin",
			payload: {
				username: "admin",
				password: config.adminPassword,
			},
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toMatchObject({ token: expect.any(String) });
	});

	test("POST /auth/admin with incorrect password should return a 401", async () => {
		const response = await fastify.inject({
			method: "POST",
			url: "/auth/admin",
			payload: {
				username: "admin",
				password: "wrong_password",
			},
		});

		expect(response.statusCode).toBe(401);
	});

	test("POST /auth/admin with missing password/username should return a 400", async () => {
		const response = await fastify.inject({
			method: "POST",
			url: "/auth/admin",
			payload: {},
		});

		expect(response.statusCode).toBe(400);
	});

	test("POST /auth/user with valid id number should return a token", async () => {
		const response = await fastify.inject({
			method: "POST",
			url: "/auth/user",
			payload: {
				idNumber: defaultTestUser.id_number,
			},
		});

		const jsonRes = response.json();

		expect(response.statusCode).toBe(200);
		expect(jsonRes).toMatchObject({ token: expect.any(String) });
	});

	test("POST /auth/user with invalid id number should return a 401", async () => {
		const response = await fastify.inject({
			method: "POST",
			url: "/auth/user",
			payload: {
				idNumber: "invalid_id",
			},
		});

		expect(response.statusCode).toBe(401);
	});

	test("POST /auth/user with missing id number should return a 400", async () => {
		const response = await fastify.inject({
			method: "POST",
			url: "/auth/user",
			payload: {},
		});

		expect(response.statusCode).toBe(400);
	});
});
