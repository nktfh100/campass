import chance from "chance";
import { FastifyInstance } from "fastify";
import { NewUser, User } from "knex/types/tables";

import buildFastify from "@/app";
import {
	getTestSuperAdminToken,
	getTestUserToken,
} from "@/utils/tests/getTokens";
import setupTestDB from "@/utils/tests/setupTestDB";
import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";

import { defaultTestUser } from "../../../seeds/test/testData";

describe("Users routes", () => {
	let fastify: FastifyInstance;
	let adminToken: string;
	let userToken: string;

	beforeAll(async () => {
		return (async () => {
			fastify = await buildFastify({ logger: false });

			await setupTestDB(fastify.knex);

			adminToken = await getTestSuperAdminToken(fastify);
			userToken = await getTestUserToken(fastify);
		})();
	});

	beforeEach(async () => {
		return setupTestDB(fastify.knex);
	});

	afterAll(() => {
		fastify.close();
	});

	test("GET /users/:id by admin should return a user", async () => {
		const response = await fastify.inject({
			method: "GET",
			url: `/users/${defaultTestUser.id}`,
			headers: {
				Authorization: `Bearer ${adminToken}`,
			},
		});

		expect(response.statusCode).toBe(200);
	});

	test("GET /users/:id by user should return his data", async () => {
		const response = await fastify.inject({
			method: "GET",
			url: `/users/${defaultTestUser.id}`,
			headers: {
				Authorization: `Bearer ${userToken}`,
			},
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toMatchObject({ user: defaultTestUser });
	});

	test("GET /users/me should return logged in user data", async () => {
		const response = await fastify.inject({
			method: "GET",
			url: `/users/${defaultTestUser.id}`,
			headers: {
				Authorization: `Bearer ${userToken}`,
			},
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toMatchObject({ user: defaultTestUser });
	});

	test("GET /users/:id by user should return 403 if trying to get someone else's data", async () => {
		const response = await fastify.inject({
			method: "GET",
			url: `/users/2`,
			headers: {
				Authorization: `Bearer ${userToken}`,
			},
		});

		expect(response.statusCode).toBe(403);
	});

	test("GET /users/:id by user should return 404 if user doesn't exist", async () => {
		const response = await fastify.inject({
			method: "GET",
			url: `/users/999`,
			headers: {
				Authorization: `Bearer ${adminToken}`,
			},
		});

		expect(response.statusCode).toBe(404);
	});

	test("GET /users with event_id filter should return only users for that event", async () => {
		const newUserData: NewUser = {
			event_id: 2,
			id_number: chance().ssn(),
			full_name: chance().name(),
		};

		await fastify.knex("users").insert(newUserData);

		const response = await fastify.inject({
			method: "GET",
			url: `/users?event_id=1`,
			headers: {
				Authorization: `Bearer ${adminToken}`,
			},
		});

		const jsonRes = response.json();

		expect(response.statusCode).toBe(200);
		expect(jsonRes.users).toHaveLength(2);
	});

	test("GET /users without token should return 401", async () => {
		const response = await fastify.inject({
			method: "GET",
			url: `/users`,
		});

		expect(response.statusCode).toBe(401);
	});

	test("POST /users by admin should create a user", async () => {
		const newUserData: NewUser = {
			event_id: 1,
			id_number: chance().ssn(),
			full_name: chance().name(),
		};

		const response = await fastify.inject({
			method: "POST",
			url: `/users`,
			headers: {
				Authorization: `Bearer ${adminToken}`,
			},
			payload: newUserData,
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toMatchObject({ user: newUserData });
	});

	test("POST /users without a token should return 401", async () => {
		const response = await fastify.inject({
			method: "POST",
			url: `/users`,
		});

		expect(response.statusCode).toBe(401);
	});

	test("POST /users missing data should return 400", async () => {
		const response = await fastify.inject({
			method: "POST",
			url: `/users`,
			headers: {
				Authorization: `Bearer ${adminToken}`,
			},
			payload: {},
		});

		expect(response.statusCode).toBe(400);
	});

	test("POST /users duplicate id_number should return 409", async () => {
		const newUserData: NewUser = {
			id_number: defaultTestUser.id_number,
			full_name: chance().name(),
			event_id: 1,
		};
		const response = await fastify.inject({
			method: "POST",
			url: `/users`,
			headers: {
				Authorization: `Bearer ${adminToken}`,
			},
			payload: newUserData,
		});

		expect(response.statusCode).toBe(409);
	});

	test("POST /users invalid event_id should return 400", async () => {
		const newUserData: NewUser = {
			id_number: chance().ssn(),
			full_name: chance().name(),
			event_id: 999,
		};
		const response = await fastify.inject({
			method: "POST",
			url: `/users`,
			headers: {
				Authorization: `Bearer ${adminToken}`,
			},
			payload: newUserData,
		});

		expect(response.statusCode).toBe(400);
	});

	test("PATCH /users/:id by admin should update a user", async () => {
		const updateUserData: Partial<User> = {
			full_name: chance().name(),
			id_number: chance().ssn(),
		};

		const response = await fastify.inject({
			method: "PATCH",
			url: `/users/${defaultTestUser.id}`,
			headers: {
				Authorization: `Bearer ${adminToken}`,
			},
			payload: updateUserData,
		});

		const jsonRes = response.json();

		expect(response.statusCode).toBe(200);
		expect(jsonRes).toMatchObject({ user: expect.any(Object) });
		expect(jsonRes.user).toMatchObject(updateUserData);
	});

	test("PATCH /users/:id invalid user id should return 404", async () => {
		const updateUserData: Partial<User> = {
			full_name: chance().name(),
		};

		const response = await fastify.inject({
			method: "PATCH",
			url: `/users/999`,
			headers: {
				Authorization: `Bearer ${adminToken}`,
			},
			payload: updateUserData,
		});

		expect(response.statusCode).toBe(404);
	});

	test("DELETE /users/:id should delete a user with all his guests", async () => {
		const response = await fastify.inject({
			method: "DELETE",
			url: `/users/${defaultTestUser.id}`,
			headers: {
				Authorization: `Bearer ${adminToken}`,
			},
		});

		expect(response.statusCode).toBe(204);

		const guests = await fastify
			.knex("guests")
			.select("id")
			.where("user_id", defaultTestUser.id);

		expect(guests).toHaveLength(0);
	});

	test("DELETE /users/:id without token return 401", async () => {
		const response = await fastify.inject({
			method: "DELETE",
			url: `/users/${defaultTestUser.id}`,
		});

		expect(response.statusCode).toBe(401);
	});
});
