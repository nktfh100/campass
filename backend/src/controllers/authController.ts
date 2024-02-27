import { RouteHandlerMethod } from "fastify";

import config from "@/lib/config";
import { AdminRole, AdminTokenData } from "@/lib/types";

interface AdminLoginBody {
	username: string;
	password: string;
}

export const adminLogin: RouteHandlerMethod = async (request, reply) => {
	const { username, password } = request.body as AdminLoginBody;

	if (username == "admin") {
		if (password === config.adminPassword) {
			const tokenData: AdminTokenData = {
				id: -1,
				role: AdminRole.SuperAdmin,
			};

			const token = request.fastify.jwt.sign(tokenData);
			return { token };
		}
	} else {
		const admin = await request.fastify
			.knex("admins")
			.select("event_id", "id")
			.where("username", username)
			.first();

		if (admin) {
			const hashedPassword = await request.bcryptHash(password);
			const isPasswordCorrect = await request.bcryptCompare(
				password,
				hashedPassword
			);

			if (isPasswordCorrect) {
				const tokenData: AdminTokenData = {
					id: admin.id,
					role: AdminRole.EventAdmin,
					eventId: admin.event_id,
				};

				const token = request.fastify.jwt.sign(tokenData);
				return {
					token,
				};
			}
		}
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
		.select("id")
		.where("id_number", idNumber)
		.first();

	if (user) {
		const token = request.fastify.jwt.sign({
			id: user.id,
		});
		return { token };
	}

	reply.status(401);
	return { error: "Invalid id number" };
};
