import { useEffect } from "react";

const analyticsUrl = import.meta.env.VITE_ANALYTICS_URL as string;

export default function Analytics() {
	useEffect(() => {
		const script = document.createElement("script");
		script.src = `${analyticsUrl}/script.js`;
		script.defer = true;
		document.body.appendChild(script);

		return () => {
			document.body.removeChild(script);
		};
	}, []);

	return (
		<noscript>
			<img src={`${analyticsUrl}/pixel.gif`} />
		</noscript>
	);
}
