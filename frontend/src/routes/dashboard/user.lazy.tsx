import { useCallback, useEffect, useState } from "react";

import EditOrAddGuestModal from "@/components/shared/EditOrAddGuestModal/EditOrAddGuestModal";
import GuestCards from "@/components/shared/GuestCards/GuestCards";
import GuestModal from "@/components/shared/GuestModal/GuestModal";
import GuestsContext from "@/contexts/GuestsContext";
import { getGuests } from "@/lib/api/guests";
import { getUser } from "@/lib/api/users";
import { Guest, ModalType } from "@/lib/types";
import useEnsureTokenValid from "@/stores/useEnsureTokenValid";
import useUserStore from "@/stores/useUserStore";
import { Button } from "@nextui-org/button";
import { Spinner } from "@nextui-org/spinner";
import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";

import styles from "./user.module.scss";

export const Route = createLazyFileRoute("/dashboard/user")({
	component: DashboardUserIndex,
});

function DashboardUserIndex() {
	const navigate = useNavigate();
	const userId = useUserStore((state) => state.id);
	const eventName = useUserStore((state) => state.eventName);
	const invitationCount = useUserStore((state) => state.eventInvitationCount);

	const [guests, setGuests] = useState<Guest[]>([]);

	// Edit/Add guest modal
	const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
	const [modalGuest, setModalGuest] = useState<Guest | null>(null);

	// Guest info modal
	const [infoGuestModal, setInfoGuestModal] = useState<Guest | null>(null);

	useEnsureTokenValid("/login/user", "id");

	const { isLoading: userDataLoading, error: userDataResError } = useQuery({
		queryKey: ["userData"],
		queryFn: async () => {
			const { data, error, status } = await getUser("me");

			if (data) {
				useUserStore.setState({
					id: data.id,
					eventId: data.event_id,
					idNumber: data.id_number,
					fullName: data.full_name,
					eventName: data.event_name,
					eventDescription: data.event_description,
					eventWelcomeText: data.event_welcome_text,
					eventInvitationCount: data.event_invitation_count,
				});

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
		queryKey: ["guests", userId],
		queryFn: async () => {
			if (!userId) {
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

	const handleGuestEdited = useCallback((guest: Guest) => {
		setInfoGuestModal(guest);
	}, []);

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
				<h1>{eventName}</h1>
				<h2>הזמנת אורחים</h2>
				<p>
					מספר האורחים שלך: {guests.length}/{invitationCount || 0}
				</p>

				<Button
					color="primary"
					disabled={guests.length >= (invitationCount || 0)}
					onPress={() => {
						setModalGuest(null);
						setIsGuestModalOpen(true);
					}}
				>
					הוסף אורח
				</Button>

				<GuestCards
					isLoading={guestsLoading}
					eventName={eventName || ""}
					onGuestCardClick={(guest: Guest) => {
						setInfoGuestModal(guest);
					}}
					isAdmin={false}
				/>

				<GuestModal
					eventName={eventName}
					guest={infoGuestModal}
					isOpen={infoGuestModal != null}
					onClose={() => setInfoGuestModal(null)}
					isAdmin={false}
					onEditBtnClick={() => {
						setModalGuest(infoGuestModal);
						setIsGuestModalOpen(true);
					}}
					onGuestDeleted={() => {
						setInfoGuestModal(null);
					}}
				/>

				<EditOrAddGuestModal
					modalType={modalGuest ? ModalType.EDIT : ModalType.NEW}
					eventName={eventName || ""}
					isOpen={isGuestModalOpen}
					onClose={() => setIsGuestModalOpen(false)}
					guest={modalGuest}
					isAdmin={false}
					onGuestEdited={handleGuestEdited}
				/>
			</div>
		</GuestsContext.Provider>
	);
}
