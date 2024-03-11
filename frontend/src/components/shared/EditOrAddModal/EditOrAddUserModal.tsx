import { useContext, useEffect, useState } from "react";

import { MessageModalType } from "@/components/shared/MessageModal/MessageModal";
import UsersContext from "@/contexts/UsersContext";
import { createUser, editUser } from "@/lib/api/users";
import { APIResponse, ModalType, User } from "@/lib/types";
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

import stylesShared from "./sharedEditAddModal.module.scss";

interface BaseModalProps {
	modalType: ModalType;
	isOpen: boolean;
	onClose: () => void;
}

interface AddUserModalProps {
	modalType: ModalType.NEW;
	eventId: number | string;
	eventName: string;
}

interface EditUserModalProps {
	modalType: ModalType.EDIT;
	eventId: number | string;
	eventName: string;
	user: User | null;
	onUserEdited: (user: User) => void;
}

type EditOrAddUserModalProps = BaseModalProps &
	(AddUserModalProps | EditUserModalProps);

export default function EditOrAddUserModal(props: EditOrAddUserModalProps) {
	const { modalType, isOpen, onClose } = props;
	const { eventId, eventName } = props as AddUserModalProps;
	const { onUserEdited, user } = props as EditUserModalProps;

	const { setUsers } = useContext(UsersContext);

	const [fullName, setFullName] = useState("");
	const [idNumber, setIdNumber] = useState("");

	const [fullNameError, setFullNameError] = useState("");
	const [idNumberError, setIdNumberError] = useState("");

	const [isSubmitting, setIsSubmitting] = useState(false);

	const [error, setError] = useState("");

	useEffect(() => {
		if (user && isOpen && modalType == ModalType.EDIT) {
			setFullName(user.full_name);
			setIdNumber(user.id_number);
		}
	}, [user, isOpen, modalType]);

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			setFullName("");
			setIdNumber("");
			setError("");
			setFullNameError("");
			setIdNumberError("");
			setIsSubmitting(false);
		}

		onClose();
	};

	const handleFormSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
		ev.preventDefault();

		if (!/^\d+$/.test(idNumber)) {
			setIdNumberError("תעודת זהות יכולה להכיל רק מספרים");
			return;
		}

		if (!user && modalType == ModalType.EDIT) {
			console.error("user is null");
			setError("user is null!");
			return;
		}

		setIsSubmitting(true);
		let res: APIResponse<User>;
		if (modalType == ModalType.EDIT) {
			res = await editUser({
				userId: user!.id,
				fullName,
				idNumber,
			});
		} else {
			res = await createUser({
				eventId,
				fullName,
				idNumber,
			});
		}
		setIsSubmitting(false);

		setFullNameError("");
		setIdNumberError("");

		if (res.data) {
			setFullName("");
			setIdNumber("");

			if (modalType == ModalType.EDIT) {
				onUserEdited(res.data);
				setUsers((prev) =>
					prev.map((u) => (u.id == user!.id ? res.data! : u))
				);
			} else {
				setUsers((prev) => [...prev, res.data!]);
			}

			handleOpenChange(false);

			if (modalType == ModalType.NEW) {
				openGlobalModal({
					modalType: MessageModalType.Success,
					title: "מזמין נוצר בהצלחה",
					bodyText: `המזמיחן ${res.data.full_name} נוצר בהצלחה`,
				});
			}
		}

		if (res.error) {
			setError(res.error);
		}
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
								? "עריכת מזמין"
								: "הוספת מזמין"}
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
								isInvalid={!!fullNameError}
								errorMessage={fullNameError}
								isDisabled={isSubmitting}
								autoComplete="off"
								autoCapitalize="off"
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
								isDisabled={isSubmitting}
								autoComplete="off"
								autoCapitalize="off"
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
		</>
	);
}
