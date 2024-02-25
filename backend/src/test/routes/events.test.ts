import chance from "chance";
import { FastifyInstance } from "fastify";
import { NewEvent } from "knex/types/tables";

import buildFastify from "@/app";
import { getTestAdminToken } from "@/utils/tests/getTokens";
import setupTestDB from "@/utils/tests/setupTestDB";

import { defaultTestEvent } from "../../../seeds/test/testData";

describe("Events routes", () => {
	let fastify: FastifyInstance;
	let adminToken: string;

	beforeAll(async () => {
		return (async () => {
			fastify = await buildFastify({ logger: false });

			await setupTestDB(fastify.knex);

			adminToken = await getTestAdminToken(fastify);
		})();
	});

	beforeEach(async () => {
		return setupTestDB(fastify.knex);
	});

	afterAll(() => {
		fastify.close();
	});

	test("POST /events should create an event", async () => {
		const newEventData: NewEvent = {
			name: chance().name(),
			invitation_count: chance().integer({ min: 1, max: 10 }),
		};

		const response = await fastify.inject({
			method: "POST",
			url: "/events",
			headers: {
				Authorization: `Bearer ${adminToken}`,
			},
			payload: newEventData,
		});

		const jsonRes = JSON.parse(response.payload);

		expect(response.statusCode).toBe(200);
		expect(jsonRes.event).toMatchObject(newEventData);
	});

	test("POST /events should return 401 if not authenticated", async () => {
		const newEventData: NewEvent = {
			name: chance().name(),
			invitation_count: chance().integer({ min: 1, max: 10 }),
		};

		const response = await fastify.inject({
			method: "POST",
			url: "/events",
			payload: newEventData,
		});

		expect(response.statusCode).toBe(401);
	});

	test("POST /events should return 400 if missing data", async () => {
		const response = await fastify.inject({
			method: "POST",
			url: "/events",
			headers: {
				Authorization: `Bearer ${adminToken}`,
			},
			payload: {},
		});

		expect(response.statusCode).toBe(400);
	});

	test("GET /events should return a list of events", async () => {
		const response = await fastify.inject({
			method: "GET",
			url: "/events",
			headers: {
				Authorization: `Bearer ${adminToken}`,
			},
		});

		const jsonRes = JSON.parse(response.payload);

		expect(response.statusCode).toBe(200);
		expect(jsonRes.events).toHaveLength(1);
		expect(jsonRes.events[0]).toMatchObject(defaultTestEvent);
	});

	test("GET /events/:id should return an event", async () => {
		const response = await fastify.inject({
			method: "GET",
			url: `/events/${defaultTestEvent.id}`,
			headers: {
				Authorization: `Bearer ${adminToken}`,
			},
		});

		const jsonRes = JSON.parse(response.payload);

		expect(response.statusCode).toBe(200);
		expect(jsonRes.event).toMatchObject(defaultTestEvent);
	});

	test("GET /events/:id should return 404 if event not found", async () => {
		const response = await fastify.inject({
			method: "GET",
			url: `/events/999`,
			headers: {
				Authorization: `Bearer ${adminToken}`,
			},
		});

		expect(response.statusCode).toBe(404);
	});

	test("PATCH /events/:id should update an event", async () => {
		const updateData: Partial<NewEvent> = {
			name: chance().name(),
			invitation_count: chance().integer({ min: 1, max: 10 }),
		};

		const response = await fastify.inject({
			method: "PATCH",
			url: `/events/${defaultTestEvent.id}`,
			headers: {
				Authorization: `Bearer ${adminToken}`,
			},
			payload: updateData,
		});

		const jsonRes = JSON.parse(response.payload);

		expect(response.statusCode).toBe(200);
		expect(jsonRes.event).toMatchObject({
			...defaultTestEvent,
			...updateData,
		});
	});

	test("DELETE /events/:id should delete an event with all the guests and users", async () => {
		const response = await fastify.inject({
			method: "DELETE",
			url: `/events/${defaultTestEvent.id}`,
			headers: {
				Authorization: `Bearer ${adminToken}`,
			},
		});

		expect(response.statusCode).toBe(204);

		const users = await fastify
			.knex("users")
			.select("id")
			.where("event_id", defaultTestEvent.id);
		expect(users).toHaveLength(0);

		const guests = await fastify
			.knex("guests")
			.select("id")
			.where("event_id", defaultTestEvent.id);
		expect(guests).toHaveLength(0);
	});
});
