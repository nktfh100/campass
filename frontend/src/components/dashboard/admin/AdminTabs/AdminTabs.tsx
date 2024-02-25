import { useContext } from "react";

import ActiveEventContext from "@/contexts/ActiveEventContext";
import { Tab, Tabs } from "@nextui-org/tabs";

import styles from "./AdminTabs.module.scss";
import GuestsTab from "./GuestsTab";
import UsersTab from "./UsersTab";

export default function AdminTabs() {
	const { activeEvent } = useContext(ActiveEventContext);
	if (!activeEvent) return null;

	return (
		<Tabs color="primary" size="lg">
			<Tab key="users" title="משתמשים" className={styles["tab"]}>
				<UsersTab event={activeEvent} />
			</Tab>
			<Tab key="guests" title="אורחים" className={styles["tab"]}>
				<GuestsTab event={activeEvent} />
			</Tab>
		</Tabs>
	);
}
