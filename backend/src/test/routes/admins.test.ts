import { FastifyInstance } from "fastify";

import buildFastify from "@/app";
import {
	getTestEventAdminToken,
	getTestSuperAdminToken,
	getTestUserToken,
} from "@/utils/tests/getTokens";
import setupTestDB from "@/utils/tests/setupTestDB";

describe("Event Admins routes", () => {
	let fastify: FastifyInstance;
	let adminToken: string;
	let userToken: string;
	let eventAdminToken: string;

	beforeAll(async () => {
		return (async () => {
			fastify = await buildFastify({ logger: false });

			await setupTestDB(fastify.knex);

			adminToken = await getTestSuperAdminToken(fastify);
			userToken = await getTestUserToken(fastify);
			eventAdminToken = await getTestEventAdminToken(fastify);
		})();
	});

	beforeEach(async () => {
		return setupTestDB(fastify.knex);
	});

	afterAll(() => {
		fastify.close();
	});

	test("GET /admins should return all admins", async () => {
		const response = await fastify.inject({
			method: "GET",
			url: "/admins",
			headers: {
				Authorization: `Bearer ${adminToken}`,
			},
		});

		const jsonRes = response.json();

		expect(response.statusCode).toBe(200);
		expect(jsonRes.admins).toHaveLength(1);
	});

	test("GET /admins?event_id=1 should return all admins for event 1", async () => {
		await fastify.knex("events").insert({
			id: 2,
			name: "Test Event 2",
			invitation_count: 3,
		});

		const pass = await fastify.bcrypt.hash("test");
		await fastify.knex("admins").insert({
			event_id: 2,
			username: "test",
			password: pass,
		});

		const response = await fastify.inject({
			method: "GET",
			url: "/admins?event_id=1",
			headers: {
				Authorization: `Bearer ${adminToken}`,
			},
		});

		const jsonRes = response.json();

		expect(response.statusCode).toBe(200);
		expect(jsonRes.admins).toHaveLength(1);
	});

	test("GET /admins without token should return a 401", async () => {
		const response = await fastify.inject({
			method: "GET",
			url: "/admins",
		});

		expect(response.statusCode).toBe(401);
	});

	test("GET /admins with user token should return a 403", async () => {
		const response = await fastify.inject({
			method: "GET",
			url: "/admins",
			headers: {
				Authorization: `Bearer ${userToken}`,
			},
		});

		expect(response.statusCode).toBe(401);
	});

	test("POST /admins should create a new admin", async () => {
		const response = await fastify.inject({
			method: "POST",
			url: "/admins",
			headers: {
				Authorization: `Bearer ${adminToken}`,
			},
			payload: {
				username: "test13",
				event_id: 1,
				password: "test",
			},
		});

		const jsonRes = response.json();

		expect(response.statusCode).toBe(200);
	});

	test("POST /admins without token should return a 401", async () => {
		const response = await fastify.inject({
			method: "POST",
			url: "/admins",
			payload: {
				username: "test13",
				event_id: 1,
				password: "test",
			},
		});

		expect(response.statusCode).toBe(401);
	});

	test("PATCH /admins/:id should update an admin", async () => {
		const updatedAdminData = {
			username: "test13",
			id: 1,
			password: "test",
		};

		const response = await fastify.inject({
			method: "PATCH",
			url: "/admins/1",
			headers: {
				Authorization: `Bearer ${adminToken}`,
			},
			payload: updatedAdminData,
		});

		const jsonRes = response.json();

		expect(response.statusCode).toBe(200);
		expect(jsonRes.admin.username).toBe(updatedAdminData.username);
	});

	test("PATCH /admins/:id with invalid id should return a 404", async () => {
		const updatedAdminData = {
			username: "test13",
		};

		const response = await fastify.inject({
			method: "PATCH",
			url: "/admins/255",
			headers: {
				Authorization: `Bearer ${adminToken}`,
			},
			payload: updatedAdminData,
		});

		expect(response.statusCode).toBe(404);
	});

	test("PATCH /admins/:id with user token should return a 401", async () => {
		const updatedAdminData = {
			username: "test13",
		};

		const response = await fastify.inject({
			method: "PATCH",
			url: "/admins/1",
			headers: {
				Authorization: `Bearer ${userToken}`,
			},
			payload: updatedAdminData,
		});

		expect(response.statusCode).toBe(401);
	});

	test("DELETE /admins/:id should delete an admin", async () => {
		const response = await fastify.inject({
			method: "DELETE",
			url: "/admins/1",
			headers: {
				Authorization: `Bearer ${adminToken}`,
			},
		});

		expect(response.statusCode).toBe(204);
	});

	test("DELETE /admins/:id with user token should return a 401", async () => {
		const response = await fastify.inject({
			method: "DELETE",
			url: "/admins/1",
			headers: {
				Authorization: `Bearer ${userToken}`,
			},
		});

		expect(response.statusCode).toBe(401);
	});

	test("DELETE /admins/:id with event admin token should return a 401", async () => {
		const response = await fastify.inject({
			method: "DELETE",
			url: "/admins/1",
			headers: {
				Authorization: `Bearer ${eventAdminToken}`,
			},
		});

		expect(response.statusCode).toBe(401);
	});

	test("GET /admins/:id should return an admin", async () => {
		const response = await fastify.inject({
			method: "GET",
			url: "/admins/1",
			headers: {
				Authorization: `Bearer ${adminToken}`,
			},
		});

		const jsonRes = response.json();

		expect(response.statusCode).toBe(200);
		expect(jsonRes.admin.id).toBe(1);
	});

	test("GET /admins/:id with user token should return a 401", async () => {
		const response = await fastify.inject({
			method: "GET",
			url: "/admins/1",
			headers: { Authorization: `Bearer ${userToken}` },
		});

		expect(response.statusCode).toBe(401);
	});

	test("GET /admins/:id with invalid id should return a 404", async () => {
		const response = await fastify.inject({
			method: "GET",
			url: "/admins/255",
			headers: {
				Authorization: `Bearer ${adminToken}`,
			},
		});

		expect(response.statusCode).toBe(404);
	});
});
