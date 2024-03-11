import { RouteHandlerMethod } from "fastify";

import { AdminRole } from "@/lib/types";
import { Static, Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

const eventType = Type.Object({
	name: Type.String(),
	description: Type.String(),
	invitation_count: Type.Number(),
	weapon_form: Type.String({ nullable: true }),
});

type newEventBodyType = Static<typeof eventType>;

export const createEvent: RouteHandlerMethod = async (request) => {
	const { knex } = request.fastify;
	const newEventData = Value.Clean(
		eventType,
		request.body
	) as newEventBodyType;

	const [event] = await knex("events").insert(newEventData).returning("*");

	return { event };
};

export const getEvents: RouteHandlerMethod = async (request) => {
	const { knex } = request.fastify;
	const events = await knex("events").select("*");
	return { events };
};

export const getEvent: RouteHandlerMethod = async (request, reply) => {
	const { knex } = request.fastify;
	const { id } = request.params as { id: string };
	const event = await knex("events").select("*").where("id", id).first();

	if (
		request.adminData!.role != AdminRole.SuperAdmin &&
		id != request.adminData!.eventId + ""
	) {
		reply.status(403);
		return;
	}

	if (!event) {
		reply.status(404);
		return;
	}

	return { event };
};

export const updateEvent: RouteHandlerMethod = async (request, reply) => {
	const { knex } = request.fastify;
	const { id } = request.params as { id: string };
	const newEventData = Value.Clean(
		eventType,
		request.body
	) as newEventBodyType;

	const [event] = await knex("events")
		.update(newEventData)
		.where("id", id)
		.returning("*");

	return { event };
};

export const deleteEvent: RouteHandlerMethod = async (request, reply) => {
	const { knex } = request.fastify;
	const { id } = request.params as { id: string };

	await knex("events").delete().where("id", id);

	// Delete all admins for this event
	await knex("admins").delete().where("event_id", id);

	// Delete all guests for this event
	await knex("guests").delete().where("event_id", id);

	// Delete all users for this event
	await knex("users").delete().where("event_id", id);

	reply.status(204);
	return;
};
