import { useContext, useEffect, useState } from 'react';

import EditOrAddGuestModal from '@/components/shared/EditOrAddModal/EditOrAddGuestModal';
import GuestCards from '@/components/shared/GuestCards/GuestCards';
import { MessageModalType } from '@/components/shared/MessageModal/MessageModal';
import GuestsContext from '@/contexts/GuestsContext';
import UsersContext from '@/contexts/UsersContext';
import { getGuestsByUserId } from '@/lib/api/guests';
import { deleteUser } from '@/lib/api/users';
import { APIResponse, Guest, ModalType, User } from '@/lib/types';
import { openGlobalModal, openYesNoGlobalModal } from '@/stores/useGlobalModalStore';
import { Button } from '@nextui-org/button';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/modal';
import { useQuery } from '@tanstack/react-query';

import styles from './UserModal.module.scss';

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

	const [userGuests, setUserGuests] = useState<Guest[]>([]);
	const [activeGuest, setActiveGuest] = useState<Guest | null>(null);

	const { isLoading, error, data } = useQuery({
		queryKey: ["guests", user?.id],
		queryFn: async () => {
			if (!user) {
				return [];
			}

			const { data, error } = await getGuestsByUserId(user.id);

			if (data) {
				return data;
			}

			throw new Error(error);
		},
	});

	useEffect(() => {
		if (data) {
			setUserGuests(data);
		}
	}, [data]);

	const handleUserDeleteBtn = async () => {
		if (!user) {
			return;
		}

		let userDeleteRes: APIResponse<boolean>;

		openYesNoGlobalModal({
			modalType: MessageModalType.YesNoDanger,
			title: "מחיקת מזמין",
			bodyText: `האם אתה בטוח שברצונך למחוק את המזמין ${user.full_name}?`,
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
						title: "המזמין נמחק בהצלחה",
						bodyText: `המזמין ${user.full_name} נמחק בהצלחה`,
					});
				} else if (userDeleteRes.error) {
					openGlobalModal({
						modalType: MessageModalType.Error,
						title: "שגיאה",
						bodyText: `המזמין לא נמחק`,
					});
				}

				onUserDeleted();
			},
		});
	};

	return (
		<GuestsContext.Provider
			value={{ guests: userGuests, setGuests: setUserGuests }}
		>
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
						<p>מזמין</p>
					</ModalHeader>
					<ModalBody>
						<div>
							<p>
								<strong>שם מלא:</strong> {user?.full_name}
							</p>
							<p>
								<strong>תעודת זהות:</strong> {user?.id_number}
							</p>
						</div>
						{error && (
							<p className="text-danger" dir="rtl">
								שגיאה: {error.message}
							</p>
						)}
						{userGuests.length > 0 && (
							<div dir="rtl">
								<h3>אורחים:</h3>
								<GuestCards
									isAdmin={false}
									isLoading={isLoading}
									onGuestCardClick={setActiveGuest}
								/>
							</div>
						)}
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

			<EditOrAddGuestModal
				modalType={ModalType.EDIT}
				eventName={eventName}
				isOpen={!!activeGuest}
				onClose={() => setActiveGuest(null)}
				guest={activeGuest}
				isAdmin
			/>
		</GuestsContext.Provider>
	);
}
