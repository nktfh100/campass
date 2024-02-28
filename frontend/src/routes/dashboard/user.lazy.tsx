import { useEffect, useState } from 'react';

import EditOrAddGuestModal from '@/components/shared/EditOrAddModal/EditOrAddGuestModal';
import GuestCards from '@/components/shared/GuestCards/GuestCards';
import GuestsContext from '@/contexts/GuestsContext';
import useEnsureTokenValid from '@/hooks/useEnsureTokenValid';
import { getGuests } from '@/lib/api/guests';
import { getUser } from '@/lib/api/users';
import { Guest, ModalType } from '@/lib/types';
import { Button } from '@nextui-org/button';
import { Spinner } from '@nextui-org/spinner';
import { useQuery } from '@tanstack/react-query';
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';

import styles from './user.module.scss';

export const Route = createLazyFileRoute("/dashboard/user")({
	component: DashboardUserIndex,
});

function DashboardUserIndex() {
	const navigate = useNavigate();

	const [guests, setGuests] = useState<Guest[]>([]);

	// Edit/Add guest modal
	const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
	const [modalGuest, setModalGuest] = useState<Guest | null>(null);

	const { id } = useEnsureTokenValid("/login/user", "id");

	const {
		isLoading: userDataLoading,
		error: userDataResError,
		data: userData,
	} = useQuery({
		queryKey: ["userData"],
		queryFn: async () => {
			const { data, error, status } = await getUser("me");

			if (data) {
				return data;
			}

			if (status == 401) {
				localStorage.removeItem("token");
				navigate({ to: "/login/user", replace: true });
			}

			throw new Error(error);
		},
	});

	const {
		isLoading: guestsLoading,
		error: guestsResError,
		data: guestsResData,
	} = useQuery({
		queryKey: ["guests", id],
		queryFn: async () => {
			if (!id) {
				throw new Error("User ID not found");
			}

			const { data, error } = await getGuests();

			if (data) {
				return data;
			}

			throw new Error(error);
		},
	});

	useEffect(() => {
		if (guestsResData) {
			setGuests(guestsResData);
		}
	}, [guestsResData]);

	if (guestsLoading || userDataLoading) {
		return <Spinner size="lg" className={styles["spinner"]} />;
	}

	if (guestsResError || userDataResError) {
		return (
			<div className={styles["user"]}>
				<p className="text-danger" dir="rtl">
					שגיאה:{" "}
					{guestsResError
						? guestsResError.message
						: userDataResError?.message}
				</p>
			</div>
		);
	}

	return (
		<GuestsContext.Provider value={{ guests, setGuests }}>
			<div className={styles["user"]} dir="rtl">
				<h1>{userData?.event_name}</h1>
				<h2>הזמנת אורחים</h2>
				<p>
					מספר האורחים שלך: {guests.length}/
					{userData?.event_invitation_count || 0}
				</p>

				<Button
					color="primary"
					isDisabled={
						guests.length >= (userData?.event_invitation_count || 0)
					}
					onPress={() => {
						setModalGuest(null);
						setIsGuestModalOpen(true);
					}}
				>
					הוסף אורח
				</Button>

				<GuestCards
					isLoading={guestsLoading}
					onGuestCardClick={(guest: Guest) => {
						setModalGuest(guest);
						setIsGuestModalOpen(true);
					}}
					isAdmin={false}
				/>

				<EditOrAddGuestModal
					modalType={modalGuest ? ModalType.EDIT : ModalType.NEW}
					eventName={userData?.event_name || "" || ""}
					weaponForm={userData?.event_weapon_form}
					isOpen={isGuestModalOpen}
					onClose={() => setIsGuestModalOpen(false)}
					guest={modalGuest}
					isAdmin={false}
				/>
			</div>
		</GuestsContext.Provider>
	);
}
