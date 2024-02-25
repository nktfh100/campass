import { MdAdd } from "react-icons/md";

import { Button } from "@nextui-org/button";
import {
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
} from "@nextui-org/dropdown";

export default function EventActionsBtn({
	onSelect,
}: {
	onSelect: (key: string | number) => void;
}) {
	return (
		<Dropdown>
			<DropdownTrigger>
				<Button isIconOnly variant="bordered">
					<MdAdd size={"1.5rem"} />
				</Button>
			</DropdownTrigger>
			<DropdownMenu onAction={onSelect}>
				<DropdownItem key="new">אירוע חדש</DropdownItem>
				<DropdownItem key="edit">עריכת אירוע</DropdownItem>
				<DropdownItem
					key="delete"
					className="text-danger"
					color="danger"
				>
					מחיקת אירוע
				</DropdownItem>
			</DropdownMenu>
		</Dropdown>
	);
}
