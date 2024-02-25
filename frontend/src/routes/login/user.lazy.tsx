import LoginForm, {
	LoginFormType,
} from "@/components/login/LoginForm/LoginForm";
import { userAuth } from "@/lib/api/auth";
import { createLazyFileRoute } from "@tanstack/react-router";

import stylesShared from "./loginShared.module.scss";

export const Route = createLazyFileRoute("/login/user")({
	component: UserLogin,
});

function UserLogin() {
	return (
		<div className={stylesShared["login"]}>
			<h2>התחברות מזמין</h2>
			<LoginForm
				formType={LoginFormType.IdNumber}
				apiFunction={userAuth}
				redirectTo="/dashboard/user"
			/>
		</div>
	);
}
