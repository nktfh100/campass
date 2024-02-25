import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { MessageModalType } from "@/components/shared/MessageModal/MessageModal";

type GlobalModalStoreState = {
	modalType: MessageModalType;
	isOpen: boolean;
	title: string;
	bodyText?: string;
	isBtnLoading: boolean;
	btnCallback?: () => void | Promise<void>;
	closeCallback?: () => void;
	yesBtnText?: string;
	noBtnText?: string;
	afterClosedCallback?: () => void;
};

const useGlobalModalStore = create<GlobalModalStoreState>()(
	devtools((_set) => ({
		modalType: MessageModalType.Info,
		isOpen: false,
		title: "",
		isBtnLoading: false,
	}))
);

export const openGlobalModal = ({
	modalType,
	title,
	bodyText,
	closeCallback,
	afterClosedCallback,
}: {
	modalType: MessageModalType;
	title: string;
	bodyText?: string;
	closeCallback?: () => void;
	afterClosedCallback?: () => void;
}) => {
	useGlobalModalStore.setState({
		modalType,
		isOpen: true,
		title,
		bodyText,
		closeCallback,
		afterClosedCallback,
		btnCallback: undefined,
	});
};

export const openYesNoGlobalModal = ({
	modalType,
	title,
	bodyText,
	btnCallback,
	yesBtnText,
	noBtnText,
	afterClosedCallback,
}: {
	modalType: MessageModalType.YesNo | MessageModalType.YesNoDanger;
	title: string;
	bodyText?: string;
	btnCallback?: () => void | Promise<void>;
	yesBtnText?: string;
	noBtnText?: string;
	afterClosedCallback?: () => void;
}) => {
	useGlobalModalStore.setState({
		modalType,
		isOpen: true,
		title,
		bodyText,
		btnCallback,
		yesBtnText,
		noBtnText,
		afterClosedCallback,
		closeCallback: undefined,
	});
};

export const closeGlobalModal = () => {
	const modalState = useGlobalModalStore.getState();
	if (modalState.closeCallback) {
		modalState.closeCallback();
	}

	useGlobalModalStore.setState({
		isOpen: false,
	});

	if (modalState.afterClosedCallback) {
		modalState.afterClosedCallback();
	}
};

export const setModalBtnLoading = (isBtnLoading: boolean) => {
	useGlobalModalStore.setState({
		isBtnLoading,
	});
};

export default useGlobalModalStore;
