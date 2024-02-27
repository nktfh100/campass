import { useContext, useEffect, useState } from "react";

import { MessageModalType } from "@/components/shared/MessageModal/MessageModal";
import AdminsContext from "@/contexts/AdminsContext";
import { createAdmin, deleteAdmin, editAdmin } from "@/lib/api/admins";
import { Admin, APIResponse, ModalType } from "@/lib/types";
import {
	openGlobalModal,
	openYesNoGlobalModal,
} from "@/stores/useGlobalModalStore";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import {
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
} from "@nextui-org/modal";

import stylesShared from "./sharedEditAddModal.module.scss";

interface BaseModalProps {
	modalType: ModalType;
	isOpen: boolean;
	onClose: () => void;
}

interface AddAdminModalProps {
	modalType: ModalType.NEW;
	eventId: number | string;
	eventName: string;
}

interface EditAdminModalProps {
	modalType: ModalType.EDIT;
	eventId: number | string;
	eventName: string;
	admin: Admin | null;
}

type EditOrAddAdminModalProps = BaseModalProps &
	(AddAdminModalProps | EditAdminModalProps);

export default function EditOrAddAdminModal(props: EditOrAddAdminModalProps) {
	const { modalType, isOpen, onClose } = props;
	const { eventId, eventName } = props as EditOrAddAdminModalProps;
	const { admin } = props as EditAdminModalProps;

	const { setAdmins } = useContext(AdminsContext);

	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	const [isSubmitting, setIsSubmitting] = useState(false);

	const [error, setError] = useState("");

	useEffect(() => {
		if (admin && isOpen && modalType == ModalType.EDIT) {
			setUsername(admin.username);
		}
	}, [admin, isOpen, modalType]);

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			setUsername("");
			setPassword("");
			setError("");

			setIsSubmitting(false);
		}

		onClose();
	};

	const handleFormSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
		ev.preventDefault();

		if (!admin && modalType == ModalType.EDIT) {
			console.error("admin is null");
			setError("admin is null!");
			return;
		}

		setIsSubmitting(true);
		let res: APIResponse<Admin>;
		if (modalType == ModalType.EDIT) {
			res = await editAdmin({
				adminId: admin!.id,
				username,
				...(password ? { password } : {}),
			});
		} else {
			res = await createAdmin({
				eventId,
				username,
				password,
			});
		}
		setIsSubmitting(false);

		if (res.data) {
			setUsername("");
			setPassword("");

			if (modalType == ModalType.EDIT) {
				// onAdminEdited(res.data);
				setAdmins((prev) =>
					prev.map((a) => (a.id == admin!.id ? res.data! : a))
				);
			} else {
				setAdmins((prev) => [...prev, res.data!]);
			}

			handleOpenChange(false);

			if (modalType == ModalType.NEW) {
				openGlobalModal({
					modalType: MessageModalType.Success,
					title: "מפקד נוצר בהצלחה",
					bodyText: `המפקד ${res.data.username} נוצר בהצלחה`,
				});
			}
		}

		if (res.error) {
			setError(res.error);
		}
	};

	const handleDeleteBtn = () => {
		if (!admin) {
			console.error("admin is null");
			return;
		}

		let res: APIResponse<boolean>;
		openYesNoGlobalModal({
			modalType: MessageModalType.YesNoDanger,
			title: "מחיקת מפקד",
			bodyText: `האם אתה בטוח שברצונך למחוק את המפקד ${admin.username}?`,
			btnCallback: async () => {
				res = await deleteAdmin(admin.id);
			},
			afterClosedCallback: () => {
				if (res.data) {
					setAdmins((prev) => prev.filter((u) => u.id != admin.id));
					handleOpenChange(false);
					openGlobalModal({
						modalType: MessageModalType.Success,
						title: "מפקד נמחק בהצלחה",
						bodyText: `המפקד ${admin?.username} נמחק בהצלחה`,
					});
				}
				if (res.error) {
					openGlobalModal({
						modalType: MessageModalType.Error,
						title: "שגיאה",
						bodyText: res.error,
					});
				}
			},
		});
	};

	return (
		<>
			<Modal
				isOpen={isOpen}
				onOpenChange={handleOpenChange}
				placement="center"
			>
				<ModalContent>
					<ModalHeader className={stylesShared["modal__header"]}>
						<p>
							{modalType == ModalType.EDIT
								? "עריכת מפקד"
								: "הוספת מפקד"}
						</p>
						<p>{eventName}</p>
					</ModalHeader>

					<form onSubmit={handleFormSubmit}>
						<ModalBody dir="rtl">
							<Input
								label="שם משתמש"
								placeholder="שם משתמש"
								variant="bordered"
								isRequired
								value={username}
								onValueChange={(value) => setUsername(value)}
								disabled={isSubmitting}
							/>

							<Input
								label="סיסמה"
								placeholder="סיסמה"
								variant="bordered"
								isRequired={modalType == ModalType.NEW}
								value={password}
								onValueChange={(value) => setPassword(value)}
								disabled={isSubmitting}
							/>
						</ModalBody>
						<ModalFooter className={stylesShared["modal__footer"]}>
							{error && (
								<p
									className="text-red-500 text-center"
									dir="rtl"
								>
									שגיאה: {error}
								</p>
							)}
							<div className={stylesShared["modal__buttons"]}>
								{modalType == ModalType.EDIT && (
									<Button
										color="danger"
										onPress={handleDeleteBtn}
										disabled={isSubmitting}
									>
										מחק
									</Button>
								)}
								<Button
									color="primary"
									type="submit"
									isLoading={isSubmitting}
									dir="rtl"
								>
									{modalType == ModalType.EDIT
										? "שמור"
										: "הוסף"}
								</Button>
							</div>
						</ModalFooter>
					</form>
				</ModalContent>
			</Modal>
		</>
	);
}
