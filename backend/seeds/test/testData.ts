import { Knex } from "knex";
import { Event, Guest, User } from "knex/types/tables";

export const defaultTestEvent: Omit<Event, "created_at"> = {
	id: 1,
	name: "Test Event",
	invitation_count: 3,
};

export const defaultTestUser: Omit<User, "created_at"> = {
	id: 1,
	event_id: 1,
	id_number: "314085483",
	full_name: "Johnny Doe",
};

export const defaultTestGuest: Omit<Guest, "created_at" | "entered_at"> = {
	id: 1,
	user_id: 1,
	event_id: 1,
	uuid: "c2a0f8c9-3d6b-4e1e-9c2e-2a6d0d7c4f1d",
	full_name: "John Doe",
	id_number: "414055484",
	relationship: "father",
};

// Seed data for the test environment
export async function seed(knex: Knex): Promise<void> {
	await knex("events").truncate();
	await knex("users").truncate();
	await knex("guests").truncate();

	await knex("events").insert(defaultTestEvent);
	await knex("users").insert(defaultTestUser);
	await knex("guests").insert(defaultTestGuest);

	await knex("users").insert({
		id: 2,
		event_id: 1,
		id_number: "314085484",
		full_name: "Jane Doe",
	});

	await knex("guests").insert({
		id: 2,
		user_id: 2,
		event_id: 1,
		uuid: "c2a0f8c9-3d6b-4e1e-9c2e-2a6d0d7c4f1e",
		full_name: "Jane Doe",
		id_number: "414055485",
		relationship: "mother",
	});
}
