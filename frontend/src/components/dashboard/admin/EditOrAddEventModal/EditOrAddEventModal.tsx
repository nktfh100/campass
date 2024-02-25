import { useEffect, useState } from "react";

import { MessageModalType } from "@/components/shared/MessageModal/MessageModal";
import { createEvent, editEvent } from "@/lib/api/events";
import { APIResponse, Event, ModalType } from "@/lib/types";
import { openGlobalModal } from "@/stores/useGlobalModalStore";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import {
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
} from "@nextui-org/modal";

import styles from "./EditOrAddEventModal.module.scss";

type BaseModalProps = {
	modalType: ModalType;
	isOpen: boolean;
	onClose: () => void;
};

type AddEventModalProps = {
	modalType: ModalType.NEW;
	onEventAdded: (event: Event) => void;
};

type EditEventModalProps = {
	modalType: ModalType.EDIT;
	onEventEdited: (event: Event) => void;
	event?: Event | null;
};

type EditOrAddEventModalProps = BaseModalProps &
	(AddEventModalProps | EditEventModalProps);

export default function EditOrAddEventModal(props: EditOrAddEventModalProps) {
	const { modalType, isOpen, onClose } = props;
	const { onEventAdded } = props as AddEventModalProps;
	const { onEventEdited, event } = props as EditEventModalProps;

	const [name, setName] = useState("");
	const [invitationCount, setInvitationCount] = useState(0);

	const [invitationCountError, setInvitationCountError] = useState("");

	const [isSubmitting, setIsSubmitting] = useState(false);

	const [error, setError] = useState("");

	useEffect(() => {
		if (event && isOpen && modalType == ModalType.EDIT) {
			setName(event.name);
			setInvitationCount(event.invitation_count);
		}
	}, [event, isOpen, modalType]);

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			setName("");
			setInvitationCount(0);
			setError("");
			setInvitationCountError("");
			setIsSubmitting(false);
			onClose();
		}
	};

	const handleFormSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
		ev.preventDefault();

		if (isSubmitting) {
			return;
		}

		if (invitationCount <= 0) {
			setInvitationCountError("מספר המוזמנים חייב להיות גדול מ-0");
			return;
		}

		setIsSubmitting(true);
		setError("");

		let res: APIResponse<Event>;

		if (modalType == ModalType.EDIT) {
			res = await editEvent({
				eventId: event!.id,
				name,
				invitationCount,
			});
		} else {
			res = await createEvent({ name, invitationCount });
		}

		setIsSubmitting(false);

		if (res.data) {
			setError("");
			if (modalType == ModalType.NEW) {
				onEventAdded(res.data);
			} else {
				onEventEdited(res.data);
			}

			handleOpenChange(false);

			if (modalType == ModalType.NEW) {
				openGlobalModal({
					modalType: MessageModalType.Success,
					title: "אירוע נוצר בהצלחה",
					bodyText: `האירוע ${res.data.name} נוצר בהצלחה`,
				});
			}
			return;
		}

		if (res.error) {
			setError(res.error);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onOpenChange={handleOpenChange}
			title={
				modalType == ModalType.NEW ? "יצירת אירוע חדש" : "עריכת אירוע"
			}
			placement="center"
		>
			<ModalContent>
				<form onSubmit={handleFormSubmit}>
					<ModalHeader className={styles["modal__header"]}>
						<p>
							{modalType == ModalType.EDIT
								? "עריכת אירוע"
								: "יצירת אירוע חדש"}
						</p>
					</ModalHeader>
					<ModalBody dir="rtl">
						<Input
							label="שם האירוע"
							placeholder="שם האירוע"
							variant="bordered"
							isRequired
							value={name}
							onChange={(e) => setName(e.target.value)}
							disabled={isSubmitting}
						/>

						<Input
							type="number"
							label="מספר מוזמנים לבן אדם"
							placeholder="מספר מוזמנים"
							variant="bordered"
							isRequired
							value={invitationCount as any}
							onChange={(e) =>
								setInvitationCount(e.target.value as any)
							}
							isInvalid={!!invitationCountError}
							errorMessage={invitationCountError}
							disabled={isSubmitting}
						/>
					</ModalBody>
					<ModalFooter className={styles["modal__footer"]}>
						{error && (
							<p className="text-red-500 text-center" dir="rtl">
								שגיאה: {error}
							</p>
						)}
						<Button
							color="primary"
							type="submit"
							isLoading={isSubmitting}
							dir="rtl"
						>
							{modalType == ModalType.EDIT ? "שמור" : "הוסף"}
						</Button>
					</ModalFooter>
				</form>
			</ModalContent>
		</Modal>
	);
}
