import { createContext } from "react";

import { Admin } from "@/lib/types";

type AdminsContextType = {
	admins: Admin[];
	setAdmins: (users: Admin[] | ((prevUsers: Admin[]) => Admin[])) => void;
};

const AdminsContext = createContext<AdminsContextType>({
	admins: [],
	setAdmins: () => {},
});

export default AdminsContext;
