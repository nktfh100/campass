import { onRequestAsyncHookHandler, preHandlerAsyncHookHandler } from "fastify";
import { Knex } from "knex";

import FastifyJwtNamespace from "@fastify/jwt";

declare module "fastify" {
	interface FastifyInstance
		extends FastifyJwtNamespace<{ namespace: "security" }> {
		knex: Knex;
		verifyAdmin: onRequestAsyncHookHandler;
		verifyUser: onRequestAsyncHookHandler;
	}

	interface FastifyRequest {
		fastify: FastifyInstance;
		admin?: boolean;
		userData?: {
			id: number;
		};
	}
}

declare module "knex/types/tables" {
	interface Event {
		id: number;
		name: string;
		invitation_count: number;
		created_at: Date;
	}

	type NewEvent = Omit<Event, "id" | "created_at">;

	interface User {
		id: number;
		event_id: number;
		id_number: string;
		full_name: string;
		created_at: Date;
	}

	type NewUser = Omit<User, "id" | "created_at">;

	interface Guest {
		id: number;
		user_id: number;
		event_id: number;
		uuid: string;
		full_name: string;
		id_number: string;
		relationship: string;
		entered_at: Date;
		created_at: Date;
	}

	type NewGuest = Omit<
		Partial<Guest, "user_id">,
		"id" | "event_id" | "uuid" | "entered_at" | "created_at" | "entered_at"
	>;

	interface Tables {
		// This is same as specifying `knex<User>('users')`
		events: Event;
		users: User;
		guests: Guest;
	}
}
