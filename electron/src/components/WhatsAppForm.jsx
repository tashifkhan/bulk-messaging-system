import { useState, useEffect } from "react";
import { FolderIcon, SendIcon, WhatsAppIcon } from "./Icons";

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
		<div className="flex justify-center items-start w-full min-h-[80vh] bg-[#313338] py-12">
			<div className="bg-[#23272a] rounded-3xl shadow-2xl border border-[#2b2d31] p-10 flex flex-col md:flex-row gap-10 w-full max-w-4xl">
				<form className="flex-1 space-y-8">
					<div className="flex items-center gap-3 mb-6">
						<span className="text-green-500">
							<WhatsAppIcon />
						</span>
						<h3 className="text-2xl font-bold text-white tracking-tight">
							WhatsApp Bulk Messaging
						</h3>
					</div>
					<button
						onClick={startWhatsAppClient}
						className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold py-2.5 px-7 rounded-full shadow-md transition-all flex items-center gap-2 disabled:opacity-60 text-base mb-2 focus:outline-none focus:ring-2 focus:ring-green-400"
						disabled={waSending}
						type="button"
					>
						<WhatsAppIcon /> Start WhatsApp Client
					</button>
					{waQR && (
						<div className="mt-4 flex flex-col items-center bg-[#23272a] border border-[#2b2d31] rounded-2xl p-4 shadow-lg">
							<p className="text-[#b9bbbe] text-sm mb-2 font-medium">
								Scan this QR code with WhatsApp:
							</p>
							<img
								src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
									waQR
								)}&size=200x200`}
								alt="WhatsApp QR"
								className="border-4 border-green-500 rounded-xl shadow-md bg-white"
							/>
						</div>
					)}
					<div>
						<div className="flex items-center justify-between mb-2">
							<label className="block text-xs font-semibold text-[#b9bbbe] tracking-wide uppercase">
								Contacts
							</label>
							<button
								onClick={importWhatsAppContacts}
								className="flex items-center gap-2 px-4 py-1.5 bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs rounded-full shadow-sm transition-colors disabled:opacity-60 font-semibold focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
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
							className="w-full mt-1 px-4 py-2.5 bg-[#313338] border border-[#23272a] rounded-xl text-[#dcddde] placeholder-[#72767d] font-mono text-sm resize-none shadow focus:ring-2 focus:ring-[#5865f2] focus:border-transparent transition-all"
							disabled={waSending}
						/>
						<p className="text-xs text-[#72767d] mt-1 font-mono">
							Example: <span className="font-mono">+1234567890,John Doe</span>
						</p>
					</div>
					<div>
						<label className="block text-xs font-semibold text-[#b9bbbe] mb-2 tracking-wide uppercase">
							Message
						</label>
						<textarea
							placeholder="Enter your WhatsApp message. Use {{name}} for personalization."
							value={waMessage}
							onChange={(e) => setWaMessage(e.target.value)}
							rows={4}
							className="w-full px-4 py-2.5 bg-[#313338] border border-[#23272a] rounded-xl text-[#dcddde] placeholder-[#72767d] text-sm resize-none shadow focus:ring-2 focus:ring-[#5865f2] focus:border-transparent transition-all"
							disabled={waSending}
						/>
					</div>
					<button
						onClick={sendWhatsAppBulk}
						disabled={waSending}
						type="button"
						className="flex items-center gap-2 bg-green-500 hover:bg-green-600 active:bg-green-700 disabled:bg-gray-600 text-white font-bold py-2.5 px-7 rounded-full shadow-md transition-all disabled:opacity-50 text-base mt-4 focus:outline-none focus:ring-2 focus:ring-green-400"
					>
						<SendIcon /> {waSending ? "Sending..." : "Send WhatsApp Messages"}
					</button>
				</form>
				<div className="w-full md:w-80 space-y-5 flex flex-col">
					<div className="bg-[#2b2d31] rounded-2xl p-5 shadow border border-[#23272a]">
						<h4 className="text-green-400 font-bold text-sm mb-2 tracking-wide uppercase">
							Status
						</h4>
						<p className="text-[#b9bbbe] text-xs break-words whitespace-pre-line min-h-[32px] font-medium">
							{waStatus}
						</p>
					</div>
					{waResults.length > 0 && (
						<div className="bg-[#2b2d31] rounded-2xl p-5 shadow border border-[#23272a] max-h-56 overflow-y-auto">
							<h4 className="text-green-400 font-bold text-sm mb-2 tracking-wide uppercase">
								Results
							</h4>
							{waResults.slice(-10).map((msg, idx) => (
								<div
									key={idx}
									className={`text-xs font-medium py-0.5 px-2 rounded-lg ${
										msg.includes("Sent to")
											? "text-green-400 bg-green-500/10"
											: msg.includes("Failed")
											? "text-red-400 bg-red-500/10"
											: "text-[#b9bbbe] bg-[#23272a]"
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
