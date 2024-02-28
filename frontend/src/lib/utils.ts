export function parseJwtToken(token: string): { [key: string]: string } {
	try {
		const base64Url = token.split(".")[1];
		const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split("")
				.map(
					(c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
				)
				.join("")
		);

		return JSON.parse(jsonPayload);
	} catch (error) {
		console.error(error);
		return {};
	}
}

export function scrollToTop() {
	window.scrollTo(0, 0);
}
