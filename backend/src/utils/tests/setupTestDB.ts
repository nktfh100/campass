import { Knex } from "knex";

export default async function setupTestDB(knex: Knex) {
	await knex.migrate.rollback({}, true);

	await knex.migrate.latest();

	await knex.seed.run();
}
