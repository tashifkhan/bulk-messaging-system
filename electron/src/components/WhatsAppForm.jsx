import { useState } from "react";
import { WhatsAppIcon, FolderIcon, SendIcon, CheckIcon } from "./Icons";
import { parseManualNumbers } from "../utils/pyodide.js";

export default function WhatsAppForm({
	waContacts,
	setWaContacts,
	waMessage,
	setWaMessage,
	waStatus,
	waQR,
	waSending,
	waResults,
	startWhatsAppClient,
	logoutWhatsApp,
	importWhatsAppContacts,
	sendWhatsAppBulk,
}) {
	const [logEntries, setLogEntries] = useState([]);
	const [qrError, setQrError] = useState(false);
	const [manualNumbers, setManualNumbers] = useState("");
	const [showManualInput, setShowManualInput] = useState(false);

	const addLogEntry = (message, type = "info") => {
		const timestamp = new Date().toLocaleTimeString();
		setLogEntries((prev) => [
			...prev,
			{ message, type, timestamp, id: Date.now() },
		]);
	};

	const handleQrError = () => {
		setQrError(true);
		addLogEntry("Failed to load QR code image", "error");
	};

	const handleQrLoad = () => {
		setQrError(false);
	};

	const processManualNumbers = async () => {
		if (!manualNumbers.trim()) {
			addLogEntry("Please enter some phone numbers", "error");
			return;
		}
		try {
			const result = await parseManualNumbers(manualNumbers);
			if (result.success) {
				setWaContacts((prevContacts) => [...prevContacts, ...result.contacts]);
				addLogEntry(`Added ${result.count} contacts manually`, "success");
				setManualNumbers("");
				setShowManualInput(false);
			} else {
				addLogEntry(
					result.error || "Failed to process manual numbers",
					"error"
				);
			}
		} catch (error) {
			addLogEntry(`Error processing manual numbers: ${error.message}`, "error");
		}
	};

	const getStatusColor = () => {
		if (waStatus.includes("ready") || waStatus.includes("Authenticated")) {
			return "text-green-400";
		}
		if (waStatus.includes("Waiting") || waStatus.includes("Initializing")) {
			return "text-yellow-400";
		}
		if (waStatus.includes("Error") || waStatus.includes("Failed")) {
			return "text-red-400";
		}
		return "text-gray-400";
	};

	return (
		<div className="w-full max-w-5xl mx-auto">
			{/* Modern Header */}
			<div className="flex items-center justify-between mb-8 p-6 bg-gradient-to-r from-[#25d366]/10 to-[#25d366]/5 rounded-2xl border border-[#25d366]/20">
				<div className="flex items-center gap-4">
					<div className="relative">
						<div className="w-16 h-16 bg-gradient-to-br from-[#25d366] to-[#128c7e] rounded-2xl flex items-center justify-center shadow-lg">
							<WhatsAppIcon className="w-8 h-8 text-white" />
						</div>
						<div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#23272a] rounded-full flex items-center justify-center border-2 border-[#25d366]">
							<div
								className={`w-3 h-3 rounded-full ${
									waStatus.includes("ready") ||
									waStatus.includes("Authenticated")
										? "bg-green-400"
										: waStatus.includes("Initializing") ||
										  waStatus.includes("Waiting")
										? "bg-yellow-400"
										: "bg-gray-500"
								}`}
							></div>
						</div>
					</div>
					<div>
						<h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
							WhatsApp Mass Sender
						</h1>
						<p className="text-gray-400 font-medium">
							Send bulk messages through WhatsApp Web
						</p>
					</div>
				</div>
				<div className="text-right">
					<div className="text-sm text-gray-400 mb-1">Status</div>
					<div className={`font-semibold text-lg ${getStatusColor()}`}>
						{waStatus || "Not started"}
					</div>
				</div>
			</div>

			{/* Main Content Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column - Controls */}
				<div className="lg:col-span-2 space-y-6">
					{/* Connection Control */}
					<div className="bg-[#2b2d31] rounded-xl p-6 border border-[#404249] shadow-xl">
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-[#5865f2] rounded-lg flex items-center justify-center">
									<WhatsAppIcon className="w-5 h-5 text-white" />
								</div>
								<div>
									<h3 className="text-lg font-semibold text-white">
										Connection
									</h3>
									<p className="text-sm text-gray-400">
										Manage WhatsApp Web connection
									</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								{(waStatus.includes("ready") ||
									waStatus.includes("Authenticated") ||
									waStatus.includes("Client is ready")) && (
									<button
										onClick={logoutWhatsApp}
										disabled={waSending}
										className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center gap-2"
									>
										<div className="w-4 h-4">
											<svg viewBox="0 0 24 24" fill="currentColor">
												<path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
											</svg>
										</div>
										Logout
									</button>
								)}
								<button
									onClick={startWhatsAppClient}
									disabled={
										waSending ||
										waStatus.includes("ready") ||
										waStatus.includes("Authenticated") ||
										waStatus.includes("Client is ready")
									}
									className="px-6 py-3 bg-gradient-to-r from-[#5865f2] to-[#4752c4] hover:from-[#4752c4] hover:to-[#3c45a3] disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center gap-2"
								>
									<WhatsAppIcon className="w-4 h-4" />
									{waSending
										? "Connecting..."
										: waStatus.includes("ready") ||
										  waStatus.includes("Authenticated") ||
										  waStatus.includes("Client is ready")
										? "Connected"
										: "Connect to WhatsApp"}
								</button>
							</div>
						</div>

						{/* QR Code Display / Loading */}
						{(waStatus.includes("Initializing") ||
							waStatus.includes("WhatsApp client initializing")) &&
							!waQR && (
								<div className="bg-gradient-to-br from-white/5 to-white/10 rounded-xl p-6 border border-white/10">
									<div className="text-center">
										<h4 className="text-white font-semibold mb-4">
											Initializing WhatsApp Client
										</h4>
										<div className="flex justify-center mb-4">
											<div className="relative">
												<div className="w-16 h-16 border-4 border-[#25d366]/20 border-t-[#25d366] rounded-full animate-spin"></div>
												<div className="absolute inset-0 flex items-center justify-center">
													<WhatsAppIcon className="w-6 h-6 text-[#25d366]" />
												</div>
											</div>
										</div>
										<p className="text-gray-400 text-sm">
											Please wait while we set up the WhatsApp connection...
										</p>
										<div className="mt-3">
											<div className="text-xs text-gray-500">
												Status: {waStatus}
											</div>
										</div>
									</div>
								</div>
							)}

						{waQR && (
							<div className="bg-gradient-to-br from-white/5 to-white/10 rounded-xl p-6 border border-white/10">
								<div className="text-center mb-4">
									<h4 className="text-white font-semibold mb-2">
										Scan QR Code
									</h4>
									<p className="text-gray-400 text-sm">
										Open WhatsApp on your phone → Settings → Linked Devices →
										Link a Device
									</p>
								</div>
								<div className="flex justify-center">
									<div className="bg-white p-4 rounded-2xl shadow-2xl">
										{qrError ? (
											<div className="w-48 h-48 rounded-lg bg-gray-100 flex flex-col items-center justify-center">
												<div className="text-gray-500 text-center">
													<div className="text-lg mb-2">⚠️</div>
													<p className="text-sm">QR Code Failed to Load</p>
													<p className="text-xs mt-1">
														Check console for details
													</p>
												</div>
											</div>
										) : (
											<img
												src={waQR}
												alt="WhatsApp QR Code"
												className="w-48 h-48 rounded-lg"
												onError={handleQrError}
												onLoad={handleQrLoad}
											/>
										)}
									</div>
								</div>
								{qrError && (
									<div className="text-center mt-4">
										<button
											onClick={() => {
												setQrError(false);
												startWhatsAppClient();
											}}
											className="px-4 py-2 bg-[#5865f2] text-white rounded-lg text-sm hover:bg-[#4752c4] transition-colors"
										>
											Retry Connection
										</button>
									</div>
								)}
							</div>
						)}

						{/* Success Message when authenticated */}
						{!waQR &&
							(waStatus.includes("ready") ||
								waStatus.includes("Authenticated") ||
								waStatus.includes("Client is ready")) && (
								<div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl p-6 border border-green-500/20">
									<div className="text-center">
										<div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
											<CheckIcon className="w-8 h-8 text-white" />
										</div>
										<h4 className="text-white font-semibold mb-2">
											WhatsApp Connected Successfully!
										</h4>
										<p className="text-gray-400 text-sm">
											Your WhatsApp is now connected and ready to send messages.
										</p>
										<div className="mt-3">
											<div className="text-xs text-green-400">
												Status: {waStatus}
											</div>
										</div>
									</div>
								</div>
							)}
					</div>

					{/* Contact Management */}
					<div className="bg-[#2b2d31] rounded-xl p-6 border border-[#404249] shadow-xl">
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-[#23a55a] rounded-lg flex items-center justify-center">
									<FolderIcon className="w-5 h-5 text-white" />
								</div>
								<div>
									<h3 className="text-lg font-semibold text-white">Contacts</h3>
									<p className="text-sm text-gray-400">
										Import your contact list or add manually
									</p>
								</div>
							</div>
							<div className="flex gap-3">
								<button
									onClick={() => setShowManualInput(!showManualInput)}
									disabled={waSending}
									className="px-6 py-3 bg-gradient-to-r from-[#5865f2] to-[#4752c4] hover:from-[#4752c4] hover:to-[#3c45a3] disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center gap-2"
								>
									<span className="text-sm">📝</span>
									Add Manually
								</button>
								<button
									onClick={importWhatsAppContacts}
									disabled={waSending}
									className="px-6 py-3 bg-gradient-to-r from-[#23a55a] to-[#1e8e4f] hover:from-[#1e8e4f] hover:to-[#198a47] disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center gap-2"
								>
									<FolderIcon className="w-4 h-4" />
									Import File
								</button>
							</div>
						</div>

						{/* Manual Number Input */}
						{showManualInput && (
							<div className="mb-6 bg-[#313338] rounded-lg p-4 border border-[#404249]">
								<div className="text-sm text-gray-400 mb-3">
									Enter phone numbers manually (one per line). You can also
									include names:
								</div>
								<div className="text-xs text-gray-500 mb-3 space-y-1">
									<div>• Format: +1234567890</div>
									<div>• With name: John Doe: +1234567890</div>
									<div>• Or: +1234567890 - John Doe</div>
								</div>
								<textarea
									value={manualNumbers}
									onChange={(e) => setManualNumbers(e.target.value)}
									placeholder="Enter phone numbers here...&#10;+1234567890&#10;John Doe: +0987654321&#10;+1111222333 - Jane Smith"
									className="w-full h-32 px-3 py-2 bg-[#2b2d31] border border-[#404249] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#5865f2] focus:ring-2 focus:ring-[#5865f2]/20 resize-none"
								/>
								<div className="flex justify-between items-center mt-3">
									<div className="text-xs text-gray-500">
										{
											manualNumbers.split("\n").filter((line) => line.trim())
												.length
										}{" "}
										numbers entered
									</div>
									<div className="flex gap-2">
										<button
											onClick={() => {
												setManualNumbers("");
												setShowManualInput(false);
											}}
											className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
										>
											Cancel
										</button>
										<button
											onClick={processManualNumbers}
											disabled={!manualNumbers.trim() || waSending}
											className="px-4 py-2 bg-[#5865f2] hover:bg-[#4752c4] disabled:bg-gray-600 text-white rounded-lg text-sm transition-colors disabled:cursor-not-allowed"
										>
											Add Numbers
										</button>
									</div>
								</div>
							</div>
						)}

						<div className="grid grid-cols-3 gap-4 mb-4">
							<div className="bg-[#313338] rounded-lg p-4 border border-[#404249]">
								<div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
									Contacts Loaded
								</div>
								<div className="text-2xl font-bold text-white">
									{waContacts.length}
								</div>
							</div>
							<div className="bg-[#313338] rounded-lg p-4 border border-[#404249]">
								<div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
									File Status
								</div>
								<div className="text-sm font-semibold text-white">
									{waContacts.length > 0 ? "Ready" : "No contacts"}
								</div>
							</div>
							<div className="bg-[#313338] rounded-lg p-4 border border-[#404249] flex items-center justify-center">
								{waContacts.length > 0 && (
									<button
										onClick={() => {
											setWaContacts([]);
											addLogEntry("Cleared all contacts", "info");
										}}
										disabled={waSending}
										className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded text-sm transition-colors disabled:cursor-not-allowed"
									>
										Clear All
									</button>
								)}
							</div>
						</div>

						{/* Contact Preview */}
						{waContacts.length > 0 && (
							<div className="bg-[#313338] rounded-lg p-4 border border-[#404249]">
								<div className="text-xs text-gray-400 uppercase tracking-wide mb-3">
									Contact Preview
								</div>
								<div className="space-y-2 max-h-32 overflow-y-auto">
									{waContacts.slice(0, 5).map((contact, index) => (
										<div
											key={index}
											className="flex items-center gap-3 py-2 px-3 bg-[#2b2d31] rounded-lg"
										>
											<div className="w-8 h-8 bg-[#5865f2] rounded-full flex items-center justify-center text-white font-semibold text-xs">
												{(contact.name || contact.number)
													.charAt(0)
													.toUpperCase()}
											</div>
											<div className="flex-1 min-w-0">
												<div className="text-white font-medium truncate">
													{contact.name || "Unknown"}
												</div>
												<div className="text-gray-400 text-sm">
													{contact.number}
												</div>
											</div>
										</div>
									))}
									{waContacts.length > 5 && (
										<div className="text-center text-gray-400 text-sm py-2">
											+{waContacts.length - 5} more contacts
										</div>
									)}
								</div>
							</div>
						)}
					</div>

					{/* Message Composer */}
					<div className="bg-[#2b2d31] rounded-xl p-6 border border-[#404249] shadow-xl">
						<div className="flex items-center gap-3 mb-6">
							<div className="w-10 h-10 bg-[#f23f42] rounded-lg flex items-center justify-center">
								<SendIcon className="w-5 h-5 text-white" />
							</div>
							<div>
								<h3 className="text-lg font-semibold text-white">Message</h3>
								<p className="text-sm text-gray-400">
									Compose your bulk message
								</p>
							</div>
						</div>

						<div className="space-y-4">
							<div className="relative">
								<textarea
									value={waMessage}
									onChange={(e) => setWaMessage(e.target.value)}
									placeholder="Type your message here... Use {{name}} to personalize with contact names."
									disabled={waSending}
									className="w-full h-40 px-4 py-3 bg-[#313338] border border-[#404249] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#5865f2] focus:ring-2 focus:ring-[#5865f2]/20 disabled:opacity-50 resize-none transition-all duration-200"
								/>
								<div className="absolute bottom-3 right-3 text-xs text-gray-500">
									{waMessage.length}/4096
								</div>
							</div>

							<div className="flex items-center gap-2 text-sm text-gray-400">
								<div className="w-2 h-2 bg-[#5865f2] rounded-full"></div>
								<span>
									Use{" "}
									<code className="bg-[#313338] px-1 py-0.5 rounded text-[#5865f2]">{`{{name}}`}</code>{" "}
									for personalization
								</span>
							</div>

							<button
								onClick={sendWhatsAppBulk}
								disabled={
									waSending || waContacts.length === 0 || !waMessage.trim()
								}
								className="w-full px-6 py-4 bg-gradient-to-r from-[#f23f42] to-[#da373c] hover:from-[#da373c] hover:to-[#c2312f] disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-3"
							>
								{waSending ? (
									<>
										<div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
										<span>Sending Messages...</span>
									</>
								) : (
									<>
										<SendIcon className="w-5 h-5" />
										<span>Send Mass Messages</span>
									</>
								)}
							</button>
						</div>
					</div>
				</div>

				{/* Right Column - Activity Log */}
				<div className="space-y-6">
					<div className="bg-[#2b2d31] rounded-xl p-6 border border-[#404249] shadow-xl h-[600px] flex flex-col">
						<div className="flex items-center gap-3 mb-6">
							<div className="w-10 h-10 bg-[#faa61a] rounded-lg flex items-center justify-center">
								<div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
									<div className="w-2 h-2 bg-[#faa61a] rounded-full"></div>
								</div>
							</div>
							<div>
								<h3 className="text-lg font-semibold text-white">
									Activity Log
								</h3>
								<p className="text-sm text-gray-400">
									Real-time message status
								</p>
							</div>
						</div>

						<div className="flex-1 bg-[#313338] rounded-lg border border-[#404249] overflow-hidden">
							{waResults.length === 0 && logEntries.length === 0 ? (
								<div className="h-full flex flex-col items-center justify-center text-gray-500">
									<div className="w-16 h-16 bg-[#404249] rounded-full flex items-center justify-center mb-4">
										<div className="w-8 h-8 border-2 border-gray-500 border-dashed rounded-full"></div>
									</div>
									<p className="font-medium">No activity yet</p>
									<p className="text-sm">Messages will appear here</p>
								</div>
							) : (
								<div className="h-full overflow-y-auto p-4">
									<div className="space-y-3">
										{/* Display WhatsApp results */}
										{waResults.map((result, index) => (
											<div
												key={`result-${index}`}
												className="flex items-start gap-3 p-3 rounded-lg bg-[#2b2d31] border border-[#404249]"
											>
												<div
													className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
														result.includes("Success") ||
														result.includes("sent")
															? "bg-green-400"
															: result.includes("Error") ||
															  result.includes("failed")
															? "bg-red-400"
															: "bg-gray-400"
													}`}
												></div>
												<div className="flex-1 min-w-0">
													<div className="text-xs text-gray-400 mb-1">
														{new Date().toLocaleTimeString()}
													</div>
													<div
														className={`text-sm ${
															result.includes("Success") ||
															result.includes("sent")
																? "text-green-400"
																: result.includes("Error") ||
																  result.includes("failed")
																? "text-red-400"
																: "text-gray-300"
														}`}
													>
														{result}
													</div>
												</div>
											</div>
										))}

										{/* Display log entries */}
										{logEntries.map((entry) => (
											<div
												key={entry.id}
												className="flex items-start gap-3 p-3 rounded-lg bg-[#2b2d31] border border-[#404249]"
											>
												<div
													className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
														entry.type === "success"
															? "bg-green-400"
															: entry.type === "error"
															? "bg-red-400"
															: entry.type === "warning"
															? "bg-yellow-400"
															: "bg-gray-400"
													}`}
												></div>
												<div className="flex-1 min-w-0">
													<div className="text-xs text-gray-400 mb-1">
														{entry.timestamp}
													</div>
													<div
														className={`text-sm ${
															entry.type === "success"
																? "text-green-400"
																: entry.type === "error"
																? "text-red-400"
																: entry.type === "warning"
																? "text-yellow-400"
																: "text-gray-300"
														}`}
													>
														{entry.message}
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
