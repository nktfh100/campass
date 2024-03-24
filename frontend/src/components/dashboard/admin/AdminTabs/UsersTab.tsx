import { useEffect, useRef, useState } from "react";

import UserCards from "@/components/dashboard/admin/UserCards/UserCards";
import UserModal from "@/components/dashboard/admin/UserModal/UserModal";
import EditOrAddUserModal from "@/components/shared/EditOrAddModal/EditOrAddUserModal";
import { MessageModalType } from "@/components/shared/MessageModal/MessageModal";
import UsersContext from "@/contexts/UsersContext";
import { uploadUsersExcel } from "@/lib/api/excel";
import { getUsers } from "@/lib/api/users";
import { ApiPagination, Event, ModalType, User } from "@/lib/types";
import { scrollToTop } from "@/lib/utils";
import { openGlobalModal } from "@/stores/useGlobalModalStore";
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

	const fileInputRef = useRef<HTMLInputElement>(null);

	const closeModal = () => {
		setIsModalOpen(false);
		setModalEditUser(null);
	};

	useEffect(() => {
		setCurrentPage(1);
		scrollToTop();
	}, [event.id]);

	const {
		isLoading: usersIsLoading,
		error: usersError,
		data: usersResData,
		refetch: refreshUsers,
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

	const handleExcelImportBtn = async () => {
		fileInputRef.current?.click();
	};

	const handleExcelFileChange = async (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = e.target.files?.[0];
		if (!file) {
			return;
		}

		const res = await uploadUsersExcel(event.id, file);

		if (res.error) {
			openGlobalModal({
				modalType: MessageModalType.Error,
				title: "שגיאה",
				bodyText: res.error,
			});
		}

		if (res.data) {
			openGlobalModal({
				modalType: MessageModalType.Success,
				title: "ייבוא מאקסל",
				bodyText: "המזמינים יובאו בהצלחה",
				afterClosedCallback: () => {
					refreshUsers();
				},
			});
		}
	};

	return (
		<UsersContext.Provider value={{ users, setUsers }}>
			<div className={`fade-in ${stylesShared["tab-content"]}`}>
				<div className={stylesShared["tab__top-buttons"]}>
					<Button onPress={handleExcelImportBtn}>ייבוא מאקסל</Button>
					<Button
						onPress={() => {
							setModalEditUser(null);
							setIsModalOpen(true);
						}}
					>
						הוסף מזמין
					</Button>
				</div>

				{usersError && (
					<p className="text-danger" dir="rtl">
						שגיאה בטעינת המזמינים: {usersError.message}
					</p>
				)}

				<UserCards
					eventName={event.name || ""}
					isLoading={usersIsLoading}
					pageCount={paginationData?.pageCount || 1}
					currentPage={currentPage}
					onPageChange={(page: number) => {
						setCurrentPage(page);
						scrollToTop();
					}}
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

				<input
					type="file"
					ref={fileInputRef}
					hidden
					accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
					onChange={handleExcelFileChange}
				/>
			</div>
		</UsersContext.Provider>
	);
}
