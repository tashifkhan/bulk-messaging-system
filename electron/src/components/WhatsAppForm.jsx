import { useState, useEffect } from "react";

const WhatsAppIcon = () => (
	<svg className="w-5 h-5" viewBox="0 0 32 32" fill="currentColor">
		<path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.832 4.584 2.236 6.393L4 29l7.828-2.236C13.416 27.168 15.615 28 18 28c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-2.021 0-3.938-.586-5.555-1.6l-.396-.25-4.646 1.328 1.328-4.646-.25-.396C6.586 18.938 6 17.021 6 15c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.29-7.71c-.26-.13-1.54-.76-1.78-.85-.24-.09-.41-.13-.58.13-.17.26-.67.85-.82 1.02-.15.17-.3.19-.56.06-.26-.13-1.09-.4-2.07-1.28-.76-.68-1.27-1.52-1.42-1.78-.15-.26-.02-.4.11-.53.11-.11.26-.3.39-.45.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.06-.13-.58-1.39-.8-1.91-.21-.51-.43-.44-.58-.45-.15-.01-.32-.01-.5-.01-.17 0-.45.06-.68.32-.23.26-.9.88-.9 2.15s.92 2.49 1.05 2.66c.13.17 1.81 2.77 4.39 3.78.61.21 1.09.33 1.46.42.61.13 1.16.11 1.6.07.49-.05 1.54-.63 1.76-1.24.22-.61.22-1.13.15-1.24-.07-.11-.24-.17-.5-.3z" />
	</svg>
);
const FolderIcon = () => (
	<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
		<path d="M9.75 3A3.75 3.75 0 0 0 6 6.75v10.5A3.75 3.75 0 0 0 9.75 21h4.5A3.75 3.75 0 0 0 18 17.25V9a3 3 0 0 0-3-3h-1.379a1.5 1.5 0 0 1-1.06-.44L11.5 4.5A1.5 1.5 0 0 0 10.44 4.06L9.75 3z" />
	</svg>
);
const SendIcon = () => (
	<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
		<path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405z" />
	</svg>
);

