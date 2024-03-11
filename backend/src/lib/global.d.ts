import { onRequestAsyncHookHandler, preHandlerAsyncHookHandler } from "fastify";
import { Knex } from "knex";

import FastifyJwtNamespace from "@fastify/jwt";

import { AdminRole, AdminTokenData, UserTokenData } from "./types";

declare module "fastify" {
	interface FastifyInstance
		extends FastifyJwtNamespace<{ namespace: "security" }> {
		knex: Knex;
		verifyAdmin: (role: AdminRole) => onRequestAsyncHookHandler;
		verifyUser: onRequestAsyncHookHandler;
	}

	interface FastifyRequest {
		fastify: FastifyInstance;
		adminData?: AdminTokenData;
		userData?: UserTokenData;
	}
}

declare module "knex/types/tables" {
	interface Admin {
		id: number;
		event_id: number;
		username: string;
		password: string;
		// role: AdminRole;
		created_at: Date;
	}

	type NewAdmin = Omit<Admin, "id" | "created_at">;

	interface Event {
		id: number;
		name: string;
		invitation_count: number;
		weapon_form?: string;
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
		weapon: boolean;
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
