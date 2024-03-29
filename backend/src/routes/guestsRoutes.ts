import { FastifyPluginCallback, FastifySchema } from "fastify";

import {
	createGuest,
	deleteGuest,
	exportGuestsExcel,
	getGuestByUUIDOrIdNumber,
	getGuests,
	updateGuest,
} from "@/controllers/guestsController";
import { AdminRole } from "@/lib/types";
import { Type } from "@sinclair/typebox";

const guestType = Type.Object({
	id: Type.Number(),
	user_id: Type.Number(),
	event_id: Type.Number(),
	uuid: Type.String(),
	full_name: Type.String(),
	id_number: Type.String(),
	weapon: Type.Boolean(),
	entered_at: Type.Optional(Type.String()),
});

const createGuestSchema: FastifySchema = {
	body: Type.Object({
		full_name: Type.String(),
		id_number: Type.String(),
		weapon: Type.Optional(Type.Boolean()),
		user_id: Type.Optional(Type.Number()),
	}),
	response: {
		200: Type.Object({
			guest: guestType,
		}),
	},
};

const getGuestsSchema: FastifySchema = {
	querystring: Type.Partial(
		Type.Object({
			page: Type.Number({ default: 1 }),
			limit: Type.Number({ default: 25 }),
			event_id: Type.Optional(Type.Number()),
			user_id: Type.Optional(Type.Number()),
		})
	),
	response: {
		200: Type.Object({
			guests: Type.Array(
				Type.Composite([
					guestType,
					Type.Partial(
						Type.Object({
							user_full_name: Type.String(),
							user_id_number: Type.String(),
						})
					),
				])
			),
			pagination: Type.Optional(
				Type.Object({
					page: Type.Number(),
					pageCount: Type.Number(),
					totalCount: Type.Number(),
				})
			),
		}),
	},
};

const getGuestSchema: FastifySchema = {
	response: {
		200: Type.Object({
			guest: Type.Composite([
				guestType,
				Type.Partial(
					Type.Object({
						event_name: Type.String(),
						event_description: Type.String(),
						event_welcome_text: Type.String(),
					})
				),
			]),
		}),
	},
};

export const updateGuestSchema: FastifySchema = {
	body: Type.Partial(guestType),
	response: {
		200: Type.Object({
			guest: guestType,
		}),
	},
};

export const exportGuestsToExcelSchema: FastifySchema = {
	querystring: Type.Object({
		event_id: Type.Number(),
	}),
};

const guestsRoutes: FastifyPluginCallback = (fastify, options, done) => {
	fastify.route({
		method: "GET",
		url: "/excel-export",
		handler: exportGuestsExcel,
		schema: exportGuestsToExcelSchema,
		onRequest: fastify.auth([fastify.verifyAdmin(AdminRole.EventAdmin)]),
	});

	fastify.route({
		method: "POST",
		url: "/",
		handler: createGuest,
		schema: createGuestSchema,
		onRequest: fastify.auth([
			fastify.verifyUser,
			fastify.verifyAdmin(AdminRole.EventAdmin),
		]),
	});

	fastify.route({
		method: "GET",
		url: "/",
		handler: getGuests,
		schema: getGuestsSchema,
		onRequest: fastify.auth([
			fastify.verifyUser,
			fastify.verifyAdmin(AdminRole.EventAdmin),
		]),
	});

	// Public route (used by scanner page)
	fastify.route({
		method: "GET",
		url: "/:id",
		handler: getGuestByUUIDOrIdNumber,
		schema: getGuestSchema,
	});

	fastify.route({
		method: "PATCH",
		url: "/:uuid",
		handler: updateGuest,
		schema: updateGuestSchema,
		onRequest: fastify.auth([
			fastify.verifyUser,
			fastify.verifyAdmin(AdminRole.EventAdmin),
		]),
	});

	fastify.route({
		method: "DELETE",
		url: "/:uuid",
		handler: deleteGuest,
		onRequest: fastify.auth([
			fastify.verifyUser,
			fastify.verifyAdmin(AdminRole.EventAdmin),
		]),
	});

	done();
};

export default guestsRoutes;
