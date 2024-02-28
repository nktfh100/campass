import { useContext } from 'react';

import UsersContext from '@/contexts/UsersContext';
import { User } from '@/lib/types';
import { Pagination } from '@nextui-org/pagination';
import { Spinner } from '@nextui-org/spinner';

import UserCard from './UserCard';
import styles from './UserCards.module.scss';

export default function UserCards({
	isLoading,
	pageCount,
	currentPage,
	usersCount,
	onPageChange,
	onUserClick,
}: {
	isLoading: boolean;
	pageCount: number;
	currentPage: number;
	usersCount: number;
	eventName: string;
	onPageChange: (page: number) => void;
	onUserClick: (user: User) => void;
}) {
	const { users } = useContext(UsersContext);

	return (
		<div className={styles["container"]}>
			{users && <p>סהכ מזמינים: {usersCount}</p>}
			<Pagination
				total={pageCount}
				page={currentPage}
				onChange={onPageChange}
				className={styles["pagination"]}
				color="primary"
			/>
			{isLoading && <Spinner className={styles["spinner"]} />}
			{!isLoading && (
				<div className={styles["cards"]}>
					{users.map((user) => (
						<UserCard
							key={user.id}
							user={user}
							onClick={onUserClick}
						/>
					))}
				</div>
			)}
		</div>
	);
}
