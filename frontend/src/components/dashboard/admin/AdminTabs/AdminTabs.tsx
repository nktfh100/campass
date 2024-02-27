import { useContext } from "react";

import ActiveEventContext from "@/contexts/ActiveEventContext";
import { Tab, Tabs } from "@nextui-org/tabs";

import styles from "./AdminTabs.module.scss";
import EventAdminsTab from "./EventAdminsTabs";
import GuestsTab from "./GuestsTab";
import UsersTab from "./UsersTab";

export default function AdminTabs({
	showAdminsTab = true,
}: {
	showAdminsTab: boolean;
}) {
	const { activeEvent } = useContext(ActiveEventContext);
	if (!activeEvent) return null;

	return (
		<Tabs color="primary" size="lg">
			{showAdminsTab && (
				<Tab key="admins" title="מפקדים" className={styles["tab"]}>
					<EventAdminsTab event={activeEvent} />
				</Tab>
			)}
			<Tab key="users" title="משתמשים" className={styles["tab"]}>
				<UsersTab event={activeEvent} />
			</Tab>
			<Tab key="guests" title="אורחים" className={styles["tab"]}>
				<GuestsTab event={activeEvent} />
			</Tab>
		</Tabs>
	);
}
