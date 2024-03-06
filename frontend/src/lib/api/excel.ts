import { AxiosResponse } from "axios";

import { APIResponse } from "../types";
import { parseJsonBlob } from "../utils";
import apiClient from "./api";

function isJsonResponse(response: AxiosResponse<any>) {
	const contentType = response.headers["content-type"];
	return contentType && contentType.includes("application/json");
}

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

		const status = res.status;

		console.log(res);

		if (res.status == 200) {
			return { data: res.data, status };
		}

		if (isJsonResponse(res)) {
			// Parse the blob as a JSON object (needed because axios response type is set to blob)
			const data = await parseJsonBlob(res.data);

			if (data.error) {
				return { error: data.error, status };
			}
		}

		return { error: "Unknown error exporting guests", status };
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

		const status = res.status;

		if (res.status == 204) {
			return { data: true, status };
		}

		if (res.data.error) {
			return { error: res.data.error, status };
		}

		return { error: "Unknown error uploading users", status };
	} catch (error) {
		console.error(error);
		return { error: error + "", status: -1 };
	}
}
