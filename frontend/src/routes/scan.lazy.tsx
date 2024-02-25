import { Html5QrcodeError } from 'html5-qrcode/esm/core';
import { useCallback, useRef, useState } from 'react';

import QrCodeScanner from '@/components/scan/QrCodeScanner/QrCodeScanner';
import ScanResultsCard from '@/components/scan/ScanResultsCard/ScanResultsCard';
import { getGuest } from '@/lib/api/guests';
import { Guest } from '@/lib/types';
import { Spinner } from '@nextui-org/spinner';
import { createLazyFileRoute } from '@tanstack/react-router';

import styles from './scan.module.scss';

export const Route = createLazyFileRoute("/scan")({
	component: Scan,
});

const uuidRegex =
	/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;

function Scan() {
	const [scanError, setScanError] = useState<string | null>(null);
	const cachedScanResultRef = useRef<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [guest, setGuest] = useState<Guest | null>(null);

	const handleScan = useCallback(async (decodedText: string) => {
		try {
			console.log("Scanned:", decodedText);
			if (cachedScanResultRef.current == decodedText) {
				return;
			}
			cachedScanResultRef.current = decodedText;

			if (!uuidRegex.test(decodedText)) {
				console.error("Not a valid UUID");
				throw new Error("קוד לא תקין");
			}

			setIsLoading(true);
			const { data, error, status } = await getGuest(decodedText, true);

			if (status == 404) {
				console.error("Guest not found 404");
				throw new Error("קוד לא תקין");
			}

			if (status != 200) {
				console.error("Status code:", status);
				throw new Error(status + "");
			}

			if (data) {
				setIsLoading(false);
				setScanError(null);
				setGuest(data);

				return;
			}

			throw new Error(error);
		} catch (error) {
			console.error(error);
			setIsLoading(false);
			setScanError((error + "").replace("Error:", ""));
			setGuest(null);
		}
	}, []);

	const handleScanError = useCallback(
		(errorMessage: string, error: Html5QrcodeError) => {
			// 0: No QR code found
			if (error.type == 0) {
				return;
			}

			setScanError(errorMessage);
			console.error(error);
		},
		[]
	);

	const onResultLoaderFinished = useCallback(() => {
		setScanError(null);
		setGuest(null);
		cachedScanResultRef.current = null;
	}, []);

	const handleScannerStateChange = useCallback(() => {
		setScanError(null);
		setGuest(null);
		cachedScanResultRef.current = null;
	}, []);

	return (
		<div className={styles["scan"]}>
			<QrCodeScanner
				qrCodeSuccessCallback={handleScan}
				qrCodeErrorCallback={handleScanError}
				stateChanged={handleScannerStateChange}
			/>
			{isLoading && <Spinner size="lg" color="primary" />}
			<ScanResultsCard
				error={scanError}
				guest={guest}
				loaderFinishedCallback={onResultLoaderFinished}
			/>
		</div>
	);
}
