import { useContext } from "react";

import { MessageModalType } from "@/components/shared/MessageModal/MessageModal";
import UsersContext from "@/contexts/UsersContext";
import { deleteUser } from "@/lib/api/users";
import { APIResponse, User } from "@/lib/types";
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

import styles from "./UserModal.module.scss";

export default function UserModal({
	user,
	isOpen,
	eventName,
	onClose,
	onEditBtnClick,
	onUserDeleted,
}: {
	user: User | null;
	isOpen: boolean;
	eventName: string;
	onClose: () => void;
	onEditBtnClick: () => void;
	onUserDeleted: () => void;
}) {
	const { setUsers } = useContext(UsersContext);

	const handleUserDeleteBtn = async () => {
		if (!user) {
			return;
		}

		let userDeleteRes: APIResponse<boolean>;

		openYesNoGlobalModal({
			modalType: MessageModalType.YesNoDanger,
			title: "מחיקת משתמש",
			bodyText: `האם אתה בטוח שברצונך למחוק את המשתמש ${user.full_name}?`,
			yesBtnText: "מחק",
			btnCallback: async () => {
				if (!user) {
					return;
				}

				userDeleteRes = await deleteUser(user.id);
			},
			afterClosedCallback: () => {
				if (!userDeleteRes) {
					return;
				}

				if (userDeleteRes.data) {
					setUsers((prev) => prev.filter((u) => u.id != user.id));

					openGlobalModal({
						modalType: MessageModalType.Success,
						title: "המשתמש נמחק בהצלחה",
						bodyText: `המשתמש ${user.full_name} נמחק בהצלחה`,
					});
				} else if (userDeleteRes.error) {
					openGlobalModal({
						modalType: MessageModalType.Error,
						title: "שגיאה",
						bodyText: `המשתמש לא נמחק`,
					});
				}

				onUserDeleted();
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
			title={user?.full_name}
			placement="center"
		>
			<ModalContent className={styles["modal"]}>
				<ModalHeader className={styles["modal-header"]}>
					<p className={styles["modal-header__title"]} dir="rtl">
						{eventName}
					</p>
					<p>משתמש</p>
				</ModalHeader>
				<ModalBody>
					<p>שם מלא: {user?.full_name}</p>
					<p>תעודת זהות: {user?.id_number}</p>
				</ModalBody>
				<ModalFooter className={styles["modal-footer"]}>
					<Button onPress={handleUserDeleteBtn} color="danger">
						מחק
					</Button>
					<Button color="primary" onPress={onEditBtnClick}>
						ערוך
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
