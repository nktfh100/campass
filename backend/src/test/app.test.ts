import { FastifyInstance } from "fastify";

import buildFastify from "@/app";
import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";

describe("App", () => {
	let fastify: FastifyInstance;

	beforeAll(async () => {
		fastify = await buildFastify({ logger: false });
	});

	afterAll(() => {
		fastify.close();
	});

	test('requests the "/" route', async () => {
		const response = await fastify.inject({
			method: "GET",
			url: "/",
		});

		expect(response.statusCode).toBe(200);
	});
});
