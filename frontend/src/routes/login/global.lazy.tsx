import { useState } from "react";

import { Button } from "@nextui-org/button";
import { Checkbox } from "@nextui-org/checkbox";
import { Input } from "@nextui-org/input";
import { createLazyFileRoute } from "@tanstack/react-router";

import styles from "./global.module.scss";
import stylesShared from "./loginShared.module.scss";

export const Route = createLazyFileRoute("/login/global")({
	component: GlobalLogin,
});

// WIP test component
function GlobalLogin() {
	const [isLoading, _setIsLoading] = useState(false);

	const [isAdmin, setIsAdmin] = useState(false);

	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	// useEffect(() => {
	// 	const token = localStorage.getItem("token");
	// 	if (token) {
	// 		setAuthToken(token);
	// 		navigate({ to: "/dashboard/admin", replace: true });
	// 	}
	// }, [navigate]);

	return (
		<div className={stylesShared["login"]}>
			<h2>התחברות למערכת</h2>
			<form
				// onSubmit={handleFormSubmit}
				className={styles["form"]}
				dir="rtl"
			>
				<div className={styles["form__inputs"]}>
					<Input
						type="text"
						label={isAdmin ? "שם משתמש" : "תעודת זהות"}
						value={username}
						onValueChange={(value: string) => setUsername(value)}
						className={styles["form__username"]}
						isRequired
						autoComplete="off"
						autoCapitalize="off"
					/>
					{isAdmin && (
						<Input
							type={"password"}
							label={"סיסמה"}
							value={password}
							onValueChange={(value: string) =>
								setPassword(value)
							}
							className={styles["form__password"]}
							isRequired
							autoComplete="off"
							autoCapitalize="off"
						/>
					)}
					<Checkbox
						checked={isAdmin}
						onValueChange={() => setIsAdmin(!isAdmin)}
					>
						אני מפקד
					</Checkbox>
				</div>
				{/* {error && (
					<p className={`${styles["form__error"]} text-danger`}>
						שגיאה: {error}
					</p>
				)} */}
				<Button
					color="primary"
					variant="shadow"
					size="lg"
					type="submit"
					isLoading={isLoading}
				>
					התחברות
				</Button>
			</form>
		</div>
	);
}
