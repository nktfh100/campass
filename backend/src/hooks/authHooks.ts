import { onRequestAsyncHookHandler } from "fastify";

import { AdminRole, AdminTokenData, UserTokenData } from "@/lib/types";
import { parseAuthHeader } from "@/utils/utils";

export const verifyAdmin: (role: AdminRole) => onRequestAsyncHookHandler = (
	role
) => {
	return async (request) => {
		const token = parseAuthHeader(request.headers.authorization);
		if (!token) {
			throw new Error("No token provided");
		}

		const tokenData = request.fastify.jwt.verify<AdminTokenData>(token);

		if (
			!tokenData.id ||
			tokenData.role == undefined ||
			tokenData.role > role
		) {
			throw new Error("Unauthorized!");
		}

		request.adminData = tokenData;

		return;
	};
};

export const verifyUser: onRequestAsyncHookHandler = async (request) => {
	const token = parseAuthHeader(request.headers.authorization);
	if (!token) {
		throw new Error("No token provided");
	}

	const tokenData = request.fastify.jwt.verify<
		UserTokenData & AdminTokenData
	>(token);
	if (!tokenData.id) {
		throw new Error("Invalid token");
	}

	// Token is for an admin
	if (tokenData.role) {
		throw new Error("Unauthorized!");
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
		id: tokenData.id,
	};

	return;
};
