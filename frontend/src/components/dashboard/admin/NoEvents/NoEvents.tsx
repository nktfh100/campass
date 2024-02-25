import { Button } from "@nextui-org/button";

import styles from "./NoEvents.module.scss";

export default function NoEvents({
	shouldRender,
	handleNewEventBtn,
}: {
	shouldRender: boolean;
	handleNewEventBtn: () => void;
}) {
	if (!shouldRender) {
		return null;
	}

	return (
		<>
			<h1 className={styles["title"]} dir="rtl">
				אין אירועים פתוחים!
			</h1>
			<Button
				className={styles["btn"]}
				onPress={handleNewEventBtn}
				size="lg"
				color="primary"
				variant="shadow"
			>
				יצירת אירוע חדש
			</Button>
		</>
	);
}
