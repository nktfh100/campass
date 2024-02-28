export interface Admin {
	id: number;
	event_id: number;
	username: string;
	role: number;
	created_at: string;
}

export interface Event {
	id: number;
	name: string;
	invitation_count: number;
	weapon_form?: string;
	created_at: string;
}

export interface User {
	id: number;
	event_id: number;
	id_number: string;
	full_name: string;
	created_at: string;
}

export interface Guest {
	id: number;
	user_id: number;
	event_id: number;
	uuid: string;
	full_name: string;
	id_number: string;
	weapon: boolean;
	created_at: string;
	entered_at: string;

	user_full_name?: string;
	user_id_number?: string;
}

export interface ApiPagination {
	page: number;
	pageCount: number;
	totalCount: number;
}

export enum ModalType {
	EDIT,
	NEW,
}

interface BaseAPIResponse {
	status: number;
}

interface APIResponseSuccess<T> {
	data: T;
	error?: never;
}

interface APIResponseError {
	error: string;
	data?: never;
}

export type APIResponse<T> = BaseAPIResponse &
	(APIResponseSuccess<T> | APIResponseError);
