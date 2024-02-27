import LoginForm, {
	LoginFormType,
} from "@/components/login/LoginForm/LoginForm";
import { adminAuth } from "@/lib/api/auth";
import { createLazyFileRoute } from "@tanstack/react-router";

import stylesShared from "./loginShared.module.scss";

export const Route = createLazyFileRoute("/login/admin")({
	component: AdminLogin,
});

function AdminLogin() {
	// useEffect(() => {
	// 	const token = localStorage.getItem("token");
	// 	if (token) {
	// 		setAuthToken(token);
	// 		navigate({ to: "/dashboard/admin", replace: true });
	// 	}
	// }, [navigate]);

	return (
		<div className={stylesShared["login"]}>
			<h2>התחברות מפקד</h2>
			<LoginForm
				formType={LoginFormType.Admin}
				redirectTo="/dashboard/admin"
				apiFunction={adminAuth}
			/>
		</div>
	);
}
