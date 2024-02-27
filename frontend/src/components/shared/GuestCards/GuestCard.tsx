import { Guest } from "@/lib/types";
import { Card, CardBody } from "@nextui-org/card";

import styles from "./GuestCard.module.scss";

export default function GuestCard({
	guest,
	onClick,
}: {
	guest: Guest;
	onClick: (guest: Guest) => void;
}) {
	return (
		<Card
			isPressable
			onPress={() => onClick(guest)}
			className={styles["card"]}
		>
			<CardBody className={styles["card__body"]} dir="rtl">
				<p>{guest.full_name}</p>
				<p>{guest.id_number}</p>
				<p>נשק: {guest.weapon ? "כן" : "לא"}</p>
			</CardBody>
		</Card>
	);
}
