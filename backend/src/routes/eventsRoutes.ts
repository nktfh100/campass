import { FastifyPluginCallback, FastifySchema } from "fastify";

import {
	createEvent,
	deleteEvent,
	getEvent,
	getEvents,
	updateEvent,
} from "@/controllers/eventsController";
import { Type } from "@sinclair/typebox";

const eventType = Type.Object({
	id: Type.Number(),
	name: Type.String(),
	invitation_count: Type.Number(),
});

const createEventSchema: FastifySchema = {
	body: Type.Object({
		name: Type.String(),
		invitation_count: Type.Number(),
	}),
	response: {
		200: Type.Object({
			event: eventType,
		}),
	},
};

const getEventsSchema: FastifySchema = {
	response: {
		200: Type.Object({
			events: Type.Array(eventType),
		}),
	},
};

const getEventSchema: FastifySchema = {
	response: {
		200: Type.Object({
			event: eventType,
		}),
	},
};

const updateEventSchema: FastifySchema = {
	body: Type.Partial(
		Type.Object({
			name: Type.String(),
			invitation_count: Type.Number(),
		})
	),
	response: {
		200: Type.Object({
			event: eventType,
		}),
	},
};

const eventsRoutes: FastifyPluginCallback = (fastify, options, done) => {
	fastify.addHook("onRequest", fastify.auth([fastify.verifyAdmin]));

	fastify.route({
		method: "POST",
		url: "/",
		handler: createEvent,
		schema: createEventSchema,
	});

	fastify.route({
		method: "GET",
		url: "/",
		handler: getEvents,
		schema: getEventsSchema,
	});

	fastify.route({
		method: "GET",
		url: "/:id",
		handler: getEvent,
		schema: getEventSchema,
	});

	fastify.route({
		method: "PATCH",
		url: "/:id",
		handler: updateEvent,
		schema: updateEventSchema,
	});

	fastify.route({
		method: "DELETE",
		url: "/:id",
		handler: deleteEvent,
	});

	done();
};

export default eventsRoutes;
