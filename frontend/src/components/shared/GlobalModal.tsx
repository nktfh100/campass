import useGlobalModalStore, {
	closeGlobalModal,
	setModalBtnLoading,
} from "@/stores/useGlobalModalStore";

import MessageModal from "./MessageModal/MessageModal";

export default function GlobalModal() {
	const modalState = useGlobalModalStore((state) => state);

	const handleYesBtnClick = async () => {
		if (modalState.btnCallback) {
			setModalBtnLoading(true);
			await modalState.btnCallback();
			setModalBtnLoading(false);
		}

		closeGlobalModal();
	};

	return (
		<MessageModal
			isOpen={modalState.isOpen}
			onClose={closeGlobalModal}
			title={modalState.title}
			bodyText={modalState.bodyText}
			modalType={modalState.modalType}
			yesBtnText={modalState.yesBtnText}
			noBtnText={modalState.noBtnText}
			isBtnLoading={modalState.isBtnLoading}
			onYesBtnClick={handleYesBtnClick}
		/>
	);
}
