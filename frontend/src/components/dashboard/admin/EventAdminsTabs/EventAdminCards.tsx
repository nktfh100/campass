import { useContext } from "react";

import AdminsContext from "@/contexts/AdminsContext";
import { Admin } from "@/lib/types";
import { Spinner } from "@nextui-org/spinner";

import EventAdminCard from "./EventAdminCard";
import styles from "./EventAdminCards.module.scss";

export default function EventAdminCards({
	isLoading,
	onAdminClick,
}: {
	isLoading: boolean;
	onAdminClick: (admin: Admin) => void;
}) {
	const { admins } = useContext(AdminsContext);

	return (
		<div className={styles["container"]}>
			{isLoading && <Spinner className={styles["spinner"]} />}
			{!isLoading && (
				<div className={styles["cards"]}>
					{admins.map((admin) => (
						<EventAdminCard
							key={admin.id}
							admin={admin}
							onClick={onAdminClick}
						/>
					))}
				</div>
			)}
		</div>
	);
}
