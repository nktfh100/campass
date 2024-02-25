import { createContext } from "react";

import { Event } from "@/lib/types";

type ActiveEventContextType = {
	activeEvent: Event | null;
	setActiveEvent: (event: Event | null) => void;
};

const ActiveEventContext = createContext<ActiveEventContextType>({
	activeEvent: null,
	setActiveEvent: () => {},
});

export default ActiveEventContext;
