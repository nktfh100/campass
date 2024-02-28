import { useEffect, useState } from 'react';

import { MessageModalType } from '@/components/shared/MessageModal/MessageModal';
import { createEvent, editEvent } from '@/lib/api/events';
import { APIResponse, Event, ModalType } from '@/lib/types';
import { openGlobalModal } from '@/stores/useGlobalModalStore';
import { Button } from '@nextui-org/button';
import { Input } from '@nextui-org/input';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/modal';

import stylesShared from './sharedEditAddModal.module.scss';

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
	const [weaponForm, setWeaponForm] = useState("");

	const [invitationCountError, setInvitationCountError] = useState("");

	const [isSubmitting, setIsSubmitting] = useState(false);

	const [error, setError] = useState("");

	useEffect(() => {
		if (event && isOpen && modalType == ModalType.EDIT) {
			setName(event.name);
			setInvitationCount(event.invitation_count);
			if (event.weapon_form) {
				setWeaponForm(event.weapon_form);
			}
		}
	}, [event, isOpen, modalType]);

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			setName("");
			setInvitationCount(0);
			setWeaponForm("");
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
				weaponForm,
			});
		} else {
			res = await createEvent({ name, invitationCount, weaponForm });
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
					<ModalHeader className={stylesShared["modal__header"]}>
						<p>
							{modalType == ModalType.EDIT
								? "עריכת אירוע"
								: "יצירת אירוע חדש"}
						</p>
					</ModalHeader>
					<ModalBody dir="rtl">
						<Input
							label="שם האירוע"
							placeholder='טקס סיום אפ"מ 10/02'
							variant="bordered"
							isRequired
							value={name}
							onValueChange={(value) => setName(value)}
							isDisabled={isSubmitting}
						/>

						<Input
							type="number"
							label="מספר מוזמנים לבן אדם"
							placeholder="3"
							variant="bordered"
							isRequired
							value={invitationCount as any}
							onValueChange={(value) =>
								setInvitationCount(value as any)
							}
							isInvalid={!!invitationCountError}
							errorMessage={invitationCountError}
							isDisabled={isSubmitting}
						/>
						<Input
							label="קישור לטופס נשק"
							placeholder="קישור לטופס נשק"
							variant="bordered"
							value={weaponForm}
							onValueChange={(value) => setWeaponForm(value)}
							isDisabled={isSubmitting}
						/>
					</ModalBody>
					<ModalFooter className={stylesShared["modal__footer"]}>
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
