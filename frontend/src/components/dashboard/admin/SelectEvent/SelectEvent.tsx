import { useContext } from "react";

import ActiveEventContext from "@/contexts/ActiveEventContext";
import { Event } from "@/lib/types";
import { Select, SelectItem } from "@nextui-org/select";

import styles from "./SelectEvent.module.scss";

export default function SelectEvent({ events }: { events: Event[] }) {
	const { activeEvent, setActiveEvent } = useContext(ActiveEventContext);

	return (
		<Select
			className={styles["select"]}
			label="אירוע:"
			variant="faded"
			placeholder="בחר אירוע"
			selectedKeys={activeEvent ? [activeEvent.id + ""] : []}
			onSelectionChange={(selected: any) => {
				const [first] = selected as Set<string>;
				if (!first) return;

				setActiveEvent(
					events.find((event) => event.id + "" == first) || null
				);
			}}
		>
			{events.map((event) => (
				<SelectItem key={event.id} value={event.id}>
					{event.name}
				</SelectItem>
			))}
		</Select>
	);
}
