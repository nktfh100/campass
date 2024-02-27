import { Knex } from "knex";

import { getRandomHebrewName } from "@/utils/tests/fakeData";
import { getRandomUUID } from "@/utils/utils";

const events = [
	{
		id: 1,
		name: "טקס סיום ביס 90",
		invitation_count: 3,
	},
	{
		id: 2,
		name: 'טקס סיום אפ"מ',
		invitation_count: 3,
	},
];

// Seed data for the dev environment
export async function seed(knex: Knex): Promise<void> {
	await knex("admins").truncate();
	await knex("events").truncate();
	await knex("users").truncate();
	await knex("guests").truncate();

	await knex("events").insert(events);

	await knex("admins").insert({
		id: 1,
		event_id: 1,
		username: "admin1",
		// Password is "admin"
		password:
			"$2a$12$KnhMR829/FRXQwBi9./HueEh52UIn4ia2NMj2lmr.oRkIU0BRo1uG",
	});

	let users = [];

	// Create 50 users for each event
	for (let i = 0; i < 100; i++) {
		const eventId = i % 2 === 0 ? 1 : 2;

		users.push({
			id: i + 1,
			event_id: eventId,
			id_number: `${314082083 + i}`,
			full_name: getRandomHebrewName(),
		});
	}

	users.push({
		id: 999,
		event_id: 1,
		id_number: "000",
		full_name: getRandomHebrewName(),
	});

	await knex("users").insert(users);

	let guests = [];

	let i = 0;
	// Create 3 guests for each user
	for (const user of users) {
		guests.push({
			user_id: user.id,
			event_id: user.event_id,
			relationship: "אבא",
			uuid: getRandomUUID(),
			id_number: `${414082083 + i}`,
			full_name: getRandomHebrewName(),
		});

		i++;
	}

	guests.push({
		user_id: 999,
		event_id: 1,
		relationship: "אמא",
		uuid: getRandomUUID(),
		id_number: "000",
		full_name: getRandomHebrewName(),
	});

	await knex("guests").insert(guests);
}
