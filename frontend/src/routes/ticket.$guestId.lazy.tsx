import QRCode from "react-qr-code";

import { getGuest } from "@/lib/api/guests";
import { Spinner } from "@nextui-org/spinner";
import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";

import styles from "./ticket.module.scss";

export const Route = createLazyFileRoute("/ticket/$guestId")({
	component: Ticket,
});

function Ticket() {
	const { guestId } = Route.useParams();

	const { isLoading, error, data } = useQuery({
		queryKey: [guestId],
		queryFn: async () => {
			const { data, error } = await getGuest(guestId);

			if (data) {
				return data;
			}

			throw new Error(error);
		},
	});

	return (
		<div className={styles["ticket"]} dir="rtl">
			{isLoading && <Spinner size="lg" />}
			{error && <p className="text-danger">שגיאה: {error.message}</p>}
			{!error && data ? (
				<>
					<h1>{data.event_name}</h1>
					<h2>כרטיס מבקר - {data.full_name}</h2>
					{data.weapon && (
					  <h2>(חמוש)</h2>
					)}
					<h2>יש להציג כרטיס זה בכניסה לקמפוס!</h2>
					<QRCode
						size={256}
						className={styles["qr"]}
						value={data.uuid}
						level="L"
					/>
				</>
			) : null}
		</div>
	);
}
