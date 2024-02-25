import { onRequestAsyncHookHandler } from "fastify";

import { parseAuthHeader } from "@/utils/utils";

export const verifyAdmin: onRequestAsyncHookHandler = async (request) => {
	const token = parseAuthHeader(request.headers.authorization);
	if (!token) {
		throw new Error("No token provided");
	}

	const tokenData = request.fastify.jwt.verify<{ admin: boolean }>(token);
	if (!tokenData.admin) {
		throw new Error("Unauthorized!");
	}

	request.admin = true;

	return;
};

export const verifyUser: onRequestAsyncHookHandler = async (request) => {
	const token = parseAuthHeader(request.headers.authorization);
	if (!token) {
		throw new Error("No token provided");
	}

	const tokenData = request.fastify.jwt.verify<{ id: string }>(token);
	if (!tokenData.id) {
		throw new Error("Invalid token");
	}

	// Make sure the user exists
	const userData = await request.fastify
		.knex("users")
		.select("id")
		.where("id", tokenData.id)
		.first();

	if (!userData) {
		throw new Error("User not found");
	}

	request.userData = {
		id: userData.id,
	};

	return;
};
