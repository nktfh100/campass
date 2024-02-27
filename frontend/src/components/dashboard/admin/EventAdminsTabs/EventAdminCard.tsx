import { Admin } from "@/lib/types";
import { Card, CardBody } from "@nextui-org/card";

import styles from "./EventAdminCard.module.scss";

export default function EventAdminCard({
	admin,
	onClick,
}: {
	admin: Admin;
	onClick: (admin: Admin) => void;
}) {
	return (
		<Card
			isPressable
			onPress={() => onClick(admin)}
			className={styles["card"]}
		>
			<CardBody className={styles["card__body"]}>
				<p>{admin.username}</p>
			</CardBody>
		</Card>
	);
}
