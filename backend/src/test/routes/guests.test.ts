import chance from "chance";
import { FastifyInstance } from "fastify";
import { Guest, NewGuest } from "knex/types/tables";

import { defaultTestGuest } from "@/../seeds/test/testData";
import buildFastify from "@/app";
import {
	getTestEventAdminToken,
	getTestSuperAdminToken,
	getTestUserToken,
} from "@/utils/tests/getTokens";
import setupTestDB from "@/utils/tests/setupTestDB";
import { getRandomUUID } from "@/utils/utils";
import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";

describe("Guests routes", () => {
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

	test("GET /guests/:id with UUID should return a guest (public route)", async () => {
		const response = await fastify.inject({
			method: "GET",
			url: `/guests/${defaultTestGuest.uuid}`,
		});

		const jsonRes = response.json();

		expect(response.statusCode).toBe(200);
		expect(jsonRes).toMatchObject({ guest: expect.any(Object) });
		expect(jsonRes.guest).toMatchObject(defaultTestGuest);
	});

	test("GET /guests/:id with id number should return a guest (public route)", async () => {
		const response = await fastify.inject({
			method: "GET",
			url: `/guests/${defaultTestGuest.id_number}`,
		});

		const jsonRes = response.json();

		expect(response.statusCode).toBe(200);
		expect(jsonRes).toMatchObject({ guest: expect.any(Object) });
		expect(jsonRes.guest).toMatchObject(defaultTestGuest);
	});

	test("GET /guests/:id with invalid uuid should return 404", async () => {
		const response = await fastify.inject({
			method: "GET",
			url: `/guests/invalid_uuid`,
		});

		expect(response.statusCode).toBe(404);
	});

	test("GET /guests/:id as scanner should update guest entered_at", async () => {
		const response = await fastify.inject({
			method: "GET",
			url: `/guests/${defaultTestGuest.uuid}?scan=true`,
		});

		expect(response.statusCode).toBe(200);

		const guest = await fastify
			.knex("guests")
			.select("*")
			.where("uuid", defaultTestGuest.uuid)
			.first();
		if (!guest) throw new Error("Guest not found");

		expect(guest.entered_at).toBeTruthy();
	});

	test("GET /guests by admin should return all guests", async () => {
		const response = await fastify.inject({
			method: "GET",
			url: "/guests",
			headers: {
				authorization: `Bearer ${adminToken}`,
			},
		});

		const jsonRes = response.json();

		expect(response.statusCode).toBe(200);
		expect(jsonRes).toMatchObject({ guests: expect.any(Array) });
		expect(jsonRes.guests.length).toBeGreaterThan(1);
		expect(jsonRes.pagination).toMatchObject({
			page: 1,
			pageCount: 1,
			totalCount: 2,
		});
	});

	test("GET /guests by admin with event_id should return only guests for that event", async () => {
		const newGuestData: NewGuest = {
			user_id: 1,
			event_id: 2,
			uuid: getRandomUUID(),
			full_name: chance().name(),
			id_number: chance().ssn({ dashes: false }),
			weapon: chance().bool(),
		};

		await fastify.knex("guests").insert(newGuestData);

		const response = await fastify.inject({
			method: "GET",
			url: "/guests?event_id=1",
			headers: {
				authorization: `Bearer ${adminToken}`,
			},
		});

		const jsonRes = response.json();

		expect(response.statusCode).toBe(200);
		expect(jsonRes.guests.length).toBe(2);
	});

	test("GET /guests by user should return only the user's guests", async () => {
		const response = await fastify.inject({
			method: "GET",
			url: "/guests",
			headers: {
				authorization: `Bearer ${userToken}`,
			},
		});

		const jsonRes = response.json();

		expect(response.statusCode).toBe(200);
		expect(jsonRes).toMatchObject({ guests: expect.any(Array) });
		expect(jsonRes.guests.length).toBe(1);
		expect(jsonRes.guests[0]).toMatchObject(defaultTestGuest);
	});

	test("GET /guests by admin with user_id should return only the user's guests", async () => {
		const response = await fastify.inject({
			method: "GET",
			url: "/guests?user_id=1",
			headers: {
				authorization: `Bearer ${adminToken}`,
			},
		});

		const jsonRes = response.json();

		expect(response.statusCode).toBe(200);
		expect(jsonRes).toMatchObject({ guests: expect.any(Array) });
		expect(jsonRes.guests.length).toBe(1);
	});

	test("GET /guests by event admin should return only the event's guests", async () => {
		const response = await fastify.inject({
			method: "GET",
			url: "/guests",
			headers: {
				authorization: `Bearer ${eventAdminToken}`,
			},
		});

		const jsonRes = response.json();

		expect(response.statusCode).toBe(200);
		expect(jsonRes).toMatchObject({ guests: expect.any(Array) });
		expect(jsonRes.guests.length).toBe(2);
	});

	test("GET /guests without token should return 401", async () => {
		const response = await fastify.inject({
			method: "GET",
			url: "/guests",
		});

		expect(response.statusCode).toBe(401);
	});

	test("GET /guests when no guests exist should return empty array", async () => {
		await fastify.knex("guests").del();

		const response = await fastify.inject({
			method: "GET",
			url: "/guests",
			headers: {
				authorization: `Bearer ${adminToken}`,
			},
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toMatchObject({ guests: [] });
	});

	test("POST /guests by user should create a guest", async () => {
		const newGuestData: NewGuest = {
			full_name: chance().name(),
			id_number: chance().ssn({ dashes: false }),
			weapon: chance().bool(),
		};

		const response = await fastify.inject({
			method: "POST",
			url: "/guests",
			headers: {
				authorization: `Bearer ${userToken}`,
			},
			payload: newGuestData,
		});
		const jsonRes = response.json();

		expect(response.statusCode).toBe(200);
		expect(jsonRes).toMatchObject({ guest: expect.any(Object) });
		expect(jsonRes.guest).toMatchObject(newGuestData);
	});

	test("POST /guests by admin should create a guest", async () => {
		const newGuestData: NewGuest = {
			full_name: chance().name(),
			id_number: chance().ssn({ dashes: false }),
			weapon: chance().bool(),
			user_id: 1,
		};

		const response = await fastify.inject({
			method: "POST",
			url: "/guests",
			headers: {
				authorization: `Bearer ${adminToken}`,
			},
			payload: newGuestData,
		});
		const jsonRes = response.json();

		expect(response.statusCode).toBe(200);
		expect(jsonRes).toMatchObject({ guest: expect.any(Object) });
		expect(jsonRes.guest).toMatchObject(newGuestData);
	});

	test("POST /guests without user_id by admin should return 400", async () => {
		const newGuestData: NewGuest = {
			id_number: chance().ssn({ dashes: false }),
			full_name: chance().name(),
			weapon: chance().bool(),
		};

		const response = await fastify.inject({
			method: "POST",
			url: "/guests",
			headers: {
				authorization: `Bearer ${adminToken}`,
			},
			payload: newGuestData,
		});

		expect(response.statusCode).toBe(400);
	});

	test("POST /guests with invalid event_id should return 400", async () => {
		// This really should not happen
		await fastify.knex("users").update({ event_id: 555 }).where("id", 1);

		const newGuestData: NewGuest = {
			user_id: 1,
			uuid: getRandomUUID(),
			full_name: chance().name(),
			id_number: chance().ssn({ dashes: false }),
			weapon: chance().bool(),
		};

		const response = await fastify.inject({
			method: "POST",
			url: "/guests",
			headers: {
				authorization: `Bearer ${userToken}`,
			},
			payload: newGuestData,
		});

		expect(response.statusCode).toBe(400);
	});

	test("POST /guests duplicate id_number should return 409", async () => {
		const response = await fastify.inject({
			method: "POST",
			url: "/guests",
			headers: {
				authorization: `Bearer ${userToken}`,
			},
			payload: {
				id_number: defaultTestGuest.id_number,
				full_name: chance().name(),
				weapon: chance().bool(),
			},
		});

		expect(response.statusCode).toBe(409);
	});

	test("POST /guests by admin with invalid user_id should return 400", async () => {
		const response = await fastify.inject({
			method: "POST",
			url: "/guests",
			headers: {
				authorization: `Bearer ${adminToken}`,
			},
			payload: {
				id_number: chance().ssn({ dashes: false }),
				full_name: chance().name(),
				weapon: chance().bool(),
				user_id: 999,
			},
		});

		expect(response.statusCode).toBe(400);
	});

	test("POST /guests make sure user has not exceeded the maximum number of guests", async () => {
		// Add maxGuestCount guests
		for (let i = 0; i < 5; i++) {
			const newGuestData: NewGuest = {
				user_id: 1,
				event_id: 1,
				uuid: getRandomUUID(),
				full_name: chance().name(),
				id_number: chance().ssn({ dashes: false }),
				weapon: chance().bool(),
			};
			await fastify.knex("guests").insert(newGuestData);
		}

		const response = await fastify.inject({
			method: "POST",
			url: "/guests",
			headers: {
				authorization: `Bearer ${userToken}`,
			},
			payload: {
				id_number: chance().ssn({ dashes: false }),
				full_name: chance().name(),
				weapon: chance().bool(),
			},
		});

		expect(response.statusCode).toBe(403);
	});

	test("POST /guests without token should return 401", async () => {
		const response = await fastify.inject({
			method: "POST",
			url: "/guests",
			payload: {},
		});

		expect(response.statusCode).toBe(401);
	});

	test("POST /guests with missing data should return 400", async () => {
		const response = await fastify.inject({
			method: "POST",
			url: "/guests",
			headers: {
				authorization: `Bearer ${userToken}`,
			},
			payload: {},
		});

		expect(response.statusCode).toBe(400);
	});

	test("PATCH /guests/:uuid by user should return updated guest", async () => {
		const updatedGuestData: Partial<Guest> = {
			full_name: chance().name(),
			id_number: chance().ssn({ dashes: false }),
			weapon: chance().bool(),
		};

		const response = await fastify.inject({
			method: "PATCH",
			url: `/guests/${defaultTestGuest.uuid}`,
			headers: {
				authorization: `Bearer ${userToken}`,
			},
			payload: updatedGuestData,
		});
		const jsonRes = response.json();

		expect(response.statusCode).toBe(200);
		expect(jsonRes).toMatchObject({ guest: expect.any(Object) });
		expect(jsonRes.guest).toMatchObject(updatedGuestData);
	});

	test("PATCH /guests/:uuid by admin should return updated guest", async () => {
		const updatedGuestData: Partial<Guest> = {
			full_name: chance().name(),
			id_number: chance().ssn({ dashes: false }),
			weapon: chance().bool(),
		};

		const response = await fastify.inject({
			method: "PATCH",
			url: `/guests/${defaultTestGuest.uuid}`,
			headers: {
				authorization: `Bearer ${adminToken}`,
			},
			payload: updatedGuestData,
		});
		const jsonRes = response.json();

		expect(response.statusCode).toBe(200);
		expect(jsonRes).toMatchObject({ guest: expect.any(Object) });
		expect(jsonRes.guest).toMatchObject(updatedGuestData);
	});

	test("PATCH /guests/:uuid without token should return 401", async () => {
		const response = await fastify.inject({
			method: "PATCH",
			url: `/guests/${defaultTestGuest.uuid}`,
			payload: {},
		});

		expect(response.statusCode).toBe(401);
	});

	test("PATCH /guests/:uuid with invalid token should return 401", async () => {
		const response = await fastify.inject({
			method: "PATCH",
			url: `/guests/${defaultTestGuest.uuid}`,
			headers: {
				authorization: `Bearer invalid_token`,
			},
			payload: {},
		});

		expect(response.statusCode).toBe(401);
	});

	test("PATCH /guests/:uuid with missing data should return 400", async () => {
		const response = await fastify.inject({
			method: "PATCH",
			url: `/guests/${defaultTestGuest.uuid}`,
			headers: {
				authorization: `Bearer ${userToken}`,
			},
			payload: {},
		});

		expect(response.statusCode).toBe(400);
	});

	test("PATCH /guests/:uuid with invalid uuid should return 404", async () => {
		const response = await fastify.inject({
			method: "PATCH",
			url: `/guests/invalid_uuid`,
			headers: {
				authorization: `Bearer ${userToken}`,
			},
			payload: {
				full_name: chance().name(),
			},
		});

		expect(response.statusCode).toBe(404);
	});

	test("PATCH /guests/:uuid user should not be able to update other users guests", async () => {
		const uuid = getRandomUUID();
		const newGuestData: NewGuest = {
			user_id: 3,
			event_id: 1,
			uuid,
			full_name: chance().name(),
			id_number: chance().ssn({ dashes: false }),
			weapon: chance().bool(),
		};
		await fastify.knex("guests").insert(newGuestData);

		const response = await fastify.inject({
			method: "PATCH",
			url: `/guests/${uuid}`,
			headers: {
				authorization: `Bearer ${userToken}`,
			},
			payload: {
				full_name: chance().name(),
			},
		});

		expect(response.statusCode).toBe(403);
	});

	test("PATCH /guests/:uuid event admin should not be able to update other events guests", async () => {
		const uuid = getRandomUUID();
		const newGuestData: NewGuest = {
			user_id: 1,
			event_id: 2,
			uuid,
			full_name: chance().name(),
			id_number: chance().ssn({ dashes: false }),
			weapon: chance().bool(),
		};
		await fastify.knex("guests").insert(newGuestData);

		const response = await fastify.inject({
			method: "PATCH",
			url: `/guests/${uuid}`,
			headers: {
				authorization: `Bearer ${eventAdminToken}`,
			},
			payload: {
				full_name: chance().name(),
			},
		});

		expect(response.statusCode).toBe(403);
	});

	test("DELETE /guests/:uuid by admin should return 204", async () => {
		const response = await fastify.inject({
			method: "DELETE",
			url: `/guests/${defaultTestGuest.uuid}`,
			headers: {
				authorization: `Bearer ${adminToken}`,
			},
		});

		expect(response.statusCode).toBe(204);
	});

	test("DELETE /guests/:uuid by user should return 204", async () => {
		const response = await fastify.inject({
			method: "DELETE",
			url: `/guests/${defaultTestGuest.uuid}`,
			headers: {
				authorization: `Bearer ${userToken}`,
			},
		});

		expect(response.statusCode).toBe(204);
	});

	test("DELETE /guests/:uuid without token should return 401", async () => {
		const response = await fastify.inject({
			method: "DELETE",
			url: `/guests/${defaultTestGuest.uuid}`,
		});

		expect(response.statusCode).toBe(401);
	});

	test("DELETE /guests/:uuid with invalid uuid should return 404", async () => {
		const response = await fastify.inject({
			method: "DELETE",
			url: `/guests/invalid_uuid`,
			headers: {
				authorization: `Bearer ${adminToken}`,
			},
		});

		expect(response.statusCode).toBe(404);
	});

	test("DELETE /guests/:uuid user should not be able to delete other users guests", async () => {
		const uuid = getRandomUUID();
		const newGuestData: NewGuest = {
			user_id: 3,
			event_id: 1,
			uuid,
			full_name: chance().name(),
			id_number: chance().ssn({ dashes: false }),
			weapon: chance().bool(),
		};
		await fastify.knex("guests").insert(newGuestData);

		const response = await fastify.inject({
			method: "DELETE",
			url: `/guests/${uuid}`,
			headers: {
				authorization: `Bearer ${userToken}`,
			},
		});

		expect(response.statusCode).toBe(403);
	});

	test("DELETE /guests/:uuid event admin should not be able to delete other events guests", async () => {
		const uuid = getRandomUUID();
		const newGuestData: NewGuest = {
			user_id: 1,
			event_id: 2,
			uuid,
			full_name: chance().name(),
			id_number: chance().ssn({ dashes: false }),
			weapon: chance().bool(),
		};
		await fastify.knex("guests").insert(newGuestData);

		const response = await fastify.inject({
			method: "DELETE",
			url: `/guests/${uuid}`,
			headers: {
				authorization: `Bearer ${eventAdminToken}`,
			},
		});

		expect(response.statusCode).toBe(403);
	});
});
