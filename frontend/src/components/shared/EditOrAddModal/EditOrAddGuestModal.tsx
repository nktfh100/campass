import { useContext, useEffect, useMemo, useState } from "react";

import { MessageModalType } from "@/components/shared/MessageModal/MessageModal";
import GuestsContext from "@/contexts/GuestsContext";
import { createGuest, deleteGuest, editGuest } from "@/lib/api/guests";
import { APIResponse, Guest, ModalType } from "@/lib/types";
import {
	openGlobalModal,
	openYesNoGlobalModal,
} from "@/stores/useGlobalModalStore";
import { Button } from "@nextui-org/button";
import { Checkbox } from "@nextui-org/checkbox";
import { Input } from "@nextui-org/input";
import { Link } from "@nextui-org/link";
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
	eventName: string;
	weaponForm?: string;
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
	onGuestEdited?: (guest: Guest) => void;
	guest: Guest | null;
}

type EditOrAddGuestModalProps = BaseModalProps &
	(NewGuestModalProps | EditGuestModalProps);

export default function EditOrAddGuestModal(props: EditOrAddGuestModalProps) {
	const { modalType, eventName, weaponForm, isOpen, onClose, isAdmin } =
		props;
	const { userId } = props as NewGuestModalProps;
	const { onGuestEdited, guest } = props as EditGuestModalProps;

	const { setGuests } = useContext(GuestsContext);

	const [fullName, setFullName] = useState("");
	const [idNumber, setIdNumber] = useState("");
	const [weapon, setWeapon] = useState(false);

	const [idNumberError, setIdNumberError] = useState("");

	const [isSubmitting, setIsSubmitting] = useState(false);

	const [error, setError] = useState("");

	useEffect(() => {
		if (modalType == ModalType.EDIT && guest && isOpen) {
			setFullName(guest.full_name);
			setIdNumber(guest.id_number);
			setWeapon(guest.weapon);
		}
	}, [guest, isOpen, modalType]);

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			setFullName("");
			setIdNumber("");
			setWeapon(false);
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
				weapon,
			});
		} else {
			apiRes = await createGuest({
				fullName,
				idNumber,
				weapon,
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
				const newGuest = { ...guest, ...apiRes.data };
				if (onGuestEdited) {
					onGuestEdited(newGuest);
				}
				setGuests((prev) =>
					prev.map((g) =>
						g.uuid == apiRes.data!.uuid ? newGuest : g
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

	const handleDeleteBtn = () => {
		if (!guest) {
			console.error("guest is null");
			return;
		}
		let res: APIResponse<boolean>;
		openYesNoGlobalModal({
			modalType: MessageModalType.YesNoDanger,
			title: "מחיקת אורח",
			bodyText: `האם אתה בטוח שברצונך למחוק את האורח ${guest.full_name}?`,
			btnCallback: async () => {
				res = await deleteGuest(guest!.uuid);
			},
			afterClosedCallback: () => {
				if (res.data) {
					setGuests((prev) =>
						prev.filter((g) => g.uuid != guest.uuid)
					);
					handleOpenChange(false);
					openGlobalModal({
						modalType: MessageModalType.Success,
						title: "אורח נמחק בהצלחה",
						bodyText: `האורח ${guest.full_name} נמחק בהצלחה`,
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

	const shortenedFormLink = useMemo(
		() =>
			weaponForm
				? weaponForm.slice(0, 35) +
					(weaponForm.length > 35 ? "..." : "")
				: "",
		[weaponForm]
	);

	return (
		<Modal
			isOpen={isOpen}
			onOpenChange={handleOpenChange}
			placement="center"
			scrollBehavior="inside"
		>
			<ModalContent>
				<ModalHeader
					className={stylesShared["modal__header"]}
					dir="rtl"
				>
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
						<Checkbox
							isSelected={weapon}
							onValueChange={setWeapon}
							isDisabled={isSubmitting}
						>
							<p style={{ marginRight: "0.5rem" }}>
								נושא נשק אישי
							</p>
						</Checkbox>
						{weapon && weaponForm && (
							<span
								className={stylesShared["modal__weapon-form"]}
								dir="rtl"
							>
								<p>שים לב, אורחים עם נשק חייבים למלא טופס.</p>
								<p>
									אורח שלא מילא את הטופס לא יוכל להיכנס
									לאירוע!
								</p>
								<Link
									href={weaponForm}
									color="danger"
									isExternal
									showAnchorIcon
									dir="ltr"
								>
									{shortenedFormLink}
								</Link>
							</span>
						)}
					</ModalBody>
					<ModalFooter className={stylesShared["modal__footer"]}>
						{error && (
							<p className="text-red-500 text-center" dir="rtl">
								שגיאה: {error}
							</p>
						)}
						<div className={stylesShared["modal__buttons"]}>
							{modalType == ModalType.EDIT && (
								<Button
									color="danger"
									onPress={handleDeleteBtn}
									isDisabled={isSubmitting}
								>
									מחק
								</Button>
							)}

							<Button
								color="primary"
								type="submit"
								isLoading={isSubmitting}
							>
								שמור
							</Button>
						</div>
					</ModalFooter>
				</form>
			</ModalContent>
		</Modal>
	);
}
