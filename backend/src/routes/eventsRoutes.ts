import { FastifyPluginCallback, FastifySchema } from 'fastify';

import {
    createEvent, deleteEvent, getEvent, getEvents, updateEvent
} from '@/controllers/eventsController';
import { AdminRole } from '@/lib/types';
import { Type } from '@sinclair/typebox';

const eventType = Type.Object({
	id: Type.Number(),
	name: Type.String(),
	invitation_count: Type.Number(),
	weapon_form: Type.Optional(Type.String({ nullable: true })),
});

const createEventSchema: FastifySchema = {
	body: Type.Object({
		name: Type.String(),
		invitation_count: Type.Number(),
		weapon_form: Type.Optional(Type.String({ nullable: true })),
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
			weapon_form: Type.String({ nullable: true }),
		})
	),
	response: {
		200: Type.Object({
			event: eventType,
		}),
	},
};

const eventsRoutes: FastifyPluginCallback = (fastify, options, done) => {
	fastify.route({
		method: "POST",
		url: "/",
		handler: createEvent,
		schema: createEventSchema,
		onRequest: fastify.auth([fastify.verifyAdmin(AdminRole.SuperAdmin)]),
	});

	fastify.route({
		method: "GET",
		url: "/",
		handler: getEvents,
		schema: getEventsSchema,
		onRequest: fastify.auth([fastify.verifyAdmin(AdminRole.SuperAdmin)]),
	});

	fastify.route({
		method: "GET",
		url: "/:id",
		handler: getEvent,
		schema: getEventSchema,
		onRequest: fastify.auth([fastify.verifyAdmin(AdminRole.EventAdmin)]),
	});

	fastify.route({
		method: "PATCH",
		url: "/:id",
		handler: updateEvent,
		schema: updateEventSchema,
		onRequest: fastify.auth([fastify.verifyAdmin(AdminRole.SuperAdmin)]),
	});

	fastify.route({
		method: "DELETE",
		url: "/:id",
		handler: deleteEvent,
		onRequest: fastify.auth([fastify.verifyAdmin(AdminRole.SuperAdmin)]),
	});

	done();
};

export default eventsRoutes;
