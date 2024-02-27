import { useEffect, useState } from "react";

import EditOrAddAdminModal from "@/components/dashboard/admin/EditOrAddAdminModal/EditOrAddAdminModal";
import AdminsContext from "@/contexts/AdminsContext";
import { getAdmins } from "@/lib/api/admins";
import { Admin, Event, ModalType } from "@/lib/types";
import { Button } from "@nextui-org/button";
import { useQuery } from "@tanstack/react-query";

import EventAdminCards from "../EventAdminsTabs/EventAdminCards";
import stylesShared from "./AdminTabShared.module.scss";

export default function EventAdminsTab({ event }: { event: Event }) {
	const [admins, setAdmins] = useState<Admin[]>([]);

	// Edit/Add admin modal
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalEditAdmin, setModalEditAdmin] = useState<Admin | null>(null);

	const closeModal = () => {
		setIsModalOpen(false);
		setModalEditAdmin(null);
	};

	const {
		isLoading: adminsIsLoading,
		error: adminsError,
		data: AdminsResData,
	} = useQuery({
		queryKey: ["admins", event.id],
		queryFn: async () => {
			const { data, error } = await getAdmins(event.id);

			if (data) {
				return data;
			}

			throw new Error(error);
		},
	});

	useEffect(() => {
		if (AdminsResData) {
			setAdmins(AdminsResData);
		}
	}, [AdminsResData]);

	return (
		<AdminsContext.Provider value={{ admins, setAdmins }}>
			<div className={`fade-in ${stylesShared["tab-content"]}`}>
				<Button
					onPress={() => {
						setModalEditAdmin(null);
						setIsModalOpen(true);
					}}
				>
					הוסף מפקד
				</Button>

				{adminsError && (
					<p className="text-danger" dir="rtl">
						שגיאה בטעינה: {adminsError.message}
					</p>
				)}

				<EditOrAddAdminModal
					eventId={event.id}
					eventName={event.name}
					isOpen={isModalOpen}
					onClose={closeModal}
					modalType={modalEditAdmin ? ModalType.EDIT : ModalType.NEW}
					admin={modalEditAdmin}
				/>
				<EventAdminCards
					isLoading={adminsIsLoading}
					onAdminClick={(admin: Admin) => {
						setModalEditAdmin(admin);
						setIsModalOpen(true);
					}}
				/>
			</div>
		</AdminsContext.Provider>
	);
}
