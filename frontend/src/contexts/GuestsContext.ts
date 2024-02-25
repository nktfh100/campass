import { createContext } from "react";

import { Guest } from "@/lib/types";

type GuestsContextType = {
	guests: Guest[];
	setGuests: (Guests: Guest[] | ((prevGuests: Guest[]) => Guest[])) => void;
};

const GuestsContext = createContext<GuestsContextType>({
	guests: [],
	setGuests: () => {},
});

export default GuestsContext;
