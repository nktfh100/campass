import apiClient from "@/lib/api/api";
import { ApiPagination, APIResponse, Guest } from "@/lib/types";

export async function deleteGuest(
	guestUUID: string
): Promise<APIResponse<boolean>> {
	try {
		const res = await apiClient.delete(`/guests/${guestUUID}`);

		const status = res.status;

		if (res.status == 204) {
			return { data: true, status };
		}

		if (res.data.error) {
			return { error: res.data.error, status };
		}

		return { error: "Unknown error deleting guest", status };
	} catch (error) {
		console.error(error);
		return { error: error + "", status: -1 };
	}
}

export async function createGuest({
	fullName,
	idNumber,
	weapon,
	userId,
}: {
	fullName: string;
	idNumber: string;
	weapon: boolean;
	userId?: number | string;
}): Promise<APIResponse<Guest>> {
	try {
		const res = await apiClient.post("/guests", {
			full_name: fullName,
			id_number: idNumber,
			weapon,
			...(userId ? { user_id: userId } : {}),
		});

		const status = res.status;

		if (res.data.guest) {
			return { data: res.data.guest, status };
		}

		if (res.data.error) {
			return { error: res.data.error, status };
		}

		return { error: "Unknown error creating guest", status };
	} catch (error) {
		console.error(error);
		return { error: error + "", status: -1 };
	}
}

export async function editGuest({
	guestUUID,
	fullName,
	idNumber,
	weapon,
}: {
	guestUUID: string;
	fullName: string;
	idNumber: string;
	weapon: boolean;
}): Promise<APIResponse<Guest>> {
	try {
		const res = await apiClient.patch(`/guests/${guestUUID}`, {
			full_name: fullName,
			id_number: idNumber,
			weapon,
		});

		const status = res.status;

		if (res.data.guest) {
			return { data: res.data.guest, status };
		}

		if (res.data.error) {
			return { error: res.data.error, status };
		}

		return { error: "Unknown error editing guest", status };
	} catch (error) {
		console.error(error);
		return { error: error + "", status: -1 };
	}
}

export async function getGuests(): Promise<APIResponse<Guest[]>> {
	try {
		const res = await apiClient.get("/guests");

		const status = res.status;

		if (res.data.guests) {
			return { data: res.data.guests, status };
		}

		if (res.data.error) {
			return { error: res.data.error, status };
		}

		return { error: "Unknown error getting guests", status };
	} catch (error) {
		console.error(error);
		return { error: error + "", status: -1 };
	}
}

export async function getGuestsAdmin(
	eventId: number,
	page: number
): Promise<APIResponse<{ guests: Guest[]; pagination: ApiPagination }>> {
	try {
		const res = await apiClient.get("/guests", {
			params: { event_id: eventId, page },
		});

		const status = res.status;

		if (res.data.guests) {
			return { data: res.data, status };
		}

		if (res.data.error) {
			return { error: res.data.error, status };
		}

		return { error: "Unknown error getting guests", status };
	} catch (error) {
		console.error(error);
		return { error: error + "", status: -1 };
	}
}

export async function getGuestsByUserId(
	userId: number
): Promise<APIResponse<Guest[]>> {
	try {
		const res = await apiClient.get("/guests", {
			params: { user_id: userId },
		});

		const status = res.status;

		if (res.data.guests) {
			return { data: res.data.guests, status };
		}

		if (res.data.error) {
			return { error: res.data.error, status };
		}

		return { error: "Unknown error getting guests", status };
	} catch (error) {
		console.error(error);
		return { error: error + "", status: -1 };
	}
}

type GuestWithEvent = Guest & {
	event_name: string;
	event_description: string;
	event_welcome_text: string;
};

export async function getGuest(
	guestUUID: string,
	scan: boolean = false
): Promise<APIResponse<GuestWithEvent>> {
	try {
		const res = await apiClient.get(`/guests/${guestUUID}`, {
			params: scan && { scan: "true" },
		});

		const status = res.status;

		if (res.data.guest) {
			return { data: res.data.guest, status };
		}

		if (res.data.error) {
			return { error: res.data.error, status };
		}

		return { error: "Unknown error getting guest", status };
	} catch (error) {
		console.error(error);
		return { error: error + "", status: -1 };
	}
}
