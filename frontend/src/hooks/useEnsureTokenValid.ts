import { useEffect, useState } from "react";

import { parseJwtToken } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";

interface BaseTokenData {
	id?: number;
}

type TokenData<T> = BaseTokenData & T;

const useEnsureTokenValid = <T>(
	redirectTo: string,
	tokenProperty: string
): TokenData<T> => {
	const navigate = useNavigate();

	const [tokenData, setTokenData] = useState<TokenData<T>>(
		{} as TokenData<T>
	);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			navigate({ to: redirectTo, replace: true });
			return;
		}

		// Make sure the token is valid with the required data
		const parsedTokenData = parseJwtToken(token) as TokenData<T>;
		if (
			parsedTokenData[tokenProperty as keyof TokenData<T>] === undefined
		) {
			localStorage.removeItem("token");
			navigate({ to: redirectTo, replace: true });
			return;
		}

		setTokenData(parsedTokenData);
	}, [navigate, redirectTo, tokenProperty]);

	return tokenData;
};

export default useEnsureTokenValid;
