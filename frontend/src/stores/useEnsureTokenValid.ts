import { useEffect } from "react";

import { parseJwtToken } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";

const useEnsureTokenValid = (redirectTo: string, tokenProperty: string) => {
	const navigate = useNavigate();

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			navigate({ to: redirectTo, replace: true });
			return;
		}

		// Make sure the token is valid with the required data
		const parsedTokenData = parseJwtToken(token);

		if (!parsedTokenData[tokenProperty]) {
			localStorage.removeItem("token");
			navigate({ to: redirectTo, replace: true });
		}
	}, [navigate, redirectTo, tokenProperty]);
};

export default useEnsureTokenValid;
