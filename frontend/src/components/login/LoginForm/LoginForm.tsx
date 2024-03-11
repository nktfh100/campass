import { useState } from "react";

import { setAuthToken } from "@/lib/api/api";
import { APIResponse } from "@/lib/types";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { useNavigate } from "@tanstack/react-router";

import styles from "./LoginForm.module.scss";

export enum LoginFormType {
	Admin = "admin",
	IdNumber = "idNumber",
}

interface BaseProps<T = string> {
	formType: LoginFormType;
	apiFunction: (...args: any[]) => Promise<APIResponse<T>>;
}

interface RedirectProps {
	redirectTo: string;
	successCallback?: never;
}

interface SuccessCallbackProps<T> {
	successCallback: (data: T) => void;
	redirectTo?: never;
}

type LoginFormProps<T> = BaseProps<T> &
	(RedirectProps | SuccessCallbackProps<T>);

export default function LoginForm<T>({
	formType,
	apiFunction,
	successCallback,
	redirectTo,
}: LoginFormProps<T>) {
	const navigate = useNavigate();

	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const handleFormSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
		ev.preventDefault();

		setError("");
		setIsLoading(true);
		const { data, error } = await apiFunction(password, username);

		setIsLoading(false);

		if (data) {
			if (successCallback) {
				successCallback(data as T);
			} else {
				if (typeof data == "string") {
					localStorage.setItem("token", data);
					setAuthToken(data);

					navigate({ to: redirectTo });
				}
			}
		}

		if (error) {
			setError(error);
		}
	};

	return (
		<form onSubmit={handleFormSubmit} className={styles["form"]} dir="rtl">
			<div className={styles["form__inputs"]}>
				{formType == LoginFormType.Admin && (
					<Input
						type="text"
						label="שם משתמש"
						value={username}
						onValueChange={(value: string) => setUsername(value)}
						className={styles["form__username"]}
						isRequired
						autoComplete="username"
						autoCapitalize="off"
					/>
				)}
				<Input
					type={
						formType == LoginFormType.IdNumber ? "text" : "password"
					}
					label={
						formType == LoginFormType.IdNumber
							? "תעודת זהות"
							: "סיסמה"
					}
					value={password}
					onValueChange={(value: string) => setPassword(value)}
					className={styles["form__password"]}
					isRequired
					autoComplete="current-password"
					autoCapitalize="off"
				/>
			</div>
			{error && (
				<p className={`${styles["form__error"]} text-danger`}>
					שגיאה: {error}
				</p>
			)}
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
	);
}
