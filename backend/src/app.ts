import Fastify, { FastifyServerOptions } from "fastify";

import knexConfig from "@/../knexfile";
import { verifyAdmin, verifyUser } from "@/hooks/authHooks";
import config from "@/lib/config";
import fastifyKnexPlugin from "@/lib/fastifyKnexPlugin";
import authRoutes from "@/routes/authRoutes";
import eventsRoutes from "@/routes/eventsRoutes";
import guestsRoutes from "@/routes/guestsRoutes";
import usersRoutes from "@/routes/usersRoutes";
import fastifyAuth from "@fastify/auth";
import cors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";

export default async function buildFastify(
	extraOpts?: Partial<FastifyServerOptions>
) {
	const fastify = Fastify({
		logger: true,
		trustProxy: true,
		...extraOpts,
	}).withTypeProvider<TypeBoxTypeProvider>();

	fastify.get("/", async (request) => {
		return "API is up!";
	});

	// Add fastify instance to the request object
	fastify.decorateRequest("fastify", null);
	fastify.addHook("onRequest", async (request) => {
		request.fastify = fastify;
	});

	// Register plugins
	await fastify.register(fastifyKnexPlugin, knexConfig[config.nodeEnv]);

	await fastify.register(cors, {
		origin: config.frontendUrl || "*",
		credentials: true,
	});

	await fastify.register(fastifyJwt, {
		secret: config.jwtSecret!,
	});

	fastify.decorate("verifyAdmin", verifyAdmin);
	fastify.decorate("verifyUser", verifyUser);
	await fastify.register(fastifyAuth);

	// Register routes
	await fastify.register(authRoutes, { prefix: "/auth" });
	await fastify.register(eventsRoutes, { prefix: "/events" });
	await fastify.register(usersRoutes, { prefix: "/users" });
	await fastify.register(guestsRoutes, { prefix: "/guests" });

	return fastify;
}
