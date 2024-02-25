import axios, { AxiosInstance } from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

if (!backendUrl) {
	throw new Error("VITE_BACKEND_URL is not set!");
}

const apiClient: AxiosInstance = axios.create({
	baseURL: backendUrl,
	headers: {
		"Content-Type": "application/json",
	},
	validateStatus: () => true, // To not throw on non-2xx status codes
});

export function setAuthToken(token: string): void {
	localStorage.setItem("token", token);
	apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

const savedToken = localStorage.getItem("token");

if (savedToken) {
	setAuthToken(savedToken);
}

export default apiClient;
