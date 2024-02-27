import { useContext } from "react";

import { MessageModalType } from "@/components/shared/MessageModal/MessageModal";
import GuestsContext from "@/contexts/GuestsContext";
import { deleteGuest } from "@/lib/api/guests";
import { APIResponse, Guest } from "@/lib/types";
import {
	openGlobalModal,
	openYesNoGlobalModal,
} from "@/stores/useGlobalModalStore";
import { Button } from "@nextui-org/button";
import {
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
} from "@nextui-org/modal";

import styles from "./GuestModal.module.scss";

export default function GuestModal({
	guest,
	isOpen,
	eventName,
	onClose,
	onEditBtnClick,
	onGuestDeleted,
	isAdmin,
}: {
	guest: Guest | null | undefined;
	isOpen: boolean;
	eventName?: string;
	onClose: () => void;
	onEditBtnClick: () => void;
	onGuestDeleted: () => void;
	isAdmin: boolean;
}) {
	const { setGuests } = useContext(GuestsContext);

	const handleGuestDeleteBtn = async () => {
		if (!guest) {
			return;
		}

		let guestDeleteRes: APIResponse<boolean>;

		openYesNoGlobalModal({
			modalType: MessageModalType.YesNoDanger,
			title: "מחיקת אורח",
			bodyText: `האם אתה בטוח שברצונך למחוק את האורח ${guest.full_name}?`,
			yesBtnText: "מחק",
			btnCallback: async () => {
				if (!guest) {
					return;
				}

				guestDeleteRes = await deleteGuest(guest.uuid);
			},
			afterClosedCallback: () => {
				if (!guestDeleteRes || !guest) {
					return;
				}

				if (guestDeleteRes.data) {
					setGuests((prev) =>
						prev.filter((g) => g.uuid != guest.uuid)
					);

					openGlobalModal({
						modalType: MessageModalType.Success,
						title: "האורח נמחק בהצלחה",
						bodyText: `האורח ${guest.full_name} נמחק בהצלחה`,
					});
				} else if (guestDeleteRes.error) {
					openGlobalModal({
						modalType: MessageModalType.Error,
						title: "שגיאה",
						bodyText: `האורח לא נמחק`,
					});
				}

				onGuestDeleted();
			},
		});
	};

	return (
		<Modal
			isOpen={isOpen}
			onOpenChange={(open) => {
				if (!open) {
					onClose();
				}
			}}
			title={guest?.full_name}
			placement="center"
		>
			<ModalContent className={styles["modal"]}>
				<ModalHeader className={styles["modal-header"]}>
					<p className={styles["modal-header__title"]} dir="rtl">
						{eventName}
					</p>
					<p>{isAdmin ? "אורח" : "אורח שהזמנת"}</p>
				</ModalHeader>
				<ModalBody>
					<p>
						<strong>שם מלא:</strong> {guest?.full_name}
					</p>
					<p>
						<strong>תעודת זהות:</strong> {guest?.id_number}
					</p>
					<p>
						<strong>קשר:</strong> {guest?.relationship}
					</p>
					{isAdmin && (
						<p>
							<strong>הוזמן על ידי:</strong>{" "}
							{guest?.user_full_name}
						</p>
					)}
				</ModalBody>
				<ModalFooter className={styles["modal-footer"]}>
					<Button
						dir="rtl"
						onPress={handleGuestDeleteBtn}
						color="danger"
					>
						מחק
					</Button>
					<Button onPress={onEditBtnClick} color="primary">
						ערוך
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
