import { useEffect, useState } from "react";

import AdminTabs from "@/components/dashboard/admin/AdminTabs/AdminTabs";
import EventActionsBtn from "@/components/dashboard/admin/EventActionsBtn/EventActionsBtn";
import NoEvents from "@/components/dashboard/admin/NoEvents/NoEvents";
import SelectEvent from "@/components/dashboard/admin/SelectEvent/SelectEvent";
import EditOrAddEventModal from "@/components/shared/EditOrAddModal/EditOrAddEventModal";
import { MessageModalType } from "@/components/shared/MessageModal/MessageModal";
import ActiveEventContext from "@/contexts/ActiveEventContext";
import useEnsureTokenValid from "@/hooks/useEnsureTokenValid";
import { deleteEvent, getEvent, getEvents } from "@/lib/api/events";
import { APIResponse, Event, ModalType } from "@/lib/types";
import {
	openGlobalModal,
	openYesNoGlobalModal,
} from "@/stores/useGlobalModalStore";
import { Button } from "@nextui-org/button";
import { Spinner } from "@nextui-org/spinner";
import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";

import styles from "./admin.module.scss";

export const Route = createLazyFileRoute("/dashboard/admin")({
	component: DashboardAdminIndex,
});

function DashboardAdminIndex() {
	const navigate = useNavigate();

	const [events, setEvents] = useState<Event[]>([]);
	const [activeEvent, setActiveEvent] = useState<Event | null>(null);

	const [isEventModalOpen, setIsEventModalOpen] = useState(false);
	const [eventModalType, setEventModalType] = useState<ModalType>(
		ModalType.NEW
	);

	const openEventModal = (modalType: ModalType) => {
		setIsEventModalOpen(true);
		setEventModalType(modalType);
	};

	const { role, eventId } = useEnsureTokenValid<{
		role?: number;
		eventId?: number;
	}>("/login/admin", "role");

	const {
		isLoading: eventsIsLoading,
		error: errorEvents,
		data: eventsDataRes,
	} = useQuery({
		queryKey: ["events", role, eventId],
		queryFn: async () => {
			if (role == 0) {
				const { data, error, status } = await getEvents();

				if (data) {
					return data;
				}

				if (status == 401) {
					localStorage.removeItem("token");
					navigate({ to: "/login/admin", replace: true });
				}

				throw new Error(error);
			}

			if (!eventId) {
				throw new Error("Event ID not found");
			}

			const { data, error, status } = await getEvent(eventId);

			if (data) {
				return data;
			}

			if (status == 401) {
				localStorage.removeItem("token");
				navigate({ to: "/login/admin", replace: true });
			}

			throw new Error(error);
		},
	});

	useEffect(() => {
		if (eventsDataRes) {
			if (role == 0 && Array.isArray(eventsDataRes)) {
				setEvents(eventsDataRes);

				if (eventsDataRes.length > 0) {
					setActiveEvent(eventsDataRes[0]);
				}
				return;
			}

			setActiveEvent(eventsDataRes as Event);
		}
	}, [role, eventsDataRes]);

	const handleEventActionBtn = (key: string | number) => {
		let deleteRes: APIResponse<boolean>;
		if (!activeEvent) return;

		switch (key) {
			case "new":
				openEventModal(ModalType.NEW);
				break;
			case "edit":
				openEventModal(ModalType.EDIT);
				break;
			case "delete":
				openYesNoGlobalModal({
					modalType: MessageModalType.YesNoDanger,
					title: "מחיקת אירוע",
					bodyText: `האם אתה בטוח שברצונך למחוק את האירוע ${activeEvent.name}?`,
					yesBtnText: "מחק",
					btnCallback: async () => {
						deleteRes = await deleteEvent(activeEvent.id);
					},
					afterClosedCallback: () => {
						if (!deleteRes) {
							return;
						}

						if (deleteRes.data) {
							setEvents((prev) => {
								const newEvents = prev.filter(
									(e) => e.id != activeEvent.id
								);

								if (newEvents.length > 0) {
									setActiveEvent(newEvents[0]);
								} else {
									setActiveEvent(null);
								}

								return newEvents;
							});

							openGlobalModal({
								modalType: MessageModalType.Success,
								title: "האירוע נמחק בהצלחה",
								bodyText: `האירוע ${activeEvent.name} נמחק בהצלחה`,
							});
						} else if (deleteRes.error) {
							openGlobalModal({
								modalType: MessageModalType.Error,
								title: "שגיאה",
								bodyText: `האירוע לא נמחק`,
							});
						}
					},
				});

				break;
			default:
				break;
		}
	};

	if (eventsIsLoading) {
		return <Spinner size="lg" className={styles["spinner"]} />;
	}

	if (errorEvents) {
		return (
			<div className={styles["admin"]}>
				<p className="text-danger" dir="rtl">
					שגיאה בטעינה: {errorEvents.message}
				</p>
			</div>
		);
	}

	return (
		<ActiveEventContext.Provider value={{ activeEvent, setActiveEvent }}>
			<div className={styles["admin"]}>
				{role == 0 && (
					<NoEvents
						shouldRender={events.length == 0 ? true : false}
						handleNewEventBtn={() => {
							openEventModal(ModalType.NEW);
						}}
					/>
				)}

				{role == 0 && events.length > 0 ? (
					<div className={styles["select-event"]}>
						<SelectEvent events={events} />

						<EventActionsBtn onSelect={handleEventActionBtn} />
					</div>
				) : null}

				{role != 0 && (
					<div className={styles["event-name"]}>
						<h1>{activeEvent?.name}</h1>
					</div>
				)}

				<AdminTabs showAdminsTab={role == 0} />

				{role == 0 && (
					<EditOrAddEventModal
						isOpen={isEventModalOpen}
						onClose={() => {
							setIsEventModalOpen(false);
						}}
						modalType={eventModalType}
						event={activeEvent}
						onEventAdded={(event: Event) => {
							events.push(event);
							setActiveEvent(event);
							setEvents([...events]);
						}}
						onEventEdited={(event: Event) => {
							const index = events.findIndex(
								(e) => e.id == event.id
							);
							events[index] = event;
							setEvents([...events]);
							setActiveEvent(event);
						}}
					/>
				)}
			</div>
		</ActiveEventContext.Provider>
	);
}
