import { Admin, APIResponse } from "@/lib/types";

import apiClient from "./api";

export async function getAdmins(
	eventId: string | number
): Promise<APIResponse<Admin[]>> {
	try {
		const res = await apiClient.get(`/admins?event_id=${eventId}`);

		const status = res.status;

		if (res.data.admins) {
			return { data: res.data.admins, status };
		}

		if (res.data.error) {
			return { error: res.data.error, status };
		}

		return { error: "Unknown error creating event", status };
	} catch (error) {
		console.error(error);
		return { error: error + "", status: -1 };
	}
}

export async function createAdmin({
	eventId,
	username,
	password,
}: {
	eventId: number | string;
	username: string;
	password: string;
}): Promise<APIResponse<Admin>> {
	try {
		const res = await apiClient.post("/admins", {
			event_id: eventId,
			username,
			password,
		});

		const status = res.status;

		if (res.data.admin) {
			return { data: res.data.admin, status };
		}

		if (res.data.error) {
			return { error: res.data.error, status };
		}

		return { error: "Unknown error creating admin", status };
	} catch (error) {
		console.error(error);
		return { error: error + "", status: -1 };
	}
}

export async function editAdmin({
	adminId,
	username,
	password,
}: {
	adminId: number | string;
	username?: string;
	password?: string;
}): Promise<APIResponse<Admin>> {
	try {
		const res = await apiClient.patch(`/admins/${adminId}`, {
			username,
			...(password ? { password } : {}),
		});

		const status = res.status;

		if (res.data.admin) {
			return { data: res.data.admin, status };
		}

		if (res.data.error) {
			return { error: res.data.error, status };
		}

		return { error: "Unknown error editing admin", status };
	} catch (error) {
		console.error(error);
		return { error: error + "", status: -1 };
	}
}

export async function deleteAdmin(
	adminId: number | string
): Promise<APIResponse<boolean>> {
	try {
		const res = await apiClient.delete(`/admins/${adminId}`);

		const status = res.status;

		if (res.status == 204) {
			return { data: true, status };
		}

		if (res.data.error) {
			return { error: res.data.error, status };
		}

		return { error: "Unknown error deleting admin", status };
	} catch (error) {
		console.error(error);
		return { error: error + "", status: -1 };
	}
}
