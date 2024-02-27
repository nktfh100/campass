import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable("admins", (table) => {
		table.increments("id").primary().unique().notNullable();
		table.integer("event_id").notNullable();
		table.string("username").notNullable();
		table.string("password").notNullable();
		table.timestamp("created_at").defaultTo(knex.fn.now());
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable("admins");
}
