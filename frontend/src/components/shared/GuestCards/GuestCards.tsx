import { useContext } from "react";

import GuestsContext from "@/contexts/GuestsContext";
import { Guest } from "@/lib/types";
import { Pagination } from "@nextui-org/pagination";
import { Spinner } from "@nextui-org/spinner";

import GuestCard from "./GuestCard";
import styles from "./GuestCards.module.scss";

interface BaseGuestCardsProps {
	isLoading: boolean;
	eventName: string;
	onGuestCardClick: (guest: Guest | Guest) => void;
}

interface AdminGuestCardsProps {
	isAdmin: true;
	pageCount: number;
	currentPage: number;
	guestsCount: number;
	onPageChange: (page: number) => void;
}

interface UserGuestCardsProps {
	isAdmin: false;
	onPageChange?: never;
	pageCount?: never;
	currentPage?: never;
	guestsCount?: never;
}

type GuestCardsProps = BaseGuestCardsProps &
	(AdminGuestCardsProps | UserGuestCardsProps);

export default function GuestCards({
	isLoading,
	pageCount,
	currentPage,
	guestsCount,
	onPageChange,
	isAdmin,
	onGuestCardClick,
}: GuestCardsProps) {
	const { guests } = useContext(GuestsContext);

	return (
		<>
			{guests && isAdmin && <p>סהכ אורחים: {guestsCount}</p>}
			{isAdmin && (
				<Pagination
					total={pageCount}
					page={currentPage}
					onChange={onPageChange}
					className={styles["pagination"]}
				/>
			)}

			{isLoading && <Spinner className={styles["spinner"]} />}

			{!isLoading && (
				<div
					className={`${styles["cards"]} ${styles[isAdmin ? "cards--admin" : "cards--user"]}`}
				>
					{guests.map((guest) => (
						<GuestCard
							key={guest.id}
							guest={guest}
							onClick={onGuestCardClick}
						/>
					))}
				</div>
			)}
		</>
	);
}
