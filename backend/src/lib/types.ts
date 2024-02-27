export enum AdminRole {
	SuperAdmin,
	EventAdmin,
}

export interface AdminTokenData {
	id: number;
	role: AdminRole;
	eventId?: number;
}

export interface UserTokenData {
	id: number;
}
