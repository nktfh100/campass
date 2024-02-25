import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type UserStoreState = {
	id: number | undefined;
	fullName: string | undefined;
	eventId: number | undefined;
	idNumber: string | undefined;
	eventName: string | undefined;
	eventDescription: string | undefined;
	eventWelcomeText: string | undefined;
	eventInvitationCount: number | undefined;
};

const useUserStore = create<UserStoreState>()(
	devtools(
		persist(
			(_set) => ({
				id: undefined,
				fullName: undefined,
				eventId: undefined,
				idNumber: undefined,
				eventName: undefined,
				eventDescription: undefined,
				eventWelcomeText: undefined,
				eventInvitationCount: undefined,
			}),
			{ name: "userStore" }
		)
	)
);

export default useUserStore;
