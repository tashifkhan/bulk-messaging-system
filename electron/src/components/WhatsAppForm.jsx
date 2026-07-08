import React, { useState, useRef } from "react";
import { WhatsAppIcon, FolderIcon, SendIcon, HashIcon } from "./Icons";
import { parseManualNumbers } from "../shared/contact-parser.js";

function SectionHeader({ title }) {
	return (
		<div className="pt-6 pb-2 px-4">
			<div className="flex items-center gap-2">
				<HashIcon />
				<h2 className="text-xs font-semibold text-[#949ba4] uppercase tracking-wider">
					{title}
				</h2>
				<div className="flex-1 h-px bg-[#3f4149]" />
			</div>
		</div>
	);
}

function DiscordMessage({ avatar, username, color, timestamp, content, type }) {
	const statusColors = {
		success: "#23a55a",
		error: "#f23f43",
		warning: "#f0b232",
		info: "#949ba4",
	};
	const dotColor = statusColors[type] || null;

	return (
		<div className="group flex items-start gap-4 px-4 py-2 rounded hover:bg-[#2e3035] transition-colors">
			<div
				className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-sm font-semibold"
				style={{ backgroundColor: color }}
			>
				{avatar}
			</div>
			<div className="min-w-0 flex-1">
				<div className="flex items-baseline gap-2">
					<span className="text-sm font-semibold" style={{ color }}>
						{username}
					</span>
					<span className="text-[10px] text-[#949ba4]">{timestamp}</span>
					{dotColor && (
						<div
							className="w-2 h-2 rounded-full ml-auto flex-shrink-0"
							style={{ backgroundColor: dotColor }}
						/>
					)}
				</div>
				<div className="text-sm text-[#dbdee1] mt-0.5 whitespace-pre-wrap break-words">
					{content}
				</div>
			</div>
		</div>
	);
}

function DiscordInput({ className = "", ...props }) {
	return (
		<input
			className={`w-full px-3 py-2.5 bg-[#383a40] text-[#dbdee1] placeholder-[#6d6f78] rounded-[4px] text-sm border-none focus:ring-2 focus:ring-[#5865f2]/30 transition-shadow ${className}`}
			{...props}
		/>
	);
}

const DiscordTextarea = React.forwardRef(({ className = "", ...props }, ref) => {
	return (
		<textarea
			ref={ref}
			className={`w-full px-3 py-2.5 bg-[#383a40] text-[#dbdee1] placeholder-[#6d6f78] rounded-[4px] text-sm border-none focus:ring-2 focus:ring-[#5865f2]/30 transition-shadow resize-none ${className}`}
			{...props}
		/>
	);
});

