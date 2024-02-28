import FileSaver from 'file-saver';
import { useEffect, useState } from 'react';

import EditOrAddGuestModal from '@/components/shared/EditOrAddModal/EditOrAddGuestModal';
import GuestCards from '@/components/shared/GuestCards/GuestCards';
import GuestModal from '@/components/shared/GuestModal/GuestModal';
import { MessageModalType } from '@/components/shared/MessageModal/MessageModal';
import GuestsContext from '@/contexts/GuestsContext';
import { exportGuestsToExcel } from '@/lib/api/excel';
import { getGuestsAdmin } from '@/lib/api/guests';
import { ApiPagination, Event, Guest, ModalType } from '@/lib/types';
import { openGlobalModal } from '@/stores/useGlobalModalStore';
import { Button } from '@nextui-org/button';
import { useQuery } from '@tanstack/react-query';

import stylesShared from './AdminTabShared.module.scss';

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

	const handleExcelExportBtn = async () => {
		const res = await exportGuestsToExcel(event.id);
		if (!res.data || res.error) {
			openGlobalModal({
				modalType: MessageModalType.Error,
				title: "שגיאה",
				bodyText: res.error,
			});
			return;
		}

		FileSaver.saveAs(res.data, `אורחים - ${event.name}.xlsx`);
	};

	return (
		<GuestsContext.Provider value={{ guests, setGuests }}>
			<div className={`fade-in ${stylesShared["tab-content"]}`}>
				{guestsError && (
					<p className="text-danger" dir="rtl">
						שגיאה בטעינת האורחים: {guestsError.message}
					</p>
				)}

				<Button
					onPress={handleExcelExportBtn}
					isDisabled={guests.length == 0}
				>
					ייצוא לאקסל
				</Button>

				<GuestCards
					isLoading={guestsIsLoading}
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
					weaponForm={event.weapon_form}
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
