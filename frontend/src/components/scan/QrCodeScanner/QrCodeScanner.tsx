import {
	Html5Qrcode,
	QrcodeErrorCallback,
	QrcodeSuccessCallback,
} from "html5-qrcode";
import { useEffect, useRef, useState } from "react";

import usePersistedState from "@/hooks/usePersistedState";
import { Button } from "@nextui-org/button";
import { Select, SelectItem } from "@nextui-org/select";

import styles from "./QrCodeScanner.module.scss";

const config = {
	verbose: false,
	formatsToSupport: [0], // Only scan for QR codes
};

const startConfig = {
	fps: 10,
	qrbox: (width: number, height: number) => {
		return { width, height };
	},
};

interface Device {
	id: string;
	label: string;
	value: string;
}

export default function QrCodeScanner({
	qrCodeSuccessCallback,
	qrCodeErrorCallback,
	stateChanged,
}: {
	qrCodeSuccessCallback: QrcodeSuccessCallback;
	qrCodeErrorCallback: QrcodeErrorCallback;
	stateChanged: (isRunning: boolean) => void;
}) {
	const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

	const [isRunning, setIsRunning] = useState(false);

	const [devicesLoaded, setDevicesLoaded] = useState(false);
	const [devices, setDevices] = useState<Device[]>([]);
	const [selectedDevice, setSelectedDevice] =
		usePersistedState("selected-camera");

	useEffect(() => {
		if (devicesLoaded) {
			return;
		}

		Html5Qrcode.getCameras().then((devices) => {
			setDevicesLoaded(true);

			setDevices(
				devices.map((device) => ({
					id: device.id,
					label: device.label,
					value: device.id,
				}))
			);
		});
	}, [devicesLoaded, devices, selectedDevice]);

	useEffect(() => {
		if (!devicesLoaded) {
			return;
		}

		// Make sure the selected device is still available
		if (!devices.find((d) => d.id == selectedDevice)) {
			setSelectedDevice(devices[0]?.id || undefined);
		}
	}, [devicesLoaded, devices, selectedDevice, setSelectedDevice]);

	useEffect(() => {
		stateChanged(isRunning);
	}, [isRunning, stateChanged]);

	const handleStartBtn = async () => {
		if (html5QrCodeRef.current) {
			try {
				await html5QrCodeRef.current.stop();
			} catch (error) {
				console.error(error);
			}
			html5QrCodeRef.current.clear();
		}

		if (!selectedDevice) {
			alert("בחר מצלמה תחילה");
			return;
		}

		const html5QrCode = new Html5Qrcode("reader", config);
		html5QrCodeRef.current = html5QrCode;

		html5QrCode.start(
			selectedDevice,
			startConfig,
			qrCodeSuccessCallback,
			qrCodeErrorCallback
		);

		setIsRunning(true);
	};

	const handleStopBtn = async () => {
		if (html5QrCodeRef.current) {
			try {
				await html5QrCodeRef.current.stop();
			} catch (error) {
				console.error(error);
			}
			html5QrCodeRef.current.clear();
		}

		setIsRunning(false);
	};

	return (
		<div className={styles["scanner"]}>
			<div id="reader" className={styles["scanner__video"]}></div>
			{!isRunning && (
				<>
					<Select
						label="בחר מצלמה"
						selectedKeys={selectedDevice ? [selectedDevice] : []}
						onSelectionChange={(selected: any) => {
							const [first] = selected as Set<string>;
							if (!first) return;

							setSelectedDevice(first);
						}}
						errorMessage={
							devices.length === 0
								? "יש לתת הרשאות כדי להשתמש במצלמה"
								: ""
						}
					>
						{devices.map((device) => (
							<SelectItem key={device.id} value={device.id}>
								{device.label}
							</SelectItem>
						))}
					</Select>

					<Button color="primary" onPress={handleStartBtn}>
						התחל לסרוק
					</Button>
				</>
			)}
			{isRunning && (
				<Button color="danger" onPress={handleStopBtn}>
					עצור
				</Button>
			)}
		</div>
	);
}
