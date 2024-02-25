import { FastifyPluginCallback } from "fastify";
import fp from "fastify-plugin";
import knex, { Knex as knexType } from "knex";

const knexPlugin: FastifyPluginCallback<knexType.Config> = (
	fastify,
	options,
	done
) => {
	if (!fastify.knex) {
		const knex_ = knex(options);
		fastify.decorate("knex", knex_);

		fastify.addHook("onClose", (fastify, done) => {
			if (fastify.knex === knex_) {
				fastify.knex.destroy(done);
			}
		});
	}

	done();
};

export default fp(knexPlugin, { name: "fastify-knex" });
