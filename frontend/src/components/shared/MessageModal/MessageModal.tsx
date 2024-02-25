import { Button } from "@nextui-org/button";
import {
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
} from "@nextui-org/modal";

import styles from "./MessageModal.module.scss";

export enum MessageModalType {
	Info = "default",
	Success = "success",
	Error = "danger",
	YesNo = "yes-no",
	YesNoDanger = "yes-no-danger",
}

interface MessageModalProps {
	modalType: MessageModalType;
	isOpen: boolean;
	onClose: () => void;
	title: string;
	bodyText?: string;
	onYesBtnClick?: () => void;
	isBtnLoading?: boolean;
	yesBtnText?: string;
	noBtnText?: string;
}

export default function MessageModal({
	modalType,
	isOpen,
	onClose,
	title,
	bodyText,
	onYesBtnClick,
	isBtnLoading,
	yesBtnText,
	noBtnText,
}: MessageModalProps) {
	const isYesNoModal =
		modalType == MessageModalType.YesNo ||
		modalType == MessageModalType.YesNoDanger;

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			onClose();
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onOpenChange={handleOpenChange}
			placement="center"
		>
			<ModalContent>
				<ModalHeader className={styles["modal-header"]}>
					<p>{title}</p>
				</ModalHeader>

				{bodyText && (
					<ModalBody className={styles["modal-body"]} dir="rtl">
						<p>{bodyText}</p>
					</ModalBody>
				)}

				<ModalFooter className={styles["modal-footer"]}>
					{isYesNoModal ? (
						<>
							<Button
								color="secondary"
								onPress={onClose}
								dir="rtl"
							>
								{noBtnText || "לא"}
							</Button>
							<Button
								color={
									modalType == MessageModalType.YesNoDanger
										? "danger"
										: "primary"
								}
								onPress={onYesBtnClick}
								isLoading={isBtnLoading}
								dir="rtl"
							>
								{yesBtnText || "כן"}
							</Button>
						</>
					) : (
						<Button color="primary" onPress={onClose}>
							סגור
						</Button>
					)}
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
