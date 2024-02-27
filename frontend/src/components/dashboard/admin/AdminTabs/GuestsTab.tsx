import { useEffect, useState } from "react";

import EditOrAddGuestModal from "@/components/shared/EditOrAddModal/EditOrAddGuestModal";
import GuestCards from "@/components/shared/GuestCards/GuestCards";
import GuestModal from "@/components/shared/GuestModal/GuestModal";
import GuestsContext from "@/contexts/GuestsContext";
import { getGuestsAdmin } from "@/lib/api/guests";
import { ApiPagination, Event, Guest, ModalType } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

import stylesShared from "./AdminTabShared.module.scss";

export default function GuestsTab({ event }: { event: Event }) {
	const [guests, setGuests] = useState<Guest[]>([]);
	const [paginationData, setPaginationData] = useState<ApiPagination | null>(
		null
	);
	const [currentPage, setCurrentPage] = useState(1);

	// Edit/Add guest modal
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editModalGuest, setEditModalGuest] = useState<Guest | null>(null);

	// Guest info modal
	const [infoModalGuest, setInfoModalGuest] = useState<Guest | null>(null);

	const closeModal = () => {
		setIsEditModalOpen(false);
		setEditModalGuest(null);
	};

	useEffect(() => {
		setCurrentPage(1);
	}, [event.id]);

	const {
		isLoading: guestsIsLoading,
		error: guestsError,
		data: guestsResData,
	} = useQuery({
		queryKey: ["guests", event.id, currentPage],
		queryFn: async () => {
			const { data, error } = await getGuestsAdmin(event.id, currentPage);

			if (data) {
				return data;
			}

			throw new Error(error);
		},
	});

	useEffect(() => {
		if (guestsResData?.pagination) {
			setPaginationData(guestsResData.pagination);
		}
		if (guestsResData?.guests) {
			setGuests(guestsResData.guests);
		}
	}, [guestsResData]);

	return (
		<GuestsContext.Provider value={{ guests, setGuests }}>
			<div className={`fade-in ${stylesShared["tab-content"]}`}>
				{guestsError && (
					<p className="text-danger" dir="rtl">
						שגיאה בטעינת האורחים: {guestsError.message}
					</p>
				)}

				<GuestCards
					isLoading={guestsIsLoading}
					eventName={event.name || ""}
					pageCount={paginationData?.pageCount || 1}
					currentPage={currentPage}
					onPageChange={(page: number) => setCurrentPage(page)}
					guestsCount={paginationData?.totalCount || 0}
					onGuestCardClick={(guest: Guest) =>
						setInfoModalGuest(guest)
					}
					isAdmin
				/>

				<EditOrAddGuestModal
					modalType={ModalType.EDIT}
					eventName={event.name}
					isOpen={isEditModalOpen}
					onClose={closeModal}
					guest={editModalGuest}
					onGuestEdited={(guest: Guest) => setInfoModalGuest(guest)}
					isAdmin
				/>

				<GuestModal
					guest={infoModalGuest}
					isOpen={!!infoModalGuest}
					onClose={() => setInfoModalGuest(null)}
					onEditBtnClick={() => {
						setEditModalGuest(infoModalGuest);
						setIsEditModalOpen(true);
					}}
					onGuestDeleted={() => {
						setInfoModalGuest(null);
					}}
					isAdmin={true}
				/>
			</div>
		</GuestsContext.Provider>
	);
}
