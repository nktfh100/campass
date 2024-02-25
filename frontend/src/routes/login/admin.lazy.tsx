import { useEffect } from "react";

import LoginForm, {
	LoginFormType,
} from "@/components/login/LoginForm/LoginForm";
import { setAuthToken } from "@/lib/api/api";
import { adminAuth } from "@/lib/api/auth";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";

import stylesShared from "./loginShared.module.scss";

export const Route = createLazyFileRoute("/login/admin")({
	component: AdminLogin,
});

function AdminLogin() {
	const navigate = useNavigate();

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			setAuthToken(token);
			navigate({ to: "/dashboard/admin", replace: true });
		}
	}, [navigate]);

	return (
		<div className={stylesShared["login"]}>
			<h2>התחברות מפקד</h2>
			<LoginForm
				formType={LoginFormType.Password}
				apiFunction={adminAuth}
				redirectTo="/dashboard/admin"
			/>
		</div>
	);
}
