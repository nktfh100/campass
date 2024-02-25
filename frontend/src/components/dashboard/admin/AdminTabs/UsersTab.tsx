import { useEffect, useState } from "react";

import EditOrAddUserModal from "@/components/dashboard/admin/EditOrAddUserModal/EditOrAddUserModal";
import UserCards from "@/components/dashboard/admin/UserCards/UserCards";
import UserModal from "@/components/dashboard/admin/UserModal/UserModal";
import UsersContext from "@/contexts/UsersContext";
import { getUsers } from "@/lib/api/users";
import { ApiPagination, Event, ModalType, User } from "@/lib/types";
import { Button } from "@nextui-org/button";
import { useQuery } from "@tanstack/react-query";

import stylesShared from "./AdminTabShared.module.scss";

export default function UsersTab({ event }: { event: Event }) {
	const [users, setUsers] = useState<User[]>([]);

	const [paginationData, setPaginationData] = useState<ApiPagination | null>(
		null
	);
	const [currentPage, setCurrentPage] = useState(1);

	// Edit/Add user modal
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalEditUser, setModalEditUser] = useState<User | null>(null);

	// User info modal
	const [infoModalUser, setInfoModalUser] = useState<User | null>(null);

	const closeModal = () => {
		setIsModalOpen(false);
		setModalEditUser(null);
	};

	useEffect(() => {
		setCurrentPage(1);
	}, [event.id]);

	const {
		isLoading: usersIsLoading,
		error: usersError,
		data: usersResData,
	} = useQuery({
		queryKey: ["users", event.id, currentPage],
		queryFn: async () => {
			const { data, error } = await getUsers({
				eventId: event.id,
				page: currentPage,
			});

			if (data) {
				return data;
			}

			throw new Error(error);
		},
	});

	useEffect(() => {
		if (usersResData?.pagination) {
			setPaginationData(usersResData.pagination);
		}
		if (usersResData?.users) {
			setUsers(usersResData.users);
		}
	}, [usersResData]);

	return (
		<UsersContext.Provider value={{ users, setUsers }}>
			<div className={`fade-in ${stylesShared["tab-content"]}`}>
				<Button
					onPress={() => {
						setModalEditUser(null);
						setIsModalOpen(true);
					}}
				>
					הוסף משתמש
				</Button>

				{usersError && (
					<p className="text-danger" dir="rtl">
						שגיאה בטעינת המשתמשים: {usersError.message}
					</p>
				)}

				<UserCards
					eventName={event.name || ""}
					isLoading={usersIsLoading}
					pageCount={paginationData?.pageCount || 1}
					currentPage={currentPage}
					onPageChange={(page: number) => setCurrentPage(page)}
					onUserClick={(user: User) => setInfoModalUser(user)}
					usersCount={paginationData?.totalCount || 0}
				/>

				<EditOrAddUserModal
					eventId={event.id}
					eventName={event.name}
					isOpen={isModalOpen}
					onClose={closeModal}
					modalType={modalEditUser ? ModalType.EDIT : ModalType.NEW}
					user={modalEditUser}
					onUserEdited={(user: User) => setInfoModalUser(user)}
				/>

				<UserModal
					eventName={event.name}
					user={infoModalUser}
					isOpen={infoModalUser != null}
					onClose={() => setInfoModalUser(null)}
					onEditBtnClick={() => {
						setModalEditUser(infoModalUser);
						setIsModalOpen(true);
					}}
					onUserDeleted={() => setInfoModalUser(null)}
				/>
			</div>
		</UsersContext.Provider>
	);
}
