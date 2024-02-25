import { Button } from "@nextui-org/button";
import { createLazyFileRoute, Link } from "@tanstack/react-router";

import styles from "./index.module.scss";

export const Route = createLazyFileRoute("/")({
	component: Index,
});

function Index() {
	return (
		<div className={styles["buttons"]}>
			<Link to="/login/user">
				<Button color="primary" variant="shadow" size="lg">
					הזמנת אורחים
				</Button>
			</Link>
			<Link to="/login/guest">
				<Button color="primary" variant="shadow" size="lg">
					כניסת אורח
				</Button>
			</Link>
			<Link to="/login/admin">
				<Button color="primary" variant="shadow" size="lg">
					כניסת מפקד
				</Button>
			</Link>
			<Link to="/scan">
				<Button color="primary" variant="shadow" size="lg">
					סורק
				</Button>
			</Link>
		</div>
	);
}
