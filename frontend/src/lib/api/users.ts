import apiClient from "@/lib/api/api";
import { APIResponse, User } from "@/lib/types";

import { ApiPagination } from "../types";

export async function createUser({
	eventId,
	fullName,
	idNumber,
}: {
	eventId: number | string;
	fullName: string;
	idNumber: string;
}): Promise<APIResponse<User>> {
	try {
		const res = await apiClient.post("/users", {
			event_id: eventId,
			full_name: fullName,
			id_number: idNumber,
		});

		const status = res.status;

		if (res.data.user) {
			return { data: res.data.user, status };
		}

		if (res.data.error) {
			return { error: res.data.error, status };
		}

		return { error: "Unknown error creating user", status };
	} catch (error) {
		console.error(error);
		return { error: error + "", status: -1 };
	}
}

export async function editUser({
	userId,
	fullName,
	idNumber,
}: {
	userId: string | number;
	fullName: string;
	idNumber: string;
}): Promise<APIResponse<User>> {
	try {
		const res = await apiClient.patch(`/users/${userId}`, {
			full_name: fullName,
			id_number: idNumber,
		});

		const status = res.status;

		if (res.data.user) {
			return { data: res.data.user, status };
		}

		if (res.data.error) {
			return { error: res.data.error, status };
		}

		return { error: "Unknown error editing user", status };
	} catch (error) {
		console.error(error);
		return { error: error + "", status: -1 };
	}
}

export async function deleteUser(
	userId: string | number
): Promise<APIResponse<boolean>> {
	try {
		const res = await apiClient.delete(`/users/${userId}`);

		const status = res.status;

		if (res.status == 204) {
			return { data: true, status };
		}

		if (res.data.error) {
			return { error: res.data.error, status };
		}

		return { error: "Unknown error deleting user", status };
	} catch (error) {
		console.error(error);
		return { error: error + "", status: -1 };
	}
}

export async function getUsers({
	eventId,
	page,
}: {
	eventId: string | number;
	page: number;
}): Promise<APIResponse<{ users: User[]; pagination: ApiPagination }>> {
	try {
		const res = await apiClient.get("/users", {
			params: { event_id: eventId, page },
		});

		const status = res.status;

		if (res.data.users) {
			return { data: res.data, status };
		}

		if (res.data.error) {
			return { error: res.data.error, status };
		}

		return { error: "Unknown error getting users", status };
	} catch (error) {
		console.error(error);
		return { error: error + "", status: -1 };
	}
}

export type UserWIthEvent = User & {
	event_name: string;
	event_description: string;
	event_welcome_text: string;
	event_invitation_count: number;
};

export async function getUser(
	userId: string | number
): Promise<APIResponse<UserWIthEvent>> {
	try {
		const res = await apiClient.get(`/users/${userId}`);

		const status = res.status;

		if (res.data.user) {
			return { data: res.data.user, status };
		}

		if (res.data.error) {
			return { error: res.data.error, status };
		}

		return { error: "Unknown error getting user", status };
	} catch (error) {
		console.error(error);
		return { error: error + "", status: -1 };
	}
}
