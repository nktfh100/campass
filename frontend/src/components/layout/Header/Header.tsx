import { Link } from "@tanstack/react-router";

import styles from "./Header.module.scss";

export default function Header() {
	return (
		<Link to="/" className={styles["logo"]}>
			<img src="/logo.svg" />
		</Link>
	);
}
