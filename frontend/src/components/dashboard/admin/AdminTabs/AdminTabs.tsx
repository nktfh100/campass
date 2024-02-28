import { useContext, useEffect, useState } from 'react';

import ActiveEventContext from '@/contexts/ActiveEventContext';
import { Tab, Tabs } from '@nextui-org/tabs';
import { useNavigate, useSearch } from '@tanstack/react-router';

import styles from './AdminTabs.module.scss';
import EventAdminsTab from './EventAdminsTabs';
import GuestsTab from './GuestsTab';
import UsersTab from './UsersTab';

export default function AdminTabs({
	showAdminsTab = true,
}: {
	showAdminsTab: boolean;
}) {
	const navigate = useNavigate();

	const { tab } = useSearch({
		strict: false,
	}) as { tab?: string };

	const [activeTab, setActiveTab] = useState<string>(tab || "users");

	useEffect(() => {
		if (tab == activeTab) return;

		navigate({
			search: (prev: any) => ({ ...prev, tab: activeTab }),
		} as any);
	}, [activeTab, navigate, tab]);

	const { activeEvent } = useContext(ActiveEventContext);
	if (!activeEvent) return null;

	return (
		<Tabs
			color="primary"
			size="lg"
			selectedKey={activeTab}
			onSelectionChange={(key) => setActiveTab(key as string)}
		>
			{showAdminsTab && (
				<Tab key="admins" title="מפקדים" className={styles["tab"]}>
					<EventAdminsTab event={activeEvent} />
				</Tab>
			)}
			<Tab key="users" title="מזמינים" className={styles["tab"]}>
				<UsersTab event={activeEvent} />
			</Tab>
			<Tab key="guests" title="אורחים" className={styles["tab"]}>
				<GuestsTab event={activeEvent} />
			</Tab>
		</Tabs>
	);
}
