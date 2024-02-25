import { useEffect, useState } from "react";

export default function usePersistedState(key: string) {
	const [state, setState] = useState<string | undefined>(
		(localStorage.getItem(key) as string) || undefined
	);

	useEffect(() => {
		if (!state) {
			return;
		}

		localStorage.setItem(key, state);
	}, [key, state]);

	const clear = () => {
		localStorage.removeItem(key);
		setState(undefined);
	};

	return [state, setState, clear] as const;
}
