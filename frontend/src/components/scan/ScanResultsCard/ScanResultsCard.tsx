import { motion } from 'framer-motion';

import { Guest } from '@/lib/types';
import { Card, CardBody } from '@nextui-org/card';

import styles from './ScanResultsCard.module.scss';

export default function ScanResultsCard({
	error,
	guest,
	loaderFinishedCallback,
}: {
	error: string | null;
	guest: Guest | null;
	loaderFinishedCallback: () => void;
}) {
	if (!error && !guest) {
		return null;
	}

	return (
		<Card
			className={`${styles["card"]} ${error ? styles["card--error"] : styles["card--success"]}`}
		>
			<CardBody className={styles["card__body"]} dir="rtl">
				<p className={styles["card__header"]}>
					{error ? "שגיאה" : "מאושר"}
				</p>

				{error && <p>{error}</p>}

				{guest && (
					<>
						<p>שם: {guest?.full_name}</p>
						<p>תעודת זהות: {guest?.id_number}</p>
					</>
				)}
			</CardBody>
			<motion.div
				key={error + "" + guest?.id}
				initial={{ width: "100%" }}
				animate={{ width: "0%" }}
				onAnimationComplete={loaderFinishedCallback}
				transition={{ duration: 45, ease: "linear" }}
				className={styles["card__loading-bar"]}
			/>
		</Card>
	);
}
