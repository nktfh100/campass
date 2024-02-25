import buildFastify from "./app";
import config from "./lib/config";

async function main() {
	const fastify = await buildFastify();
	try {
		console.log("Starting server...");
		console.log(`Environment: ${config.nodeEnv}`);
		await fastify.listen({ port: config.port, host: "0.0.0.0" });
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
}

main();
