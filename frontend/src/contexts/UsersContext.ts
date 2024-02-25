import { createContext } from "react";

import { User } from "@/lib/types";

type UsersContextType = {
	users: User[];
	setUsers: (users: User[] | ((prevUsers: User[]) => User[])) => void;
};

const UsersContext = createContext<UsersContextType>({
	users: [],
	setUsers: () => {},
});

export default UsersContext;
