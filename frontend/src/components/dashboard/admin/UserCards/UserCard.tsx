import { User } from "@/lib/types";
import { Card, CardBody } from "@nextui-org/card";

import styles from "./UserCard.module.scss";

export default function UserCard({
	user,
	onClick,
}: {
	user: User;
	onClick: (user: User) => void;
}) {
	return (
		<Card
			isPressable
			onPress={() => onClick(user)}
			className={styles["card"]}
		>
			<CardBody className={styles["card__body"]}>
				<div>
					<p>{user.full_name}</p>
					<p>{user.id_number}</p>
				</div>
			</CardBody>
		</Card>
	);
}
