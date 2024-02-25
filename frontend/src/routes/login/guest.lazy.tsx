import LoginForm, {
	LoginFormType,
} from "@/components/login/LoginForm/LoginForm";
import { getGuest } from "@/lib/api/guests";
import { Guest } from "@/lib/types";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";

import stylesShared from "./loginShared.module.scss";

export const Route = createLazyFileRoute("/login/guest")({
	component: GuestLogin,
});

function GuestLogin() {
	const navigate = useNavigate();

	const successCallback = (data: Guest) => {
		navigate({
			to: "/ticket/$guestId",
			params: { guestId: data.uuid },
		});
	};

	return (
		<div className={stylesShared["login"]}>
			<h2>התחברות אורח</h2>
			<LoginForm
				formType={LoginFormType.IdNumber}
				successCallback={successCallback}
				apiFunction={getGuest}
			/>
		</div>
	);
}
