import { createContext } from "react";

type ActiveAdminContextType = {
	role?: number;
	eventId?: number;
};

const ActiveAdminContext = createContext<ActiveAdminContextType>({
	role: undefined,
	eventId: undefined,
});

export default ActiveAdminContext;
