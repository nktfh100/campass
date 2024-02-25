import { APIResponse } from "../types";
import apiClient from "./api";

export async function adminAuth(
	password: string
): Promise<APIResponse<string>> {
	try {
		const res = await apiClient.post("/auth/admin", {
			password,
		});

		const status = res.status;

		if (res.data.token) {
			return { data: res.data.token, status };
		}

		if (res.data.error) {
			return { error: res.data.error, status };
		}

		return { error: "Unknown error", status };
	} catch (error) {
		console.error(error);
		return { error: error + "", status: -1 };
	}
}

export async function userAuth(idNumber: string): Promise<APIResponse<string>> {
	try {
		const res = await apiClient.post("/auth/user", {
			idNumber,
		});

		const status = res.status;

		if (res.data.token) {
			return { data: res.data.token, status };
		}

		if (res.data.error) {
			return { error: res.data.error, status };
		}

		return { error: "Unknown error", status };
	} catch (error) {
		console.error(error);
		return { error: error + "", status: -1 };
	}
}
