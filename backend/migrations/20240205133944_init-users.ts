import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable("users", (table) => {
		table.increments("id").primary().unique().notNullable();
		table.integer("event_id").notNullable();
		table.string("id_number").notNullable();
		table.string("full_name").notNullable();
		table.timestamp("created_at").defaultTo(knex.fn.now());
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable("users");
}
