import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable("guests", (table) => {
		table.increments("id").primary().unique().notNullable();
		table.integer("user_id").notNullable();
		table.integer("event_id").notNullable();
		table.string("uuid").unique().notNullable();
		table.string("full_name").notNullable();
		table.string("id_number").notNullable();
		table.string("relationship").notNullable();
		table.timestamp("entered_at").nullable();
		table.timestamp("created_at").defaultTo(knex.fn.now());
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable("guests");
}
