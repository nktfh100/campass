import apiClient from '@/lib/api/api';
import { APIResponse, Event } from '@/lib/types';

export async function createEvent({
	name,
	invitationCount,
	weaponForm,
}: {
	name: string;
	invitationCount: number;
	weaponForm?: string;
}): Promise<APIResponse<Event>> {
	try {
		const res = await apiClient.post("/events", {
			name,
			invitation_count: invitationCount,
			...(weaponForm ? { weapon_form: weaponForm } : {}),
		});

		const status = res.status;

		if (res.data.event) {
			return { data: res.data.event, status };
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

export async function editEvent({
	eventId,
	name,
	invitationCount,
	weaponForm,
}: {
	eventId: number | string;
	name: string;
	invitationCount: number;
	weaponForm?: string;
}): Promise<APIResponse<Event>> {
	try {
		const res = await apiClient.patch(`/events/${eventId}`, {
			name,
			invitation_count: invitationCount,
			...(weaponForm ? { weapon_form: weaponForm } : {}),
		});

		const status = res.status;

		if (res.data.event) {
			return { data: res.data.event, status };
		}

		if (res.data.error) {
			return { error: res.data.error, status };
		}

		return { error: "Unknown error editing event", status };
	} catch (error) {
		console.error(error);
		return { error: error + "", status: -1 };
	}
}

export async function deleteEvent(
	eventId: string | number
): Promise<APIResponse<boolean>> {
	try {
		const res = await apiClient.delete(`/events/${eventId}`);

		const status = res.status;

		if (res.status == 204) {
			return { data: true, status };
		}

		if (res.data.error) {
			return { error: res.data.error, status };
		}

		return { error: "Unknown error deleting event", status };
	} catch (error) {
		console.error(error);
		return { error: error + "", status: -1 };
	}
}

export async function getEvents(): Promise<APIResponse<Event[]>> {
	try {
		const res = await apiClient.get("/events");

		const status = res.status;

		if (res.data.events) {
			return { data: res.data.events, status };
		}

		if (res.data.error) {
			return { error: res.data.error, status };
		}

		return { error: "Unknown error getting events", status };
	} catch (error) {
		console.error(error);
		return { error: error + "", status: -1 };
	}
}

export async function getEvent(
	eventId: string | number
): Promise<APIResponse<Event>> {
	try {
		const res = await apiClient.get(`/events/${eventId}`);

		const status = res.status;

		if (res.data.event) {
			return { data: res.data.event, status };
		}

		if (res.data.error) {
			return { error: res.data.error, status };
		}

		return { error: "Unknown error getting event", status };
	} catch (error) {
		console.error(error);
		return { error: error + "", status: -1 };
	}
}