function DiscordButton({ variant = "primary", className = "", children, ...props }) {
	const variants = {
		primary: "bg-[#5865f2] hover:bg-[#4752c4] text-white",
		green: "bg-[#23a55a] hover:bg-[#1a8a4a] text-white",
		red: "bg-[#da373c] hover:bg-[#a1282b] text-white",
		secondary: "bg-[#4e5058] hover:bg-[#6d6f78] text-white",
		ghost: "bg-transparent hover:bg-[#393c41] text-[#949ba4] hover:text-[#dbdee1]",
	};
	return (
		<button
			className={`px-4 py-2 rounded-[4px] text-sm font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${variants[variant] || variants.primary} ${className}`}
			{...props}
		>
			{children}
		</button>
	);
}

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
	contactFieldNames = [],
	templateService,
}) {
	const textareaRef = useRef(null);
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
		if (waStatus.includes("ready") || waStatus.includes("Authenticated")) return "#23a55a";
		if (waStatus.includes("Waiting") || waStatus.includes("Initializing")) return "#f0b232";
		if (waStatus.includes("Error") || waStatus.includes("Failed")) return "#f23f43";
		return "#949ba4";
	};

	const isConnected =
		waStatus.includes("ready") ||
		waStatus.includes("Authenticated") ||
		waStatus.includes("Client is ready");

	const formatTime = () => new Date().toLocaleTimeString();

	const allActivity = [
		...waResults.map((r) => ({
			type: r.includes("Error") || r.includes("failed") ? "error" :
				r.includes("Success") || r.includes("sent") ? "success" : "info",
			content: r,
			timestamp: formatTime(),
			isResult: true,
		})),
		...logEntries.map((e) => ({
			type: e.type,
			content: e.message,
			timestamp: e.timestamp,
			isResult: true,
		})),
	];

	return (
		<div className="max-w-[800px] mx-auto">
			{/* Connection Section */}
			<div id="section-connection" className="scroll-mt-12">
				<SectionHeader title="Connection" />
				<div className="px-4">
					<div className="bg-[#2b2d31] rounded-[4px] border border-[#3f4149]">
						<div className="flex items-center justify-between p-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-[#25d366] rounded-full flex items-center justify-center">
									<WhatsAppIcon className="w-5 h-5 text-white" />
								</div>
								<div>
									<div className="flex items-center gap-2">
										<span className="text-sm font-semibold text-[#dbdee1]">
											WhatsApp Web
										</span>
										<div
											className="w-2 h-2 rounded-full"
											style={{ backgroundColor: getStatusColor() }}
										/>
									</div>
									<span className="text-xs text-[#949ba4]">
										{waStatus || "Not connected"}
									</span>
								</div>
							</div>
							<div className="flex items-center gap-2">
								{isConnected && (
									<DiscordButton variant="red" onClick={logoutWhatsApp} disabled={waSending}>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
											<path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
										</svg>
										Disconnect
									</DiscordButton>
								)}
								<DiscordButton
									variant="primary"
									onClick={startWhatsAppClient}
									disabled={waSending || isConnected}
								>
									<WhatsAppIcon className="w-4 h-4" />
									{waSending ? "Connecting..." : isConnected ? "Connected" : "Connect"}
								</DiscordButton>
							</div>
						</div>

						{/* QR Code / Loading / Connected */}
						{(waStatus.includes("Initializing") || waStatus.includes("WhatsApp client initializing")) && !waQR && (
							<div className="px-4 pb-4">
								<div className="bg-[#1e1f22] rounded-[4px] p-4 text-center">
									<div className="flex justify-center mb-3">
										<div className="relative">
											<div className="w-12 h-12 border-4 border-[#25d366]/20 border-t-[#25d366] rounded-full animate-spin" />
											<div className="absolute inset-0 flex items-center justify-center">
												<WhatsAppIcon className="w-5 h-5 text-[#25d366]" />
											</div>
										</div>
									</div>
									<p className="text-sm text-[#949ba4]">Initializing WhatsApp client...</p>
									<p className="text-xs text-[#6d6f78] mt-1">{waStatus}</p>
								</div>
							</div>
						)}

						{waQR && (
							<div className="px-4 pb-4">
								<div className="bg-[#1e1f22] rounded-[4px] p-4">
									<div className="text-center mb-4">
										<p className="text-sm font-medium text-[#dbdee1]">Scan QR Code</p>
										<p className="text-xs text-[#949ba4] mt-1">
											Open WhatsApp on your phone → Settings → Linked Devices → Link a Device
										</p>
									</div>
									<div className="flex justify-center">
										<div className="bg-white p-3 rounded-[4px]">
											{qrError ? (
												<div className="w-48 h-48 bg-[#2b2d31] flex flex-col items-center justify-center rounded">
													<p className="text-sm text-[#949ba4]">Failed to load QR</p>
													<DiscordButton variant="primary" onClick={() => { setQrError(false); startWhatsAppClient(); }} className="mt-3 text-xs">
														Retry
													</DiscordButton>
												</div>
											) : (
												<img
													src={waQR}
													alt="WhatsApp QR Code"
													className="w-48 h-48 rounded"
													onError={handleQrError}
													onLoad={handleQrLoad}
												/>
											)}
										</div>
									</div>
								</div>
							</div>
						)}

						{!waQR && isConnected && (
							<div className="px-4 pb-4">
								<div className="bg-[#1e1f22] rounded-[4px] p-4 text-center">
									<div className="w-12 h-12 bg-[#23a55a] rounded-full flex items-center justify-center mx-auto mb-3">
										<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white">
											<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
										</svg>
									</div>
									<p className="text-sm font-medium text-[#dbdee1]">Connected</p>
									<p className="text-xs text-[#949ba4] mt-1">{waStatus}</p>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Contacts Section */}
			<div id="section-contacts" className="scroll-mt-12">
				<SectionHeader title="Contacts" />
				<div className="px-4">
					<div className="bg-[#2b2d31] rounded-[4px] border border-[#3f4149] p-4">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-[#23a55a] rounded-full flex items-center justify-center">
									<FolderIcon className="w-5 h-5 text-white" />
								</div>
								<div>
									<p className="text-sm font-semibold text-[#dbdee1]">Contacts</p>
									<p className="text-xs text-[#949ba4]">Import or add contacts manually</p>
								</div>
							</div>
							<div className="flex gap-2">
								<DiscordButton variant="primary" onClick={() => setShowManualInput(!showManualInput)} disabled={waSending}>
									<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
										<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
									</svg>
									Add Manually
								</DiscordButton>
								<DiscordButton variant="green" onClick={importWhatsAppContacts} disabled={waSending}>
									<FolderIcon className="w-4 h-4" />
									Import File
								</DiscordButton>
							</div>
						</div>

						{showManualInput && (
							<div className="mb-4 bg-[#1e1f22] rounded-[4px] p-4">
								<p className="text-xs text-[#949ba4] mb-2">
									Enter phone numbers (one per line). You can include names:
								</p>
								<p className="text-xs text-[#6d6f78] mb-3 space-y-0.5">
									<span className="block">Format: +1234567890</span>
									<span className="block">With name: John Doe: +1234567890</span>
									<span className="block">Alternative: +1111222333 - Jane Smith</span>
								</p>
								<DiscordTextarea
									value={manualNumbers}
									onChange={(e) => setManualNumbers(e.target.value)}
									placeholder="Enter phone numbers here..."
									className="h-24"
								/>
								<div className="flex justify-between items-center mt-3">
									<span className="text-xs text-[#6d6f78]">
										{manualNumbers.split("\n").filter((l) => l.trim()).length} numbers
									</span>
									<div className="flex gap-2">
										<DiscordButton variant="secondary" onClick={() => { setManualNumbers(""); setShowManualInput(false); }}>
											Cancel
										</DiscordButton>
										<DiscordButton variant="primary" onClick={processManualNumbers} disabled={!manualNumbers.trim() || waSending}>
											Add Numbers
										</DiscordButton>
									</div>
								</div>
							</div>
						)}

						<div className="flex items-center gap-4 mb-4">
							<div className="bg-[#1e1f22] rounded-[4px] px-4 py-3 flex-1">
								<p className="text-[10px] text-[#949ba4] uppercase tracking-wider">Contacts</p>
								<p className="text-xl font-semibold text-[#dbdee1] mt-1">{waContacts.length}</p>
							</div>
							<div className="bg-[#1e1f22] rounded-[4px] px-4 py-3 flex-1">
								<p className="text-[10px] text-[#949ba4] uppercase tracking-wider">Status</p>
								<p className="text-sm font-semibold text-[#dbdee1] mt-1">
									{waContacts.length > 0 ? "Ready" : "No contacts"}
								</p>
							</div>
							{waContacts.length > 0 && (
								<DiscordButton variant="red" onClick={() => { setWaContacts([]); }} disabled={waSending} className="self-end">
									Clear
								</DiscordButton>
							)}
						</div>

						{waContacts.length > 0 && (
							<div className="bg-[#1e1f22] rounded-[4px] p-3">
								<p className="text-[10px] text-[#949ba4] uppercase tracking-wider mb-2">Preview</p>
								<div className="space-y-1.5 max-h-32 overflow-y-auto">
									{waContacts.slice(0, 5).map((contact, i) => (
										<div key={i} className="flex items-center gap-3 py-1.5 px-2 bg-[#2b2d31] rounded">
											<div className="w-7 h-7 bg-[#5865f2] rounded-full flex items-center justify-center text-white font-semibold text-[10px]">
												{(contact.name || contact.number || "?").charAt(0).toUpperCase()}
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-sm text-[#dbdee1] truncate font-medium">
													{contact.name || "Unknown"}
												</p>
												<p className="text-xs text-[#6d6f78]">{contact.number}</p>
											</div>
										</div>
									))}
									{waContacts.length > 5 && (
										<p className="text-center text-xs text-[#6d6f78] py-1">
											+{waContacts.length - 5} more
										</p>
									)}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Compose Section */}
			<div id="section-compose" className="scroll-mt-12">
				<SectionHeader title="Compose" />
				<div className="px-4">
					<div className="bg-[#2b2d31] rounded-[4px] border border-[#3f4149] p-4">
						<div className="flex items-center gap-3 mb-4">
							<div className="w-10 h-10 bg-[#f23f43] rounded-full flex items-center justify-center">
								<SendIcon className="w-5 h-5 text-white" />
							</div>
							<div>
								<p className="text-sm font-semibold text-[#dbdee1]">Message</p>
								<p className="text-xs text-[#949ba4]">Compose your bulk message</p>
							</div>
						</div>

						<div className="relative">
							<DiscordTextarea
								ref={textareaRef}
								value={waMessage}
								onChange={(e) => setWaMessage(e.target.value)}
								placeholder="Type your message here... Use {{name}} to personalize."
								disabled={waSending}
								className="h-32"
							/>
							<span className="absolute bottom-3 right-3 text-[10px] text-[#6d6f78]">
								{waMessage.length}/4096
							</span>
						</div>

						{contactFieldNames.length > 0 && (
							<div className="mt-3">
								<p className="text-[10px] text-[#949ba4] uppercase tracking-wider mb-1.5">
									Variables
								</p>
								<div className="flex flex-wrap gap-1.5">
									{contactFieldNames.map((field) => (
										<button
											key={field}
											type="button"
							onClick={() => {
											const tag = `{{${field}}}`;
											const el = textareaRef.current;
											if (el) {
												const start = el.selectionStart;
												const end = el.selectionEnd;
												const before = waMessage.slice(0, start);
												const after = waMessage.slice(end);
												setWaMessage(before + tag + after);
												requestAnimationFrame(() => {
													el.focus();
													el.setSelectionRange(start + tag.length, start + tag.length);
												});
											}
										}}
										className="px-2 py-1 bg-[#383a40] hover:bg-[#4e5058] text-[#949ba4] hover:text-[#dbdee1] text-xs rounded-[4px] transition-colors"
									>
										{`{{${field}}}`}
									</button>
								))}
								</div>
							</div>
						)}

						{templateService && (
							<WhatsAppTemplateControls
								templateService={templateService}
								setWaMessage={setWaMessage}
							/>
						)}

						<DiscordButton
							variant="red"
							onClick={sendWhatsAppBulk}
							disabled={waSending || waContacts.length === 0 || !waMessage.trim()}
							className="w-full justify-center py-3 mt-4"
						>
							{waSending ? (
								<>
									<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
									<span>Sending Messages...</span>
								</>
							) : (
								<>
									<SendIcon className="w-5 h-5" />
									<span>Send Mass Messages</span>
								</>
							)}
						</DiscordButton>
					</div>
				</div>
			</div>

			{/* Activity Section */}
			<div id="section-activity" className="scroll-mt-12">
				<SectionHeader title="Activity Log" />
				<div className="px-4 pb-8">
					<div className="bg-[#2b2d31] rounded-[4px] border border-[#3f4149] min-h-[200px]">
						{allActivity.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-16 text-[#949ba4]">
								<div className="w-10 h-10 bg-[#2b2d31] rounded-full border border-[#3f4149] flex items-center justify-center mb-3">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[#6d6f78]">
										<path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
									</svg>
								</div>
								<p className="text-xs font-medium">No activity yet</p>
								<p className="text-[10px] text-[#6d6f78] mt-0.5">Messages will appear here</p>
							</div>
						) : (
							<div className="py-2">
								{allActivity.map((entry, i) => (
									<DiscordMessage
										key={i}
										avatar="W"
										username="WhatsApp"
										color="#25d366"
										timestamp={entry.timestamp}
										content={entry.content}
										type={entry.type}
									/>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

function WhatsAppTemplateControls({ templateService: ts, setWaMessage }) {
	const [showSave, setShowSave] = useState(false);
	const [templateName, setTemplateName] = useState("");
	const [templates, setTemplates] = useState([]);
	const [showList, setShowList] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleSave = async () => {
		if (!templateName.trim()) return;
		await ts.save(templateName.trim());
		setTemplateName("");
		setShowSave(false);
	};

	const handleList = async () => {
		setLoading(true);
		const list = await ts.list();
		setTemplates(list);
		setShowList(!showList);
		setLoading(false);
	};

	const handleLoad = async (name) => {
		const list = await ts.list();
		const tpl = list.find((t) => t.name === name);
		if (tpl?.message) {
			setWaMessage(tpl.message);
		}
		setShowList(false);
	};

	const handleDelete = async (name) => {
		await ts.del(name);
		setTemplates((prev) => prev.filter((t) => t.name !== name));
	};

	return (
		<div className="mt-4 bg-[#1e1f22] rounded-[4px] p-3">
			<div className="flex items-center justify-between mb-2">
				<p className="text-[10px] text-[#949ba4] uppercase tracking-wider font-semibold">
					Templates
				</p>
				<div className="flex items-center gap-1">
					<button
						type="button"
						onClick={() => setShowSave(!showSave)}
						className="px-2 py-1 text-[10px] text-[#949ba4] hover:text-[#dbdee1] hover:bg-[#393c41] rounded-[4px] transition-colors"
					>
						Save
					</button>
					<button
						type="button"
						onClick={handleList}
						disabled={loading}
						className="px-2 py-1 text-[10px] text-[#949ba4] hover:text-[#dbdee1] hover:bg-[#393c41] rounded-[4px] transition-colors"
					>
						{loading ? "Loading..." : "Load"}
					</button>
				</div>
			</div>

			{showSave && (
				<div className="flex items-center gap-2">
					<input
						type="text"
						value={templateName}
						onChange={(e) => setTemplateName(e.target.value)}
						placeholder="Template name"
						className="flex-1 px-2 py-1.5 bg-[#383a40] text-[#dbdee1] placeholder-[#6d6f78] rounded-[4px] text-xs border-none focus:ring-1 focus:ring-[#5865f2]/30 transition-shadow"
						onKeyDown={(e) => e.key === "Enter" && handleSave()}
					/>
					<button
						type="button"
						onClick={handleSave}
						disabled={!templateName.trim()}
						className="px-3 py-1.5 bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs rounded-[4px] transition-colors disabled:opacity-50"
					>
						Save
					</button>
				</div>
			)}

			{showList && templates.length === 0 && (
				<p className="text-xs text-[#6d6f78] py-2 text-center">No saved templates</p>
			)}

			{showList && templates.length > 0 && (
				<div className="space-y-1 max-h-32 overflow-y-auto">
					{templates.map((tpl) => (
						<div key={tpl.name} className="flex items-center gap-2 py-1.5 px-2 bg-[#2b2d31] rounded-[4px] group">
							<button
								type="button"
								onClick={() => handleLoad(tpl.name)}
								className="flex-1 text-left text-xs text-[#dbdee1] truncate hover:text-[#5865f2] transition-colors"
							>
								{tpl.name}
							</button>
							<span className="text-[10px] text-[#6d6f78]">
								{new Date(tpl.updatedAt).toLocaleDateString()}
							</span>
							<button
								type="button"
								onClick={() => handleDelete(tpl.name)}
								className="opacity-0 group-hover:opacity-100 text-[#949ba4] hover:text-[#f23f43] transition-all"
							>
								<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
									<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
								</svg>
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
