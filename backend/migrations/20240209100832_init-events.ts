import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable("events", (table) => {
		table.increments("id").primary().unique().notNullable();
		table.string("name").notNullable();
		table.integer("invitation_count").defaultTo(3);
		table.timestamp("created_at").defaultTo(knex.fn.now());
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable("events");
}
