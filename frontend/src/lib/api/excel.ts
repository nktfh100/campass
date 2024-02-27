import { APIResponse } from "../types";
import apiClient from "./api";

export async function exportGuestsToExcel(
	eventId: number | string
): Promise<APIResponse<Blob>> {
	try {
		const res = await apiClient.get(`/guests/excel-export`, {
			params: {
				event_id: eventId,
			},
			responseType: "blob",
		});

		if (res.status == 200) {
			return { data: res.data, status: res.status };
		}

		if (res.data.error) {
			return { error: res.data.error, status: res.status };
		}

		return { error: "Unknown error exporting guests", status: res.status };
	} catch (error) {
		console.error(error);
		return { error: error + "", status: -1 };
	}
}

export async function uploadUsersExcel(
	eventId: number | string,
	file: File
): Promise<APIResponse<boolean>> {
	try {
		const formData = new FormData();
		formData.append("file", file);

		const res = await apiClient.post(`/users/excel-import`, formData, {
			params: {
				event_id: eventId,
			},
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});

		if (res.status == 204) {
			return { data: true, status: res.status };
		}

		if (res.data.error) {
			return { error: res.data.error, status: res.status };
		}

		return { error: "Unknown error uploading users", status: res.status };
	} catch (error) {
		console.error(error);
		return { error: error + "", status: -1 };
	}
}
