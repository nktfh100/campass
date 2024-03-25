import { useContext, useMemo } from "react";

import ActiveAdminContext from "@/contexts/ActiveAdminContext";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { Link } from "@nextui-org/link";

import stylesShared from "./AdminTabShared.module.scss";
import styles from "./HelpTab.module.scss";

export default function HelpTab() {
	const { role } = useContext(ActiveAdminContext);

	// This is needed since the accordion component does not support dynamic items directly
	const accordionItems = useMemo(() => {
		const items = [
			<AccordionItem key="1" aria-label="מטרת המערכת" title="מטרת המערכת">
				<p>
					מטרת מערכת campass היא ייעול תהליך הזמנת והכנסת אורחים
					לאירועים שונים. המערכת מאפשרת כניסה קלה ונוחה של אורחים
					באמצעות הסמארטפון.
				</p>
			</AccordionItem>,
			<AccordionItem
				key="2"
				aria-label="אופן השימוש במערכת"
				title="אופן השימוש במערכת"
			>
				<p>שלבי השימוש במערכת:</p>
				<ol className={styles["ol"]}>
					<li>
						אחראי המערכת יוצר אירוע חדש ומוסיף את האחראי אירוע
						כמפקד.
					</li>
					<li>המפקד מכניס למערכת את כל המוזמנים.</li>
					<li>המוזמנים מכניסים למערכת את כל האורחים שלהם.</li>
					<li>
						ביום של האירוע, האורחים מציגים את הכרטיס כניסה שלהם לשג,
						השג סורק את הכרטיס ומכניס אותם.
					</li>
					<li>בסיום האירוע יש למחוק אותו מהמערכת.</li>
				</ol>
			</AccordionItem>,

			<AccordionItem key="4" aria-label="מוזמנים" title="מוזמנים">
				<p>
					המוזמנים הם האנשים שמכניסים את הפרטים על האורחים שלהם בתוך
					המערכת.
				</p>
				<p>(לדוגמא בטקס סיום קורס זה החניכים)</p>
				<br />
				<p>
					מוזמנים נכנסים למערכת באמצעות תעודת הזהות שלהם שהוכנסה על
					ידי אחראי האירוע.
				</p>
				<br />
				<p>
					את המוזמנים אפשר להכניס עם קובץ אקסל עם 2 עמודות: שם ותעודת
					זהות.
				</p>
			</AccordionItem>,
			<AccordionItem key="5" aria-label="אורחים" title="אורחים">
				<p>
					האורחים הם האנשים שמגיעים לאירוע ומקבלים כרטיס כניסה
					דיגיטלי.
				</p>
				<br />
				<p>
					אורחים נכנסים למערכת באמצעות תעודת הזהות שלהם שהוכנסה על ידי
					המוזמן, ומקבלים כרטיס כניסה דיגיטלי.
				</p>
			</AccordionItem>,
		];

		if (role === 0) {
			items.splice(
				2,
				0,
				<AccordionItem key="3" aria-label="מפקדים" title="מפקדים">
					<p>המפקדים הם בעצם המשתמשי אדמין לאירוע ספציפי.</p>
					<p>המפקד הוא מי שיכניס למערכת את המוזמנים לאירוע שלו.</p>
				</AccordionItem>
			);
		}

		return items;
	}, [role]);

	return (
		<div dir="rtl" className={`fade-in ${stylesShared["tab-content"]}`}>
			<h2>מדריך שימוש למערכת campass</h2>
			<h3>
				מערכת נוצרה על ידי:{" "}
				<Link href="https://github.com/nktfh100" target="_blank">
					<h3>מלאכי</h3>
				</Link>
			</h3>
			<Accordion variant="splitted">{accordionItems}</Accordion>
		</div>
	);
}
