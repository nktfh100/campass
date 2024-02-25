import { RouteHandlerMethod } from "fastify";

import config from "@/lib/config";

interface AdminLoginBody {
	password: string;
}

export const adminLogin: RouteHandlerMethod = async (request, reply) => {
	const { password } = request.body as AdminLoginBody;

	if (password === config.adminPassword) {
		const token = request.fastify.jwt.sign({ admin: true });
		return { token };
	}

	reply.status(401);
	return { error: "Invalid password" };
};

interface UserLoginBody {
	idNumber: string;
}

export const userLogin: RouteHandlerMethod = async (request, reply) => {
	const { idNumber } = request.body as UserLoginBody;

	const user = await request.fastify
		.knex("users")
		.select("event_id", "id")
		.where("id_number", idNumber)
		.first();

	if (user) {
		const token = request.fastify.jwt.sign({
			id: user.id,
			eventId: user.event_id,
		});
		return { token, userId: user.id };
	}

	reply.status(401);
	return { error: "Invalid id number" };
};
