import { useContext, useEffect, useState } from "react";

import { MessageModalType } from "@/components/shared/MessageModal/MessageModal";
import GuestsContext from "@/contexts/GuestsContext";
import { createGuest, editGuest } from "@/lib/api/guests";
import { APIResponse, Guest, ModalType } from "@/lib/types";
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

import styles from "./EditOrAddGuestModal.module.scss";

interface BaseModalProps {
	modalType: ModalType;
	eventName: string;
	isOpen: boolean;
	onClose: () => void;
	isAdmin: boolean;
}

interface NewGuestModalProps {
	modalType: ModalType.NEW;
	userId?: number | string;
}

interface EditGuestModalProps {
	modalType: ModalType.EDIT;
	onGuestEdited: (guest: Guest) => void;
	guest: Guest | null;
}

type EditOrAddGuestModalProps = BaseModalProps &
	(NewGuestModalProps | EditGuestModalProps);

export default function EditOrAddGuestModal(props: EditOrAddGuestModalProps) {
	const { modalType, eventName, isOpen, onClose, isAdmin } = props;
	const { userId } = props as NewGuestModalProps;
	const { onGuestEdited, guest } = props as EditGuestModalProps;

	const { setGuests } = useContext(GuestsContext);

	const [fullName, setFullName] = useState("");
	const [idNumber, setIdNumber] = useState("");
	const [relationship, setRelationship] = useState("");

	const [idNumberError, setIdNumberError] = useState("");

	const [isSubmitting, setIsSubmitting] = useState(false);

	const [error, setError] = useState("");

	useEffect(() => {
		if (modalType == ModalType.EDIT && guest && isOpen) {
			setFullName(guest.full_name);
			setIdNumber(guest.id_number);
			setRelationship(guest.relationship);
		}
	}, [guest, isOpen, modalType]);

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			setFullName("");
			setIdNumber("");
			setRelationship("");
			setError("");
			setIdNumberError("");
			setIsSubmitting(false);
			onClose();
		}
	};

	const handleFormSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
		ev.preventDefault();

		if (!/^\d+$/.test(idNumber)) {
			setIdNumberError("תעודת זהות יכולה להכיל רק מספרים");
			return;
		}

		if (modalType == ModalType.EDIT && !guest) {
			console.error("guest is null");
			return;
		}

		setIsSubmitting(true);
		let apiRes: APIResponse<Guest>;
		if (modalType === ModalType.EDIT) {
			apiRes = await editGuest({
				guestUUID: guest!.uuid,
				fullName,
				idNumber,
				relationship,
			});
		} else {
			apiRes = await createGuest({
				fullName,
				idNumber,
				relationship,
				...(isAdmin ? { userId } : {}),
			});
		}

		setIsSubmitting(false);

		setIdNumberError("");

		if (apiRes.data) {
			setFullName("");
			setIdNumber("");

			if (modalType == ModalType.NEW) {
				setGuests((prev) => [...prev, apiRes.data!]);
				openGlobalModal({
					modalType: MessageModalType.Success,
					title: "אורח נוסף בהצלחה",
					bodyText: `האורח ${apiRes.data.full_name} נוסף בהצלחה`,
				});
			} else {
				onGuestEdited({ ...guest, ...apiRes.data });
				setGuests((prev) =>
					prev.map((g) =>
						g.uuid == apiRes.data!.uuid ? apiRes.data! : g
					)
				);
			}

			handleOpenChange(false);

			if (modalType == ModalType.NEW) {
				openGlobalModal({
					modalType: MessageModalType.Success,
					title: "אורח נוסף בהצלחה",
					bodyText: `האורח ${apiRes.data.full_name} נוסף בהצלחה`,
				});
			}
		}

		if (apiRes.error) {
			setError(apiRes.error);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onOpenChange={handleOpenChange}
			placement="center"
		>
			<ModalContent>
				<ModalHeader className={styles["modal__header"]} dir="rtl">
					<p>
						{modalType == ModalType.EDIT
							? "עריכת אורח"
							: "הוספת אורח"}
					</p>
					<p>{eventName}</p>
				</ModalHeader>

				<form onSubmit={handleFormSubmit}>
					<ModalBody dir="rtl">
						<Input
							label="שם מלא"
							placeholder="שם מלא"
							variant="bordered"
							isRequired
							value={fullName}
							onValueChange={(value) => setFullName(value)}
							disabled={isSubmitting}
						/>
						<Input
							label="תעודת זהות"
							placeholder="תעודת זהות"
							variant="bordered"
							isRequired
							value={idNumber}
							onValueChange={(value) => setIdNumber(value)}
							isInvalid={!!idNumberError}
							errorMessage={idNumberError}
							disabled={isSubmitting}
						/>
						<Input
							label="קשר"
							placeholder="קשר"
							variant="bordered"
							isRequired
							value={relationship}
							onValueChange={(value) => setRelationship(value)}
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
						>
							שמור
						</Button>
					</ModalFooter>
				</form>
			</ModalContent>
		</Modal>
	);
}
