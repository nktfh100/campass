import { v4 as uuidv4 } from "uuid";

export function getRandomUUID() {
	return uuidv4();
}

// https://github.com/stephenmathieson/node-parse-bearer-token
export function parseAuthHeader(authHeader: string | undefined): string | null {
	if (!authHeader) {
		return null;
	}

	const parts = authHeader.split(" ");
	if (parts.length < 2) {
		return null;
	}

	const schema = (parts.shift() as string).toLowerCase();
	if (schema !== "bearer") {
		return null;
	}

	return parts.join(" ");
}