export default function WhatsAppForm() {
	const [waContacts, setWaContacts] = useState([]);
	const [waMessage, setWaMessage] = useState("");
	const [waStatus, setWaStatus] = useState("");
	const [waQR, setWaQR] = useState(null);
	const [waSending, setWaSending] = useState(false);
	const [waResults, setWaResults] = useState([]);

	useEffect(() => {
		const removeWaStatus = window.electronAPI?.onWhatsAppStatus?.((_, status) =>
			setWaStatus(status)
		);
		const removeWaQR = window.electronAPI?.onWhatsAppQR?.((_, qr) =>
			setWaQR(qr)
		);
		const removeWaSendStatus = window.electronAPI?.onWhatsAppSendStatus?.(
			(_, msg) => {
				setWaStatus(msg);
				setWaResults((prev) => [...prev, msg]);
			}
		);
		return () => {
			if (removeWaStatus) removeWaStatus();
			if (removeWaQR) removeWaQR();
			if (removeWaSendStatus) removeWaSendStatus();
		};
	}, []);

	const startWhatsAppClient = async () => {
		setWaStatus("Initializing WhatsApp client...");
		setWaQR(null);
		await window.electronAPI.startWhatsAppClient();
	};

	const importWhatsAppContacts = async () => {
		const contacts = await window.electronAPI.importWhatsAppContacts();
		if (contacts && Array.isArray(contacts)) {
			setWaContacts(contacts);
		}
	};

	const sendWhatsAppBulk = async () => {
		if (!waContacts.length) {
			alert("Please import or enter at least one contact");
			return;
		}
		if (!waMessage.trim()) {
			alert("Please enter a message");
			return;
		}
		setWaSending(true);
		setWaResults([]);
		setWaStatus("Sending...");
		const result = await window.electronAPI.sendWhatsAppMessages({
			contacts: waContacts,
			messageText: waMessage,
		});
		setWaSending(false);
		setWaStatus(
			result.success
				? `Done. Sent: ${result.sent}, Failed: ${result.failed}`
				: result.message
		);
	};

	return (
		<div className="flex justify-center items-start w-full">
			<div className="bg-[#23272a] rounded-2xl shadow-xl border border-[#36393f] p-8 flex flex-col md:flex-row gap-8 w-full max-w-3xl">
				<form className="flex-1 space-y-6">
					<div className="flex items-center gap-2 mb-4">
						<span className="text-green-500">
							<WhatsAppIcon />
						</span>
						<h3 className="text-xl font-semibold text-white">
							WhatsApp Bulk Messaging
						</h3>
					</div>
					<button
						onClick={startWhatsAppClient}
						className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-60 text-base mb-2"
						disabled={waSending}
						type="button"
					>
						<WhatsAppIcon /> Start WhatsApp Client
					</button>
					{waQR && (
						<div className="mt-2 flex flex-col items-center">
							<p className="text-[#b9bbbe] text-sm mb-2">
								Scan this QR code with WhatsApp:
							</p>
							<img
								src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
									waQR
								)}&size=200x200`}
								alt="WhatsApp QR"
								className="border-2 border-green-500 rounded-lg shadow"
							/>
						</div>
					)}
					<div>
						<div className="flex items-center justify-between mb-1">
							<label className="block text-xs font-medium text-[#b9bbbe]">
								Contacts
							</label>
							<button
								onClick={importWhatsAppContacts}
								className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg shadow-sm transition-colors disabled:opacity-60"
								type="button"
								disabled={waSending}
							>
								<FolderIcon /> Import File
							</button>
						</div>
						<textarea
							placeholder="Or paste numbers here (one per line, or number,name)"
							value={waContacts
								.map((c) => c.number + (c.name ? "," + c.name : ""))
								.join("\n")}
							onChange={(e) =>
								setWaContacts(
									e.target.value
										.split(/\r?\n/)
										.filter(Boolean)
										.map((line) => {
											const parts = line.split(",");
											return {
												number: parts[0].trim(),
												name: parts[1] ? parts[1].trim() : null,
											};
										})
								)
							}
							rows={4}
							className="w-full mt-1 px-4 py-2 bg-[#40444b] border border-[#23272a] rounded-lg text-[#dcddde] placeholder-[#72767d] font-mono text-sm resize-none shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
							disabled={waSending}
						/>
						<p className="text-xs text-[#72767d] mt-1">
							Example: <span className="font-mono">+1234567890,John Doe</span>
						</p>
					</div>
					<div>
						<label className="block text-xs font-medium text-[#b9bbbe] mb-1">
							Message
						</label>
						<textarea
							placeholder="Enter your WhatsApp message. Use {{name}} for personalization."
							value={waMessage}
							onChange={(e) => setWaMessage(e.target.value)}
							rows={4}
							className="w-full px-4 py-2 bg-[#40444b] border border-[#23272a] rounded-lg text-[#dcddde] placeholder-[#72767d] text-sm resize-none shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
							disabled={waSending}
						/>
					</div>
					<button
						onClick={sendWhatsAppBulk}
						disabled={waSending}
						type="button"
						className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg shadow-sm transition-all disabled:opacity-50 text-base mt-2"
					>
						<SendIcon /> {waSending ? "Sending..." : "Send WhatsApp Messages"}
					</button>
				</form>
				<div className="w-full md:w-72 space-y-4 flex flex-col">
					<div className="bg-[#36393f] rounded-lg p-4 shadow-sm border border-[#23272a]">
						<h4 className="text-green-400 font-semibold text-sm mb-1">
							Status
						</h4>
						<p className="text-[#b9bbbe] text-xs break-words whitespace-pre-line min-h-[32px]">
							{waStatus}
						</p>
					</div>
					{waResults.length > 0 && (
						<div className="bg-[#36393f] rounded-lg p-4 shadow-sm border border-[#23272a] max-h-48 overflow-y-auto">
							<h4 className="text-green-400 font-semibold text-sm mb-1">
								Results
							</h4>
							{waResults.slice(-10).map((msg, idx) => (
								<div
									key={idx}
									className={`text-xs ${
										msg.includes("Sent to")
											? "text-green-400"
											: msg.includes("Failed")
											? "text-red-400"
											: "text-[#b9bbbe]"
									}`}
								>
									{msg}
								</div>
							))}
							{waResults.length > 10 && (
								<p className="text-center text-[#72767d] text-xs py-1">
									... and {waResults.length - 10} more
								</p>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
