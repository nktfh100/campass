import type { Knex } from "knex";

const migrations = {
	tableName: "knex_migrations",
	directory: "./migrations",
};

const config: { [key: string]: Knex.Config } = {
	development: {
		useNullAsDefault: true,
		client: "better-sqlite3",
		connection: {
			filename: "./database/dev.sqlite3",
		},
		seeds: {
			directory: "./seeds/dev",
		},
		migrations,
	},

	test: {
		useNullAsDefault: true,
		client: "better-sqlite3",
		connection: {
			filename: ":memory:",
		},
		migrations,
		seeds: {
			directory: "./seeds/test",
		},
	},

	// staging: {
	// 	useNullAsDefault: true,
	// 	client: "better-sqlite3",
	// 	connection: {
	// 		filename: "./database/staging.sqlite3",
	// 	},
	// 	migrations: {
	// 		tableName: "knex_migrations",
	// 		directory: "./migrations",
	// 	},
	// 	seeds: {
	// 		directory: "./seeds/staging",
	// 	},
	// },

	production: {
		useNullAsDefault: true,

		client: "better-sqlite3",
		connection: {
			filename: "./database/production.sqlite3",
		},
		migrations,
		seeds: {
			directory: "./seeds/production",
		},
	},
};

export default config;
