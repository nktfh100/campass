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
			<CardBody className={styles["card__body"]}>
				<p>{guest.full_name}</p>
				<p>{guest.id_number}</p>
				<p>{guest.relationship}</p>
			</CardBody>
		</Card>
	);
}
