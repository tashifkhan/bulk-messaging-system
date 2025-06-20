import { useState, useEffect } from "react";

// SVG Icons Components
const GmailIcon = () => (
	<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
		<path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
	</svg>
);

const ServerIcon = () => (
	<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
		<path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6zM4 14a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2z" />
		<circle cx="7" cy="7" r="1" />
		<circle cx="7" cy="15" r="1" />
	</svg>
);

const MailIcon = () => (
	<svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
		<path d="M2.25 6.75c0 .41.2.775.51.999L12 13.52l9.24-5.771c.31-.224.51-.589.51-.999V5.25A2.25 2.25 0 0 0 19.5 3H4.5A2.25 2.25 0 0 0 2.25 5.25v1.5z" />
		<path d="M12 14.985L2.756 9.214A2.25 2.25 0 0 0 2.25 11.25v7.5A2.25 2.25 0 0 0 4.5 21h15a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-.506-2.036L12 14.985z" />
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

const CheckIcon = () => (
	<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
		<path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
	</svg>
);

const LockIcon = () => (
	<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
		<path d="M18 10.5c0 .401-.127.773-.342 1.078l-6.75 9.75a1.5 1.5 0 01-2.416 0l-6.75-9.75A1.878 1.878 0 012.25 10.5C2.25 5.806 6.056 2 10.75 2S19.25 5.806 19.25 10.5z" />
	</svg>
);

const WhatsAppIcon = () => (
	<svg className="w-5 h-5" viewBox="0 0 32 32" fill="currentColor">
		<path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.832 4.584 2.236 6.393L4 29l7.828-2.236C13.416 27.168 15.615 28 18 28c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-2.021 0-3.938-.586-5.555-1.6l-.396-.25-4.646 1.328 1.328-4.646-.25-.396C6.586 18.938 6 17.021 6 15c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.29-7.71c-.26-.13-1.54-.76-1.78-.85-.24-.09-.41-.13-.58.13-.17.26-.67.85-.82 1.02-.15.17-.3.19-.56.06-.26-.13-1.09-.4-2.07-1.28-.76-.68-1.27-1.52-1.42-1.78-.15-.26-.02-.4.11-.53.11-.11.26-.3.39-.45.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.06-.13-.58-1.39-.8-1.91-.21-.51-.43-.44-.58-.45-.15-.01-.32-.01-.5-.01-.17 0-.45.06-.68.32-.23.26-.9.88-.9 2.15s.92 2.49 1.05 2.66c.13.17 1.81 2.77 4.39 3.78.61.21 1.09.33 1.46.42.61.13 1.16.11 1.6.07.49-.05 1.54-.63 1.76-1.24.22-.61.22-1.13.15-1.24-.07-.11-.24-.17-.5-.3z" />
	</svg>
);

export default function BulkMailer() {
	const [activeTab, setActiveTab] = useState("gmail");
	const [isGmailAuthenticated, setIsGmailAuthenticated] = useState(false);

	// Common form fields
	const [emailList, setEmailList] = useState("");
	const [subject, setSubject] = useState("");
	const [message, setMessage] = useState("");
	const [delay, setDelay] = useState(1000);

	// SMTP configuration
	const [smtpConfig, setSMTPConfig] = useState({
		host: "",
		port: 587,
		secure: false,
		user: "",
		pass: "",
	});

	// Progress tracking
	const [isSending, setIsSending] = useState(false);
	const [progress, setProgress] = useState({
		current: 0,
		total: 0,
		status: "",
	});
	const [results, setResults] = useState([]);

	// WhatsApp configuration
	const [waContacts, setWaContacts] = useState([]);
	const [waMessage, setWaMessage] = useState("");
	const [waStatus, setWaStatus] = useState("");
	const [waQR, setWaQR] = useState(null);
	const [waSending, setWaSending] = useState(false);
	const [waResults, setWaResults] = useState([]);

	useEffect(() => {
		// Check Gmail authentication status
		checkGmailAuth();

		// Setup progress listener
		const removeListener = window.electronAPI?.onProgress?.(handleProgress);

		// WhatsApp status listener
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
			if (removeListener) removeListener();
			if (removeWaStatus) removeWaStatus();
			if (removeWaQR) removeWaQR();
			if (removeWaSendStatus) removeWaSendStatus();
		};
	}, []);

	const checkGmailAuth = async () => {
		try {
			const result = await window.electronAPI.getGmailToken();
			setIsGmailAuthenticated(result.hasToken);
		} catch (error) {
			console.error("Error checking Gmail auth:", error);
		}
	};

	const authenticateGmail = async () => {
		try {
			const result = await window.electronAPI.authenticateGmail();
			if (result.success) {
				setIsGmailAuthenticated(true);
			} else {
				alert(`Gmail authentication failed: ${result.message || result.error}`);
				if (result.instructions) {
					console.log("Setup instructions:", result.instructions);
				}
			}
		} catch (error) {
			alert(`Gmail authentication error: ${error.message}`);
		}
	};

	const handleProgress = (event, progressData) => {
		setProgress(progressData);
	};

	const importEmailList = async () => {
		try {
			const result = await window.electronAPI.importEmailList();
			if (!result.canceled && result.filePaths.length > 0) {
				// Read file content (this would need to be implemented in the main process)
				// For now, show a placeholder
				alert(
					"File import selected. File reading functionality needs to be implemented."
				);
			}
		} catch (error) {
			alert(`Error importing email list: ${error.message}`);
		}
	};

	const validateForm = () => {
		const recipients = emailList.split("\n").filter((email) => email.trim());

		if (recipients.length === 0) {
			alert("Please enter at least one email address");
			return false;
		}

		if (!subject.trim()) {
			alert("Please enter a subject");
			return false;
		}

		if (!message.trim()) {
			alert("Please enter a message");
			return false;
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		const invalidEmails = recipients.filter(
			(email) => !emailRegex.test(email.trim())
		);

		if (invalidEmails.length > 0) {
			alert(`Invalid email addresses found: ${invalidEmails.join(", ")}`);
			return false;
		}

		return true;
	};

	const sendGmailBulk = async () => {
		if (!validateForm()) return;
		if (!isGmailAuthenticated) {
			alert("Please authenticate with Gmail first");
			return;
		}

		setIsSending(true);
		setResults([]);

		try {
			const recipients = emailList
				.split("\n")
				.filter((email) => email.trim())
				.map((email) => email.trim());

			const result = await window.electronAPI.sendEmail({
				recipients,
				subject,
				message,
				delay: parseInt(delay),
			});

			if (result.success) {
				setResults(result.results);
				alert(
					`Bulk email completed. ${
						result.results.filter((r) => r.status === "sent").length
					} sent successfully.`
				);
			} else {
				alert(`Error sending emails: ${result.error}`);
			}
		} catch (error) {
			alert(`Error: ${error.message}`);
		} finally {
			setIsSending(false);
		}
	};

	const sendSMTPBulk = async () => {
		if (!validateForm()) return;

		if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.pass) {
			alert("Please fill in all SMTP configuration fields");
			return;
		}

		setIsSending(true);
		setResults([]);

		try {
			const recipients = emailList
				.split("\n")
				.filter((email) => email.trim())
				.map((email) => email.trim());

			const result = await window.electronAPI.sendSMTPEmail({
				smtpConfig,
				recipients,
				subject,
				message,
				delay: parseInt(delay),
			});

			if (result.success) {
				setResults(result.results);
				alert(
					`Bulk email completed. ${
						result.results.filter((r) => r.status === "sent").length
					} sent successfully.`
				);
			} else {
				alert(`Error sending emails: ${result.error}`);
			}
		} catch (error) {
			alert(`Error: ${error.message}`);
		} finally {
			setIsSending(false);
		}
	};

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
		<div className="flex h-screen bg-gray-800">
			{/* Sidebar */}
			<div className="w-72 bg-gray-900 flex flex-col">
				{/* Header */}
				<div className="p-4 border-b border-gray-800">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
							<MailIcon />
						</div>
						<div>
							<h1 className="text-white font-semibold text-lg">Bulk Mailer</h1>
							<p className="text-gray-400 text-sm">Email Marketing Tool</p>
						</div>
					</div>
				</div>

				{/* Navigation */}
				<div className="flex-1 p-4 space-y-2">
					<div className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">
						Email & Messaging Services
					</div>
					<button
						className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
							activeTab === "gmail"
								? "bg-indigo-600 text-white"
								: "text-gray-300 hover:bg-gray-800 hover:text-white"
						}`}
						onClick={() => setActiveTab("gmail")}
					>
						<GmailIcon />
						<span className="font-medium">Gmail API</span>
						{isGmailAuthenticated && (
							<div className="ml-auto w-2 h-2 bg-green-500 rounded-full"></div>
						)}
					</button>
					<button
						className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
							activeTab === "smtp"
								? "bg-indigo-600 text-white"
								: "text-gray-300 hover:bg-gray-800 hover:text-white"
						}`}
						onClick={() => setActiveTab("smtp")}
					>
						<ServerIcon />
						<span className="font-medium">SMTP Server</span>
					</button>
					<button
						className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
							activeTab === "whatsapp"
								? "bg-green-600 text-white"
								: "text-gray-300 hover:bg-gray-800 hover:text-white"
						}`}
						onClick={() => setActiveTab("whatsapp")}
					>
						<WhatsAppIcon />
						<span className="font-medium">WhatsApp Bulk</span>
					</button>

					{/* Stats */}
					<div className="mt-8 pt-4 border-t border-gray-800">
						<div className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">
							Statistics
						</div>
						<div className="bg-gray-800 rounded-lg p-3 space-y-2">
							<div className="flex justify-between text-sm">
								<span className="text-gray-400">Recipients</span>
								<span className="text-white font-medium">
									{emailList.split("\n").filter((email) => email.trim()).length}
								</span>
							</div>
							{results.length > 0 && (
								<>
									<div className="flex justify-between text-sm">
										<span className="text-gray-400">Sent</span>
										<span className="text-green-400 font-medium">
											{results.filter((r) => r.status === "sent").length}
										</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-gray-400">Failed</span>
										<span className="text-red-400 font-medium">
											{results.filter((r) => r.status === "failed").length}
										</span>
									</div>
								</>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 flex flex-col bg-gray-700">
				{/* Top Bar */}
				<div className="h-16 bg-gray-800 border-b border-gray-600 flex items-center px-6">
					<div className="flex items-center gap-2 text-gray-300">
						<span className="text-gray-500">#</span>
						<span className="font-medium">
							{activeTab === "gmail"
								? "Gmail Configuration"
								: activeTab === "smtp"
								? "SMTP Configuration"
								: "WhatsApp Bulk Messaging"}
						</span>
					</div>
				</div>

				{/* Content Area */}
				<div className="flex-1 overflow-y-auto">
					<div className="max-w-4xl mx-auto p-6">
						{/* WhatsApp Tab */}
						{activeTab === "whatsapp" && (
							<div className="space-y-6">
								<div className="bg-gray-800 border border-gray-600 rounded-lg p-6 space-y-6">
									<h3 className="text-xl font-semibold text-green-400 flex items-center gap-2">
										<WhatsAppIcon /> WhatsApp Bulk Messaging
									</h3>
									<div className="flex flex-col md:flex-row gap-6">
										<div className="flex-1 space-y-4">
											<button
												onClick={startWhatsAppClient}
												className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md transition-colors flex items-center gap-2"
												disabled={waSending}
											>
												<WhatsAppIcon /> Start WhatsApp Client
											</button>
											{waQR && (
												<div className="mt-4">
													<p className="text-gray-300 mb-2">
														Scan this QR code with WhatsApp:
													</p>
													<img
														src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
															waQR
														)}&size=200x200`}
														alt="WhatsApp QR"
														className="mx-auto border-4 border-green-500 rounded-lg"
													/>
												</div>
											)}
											<div className="mt-4">
												<button
													onClick={importWhatsAppContacts}
													className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors"
													type="button"
													disabled={waSending}
												>
													<FolderIcon /> Import Contacts File
												</button>
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
													rows={8}
													className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm resize-none mt-2"
													disabled={waSending}
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-300 mb-2">
													Message
												</label>
												<textarea
													placeholder="Enter your WhatsApp message. Use {{name}} for personalization."
													value={waMessage}
													onChange={(e) => setWaMessage(e.target.value)}
													rows={6}
													className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
													disabled={waSending}
												/>
											</div>
											<div className="flex justify-end">
												<button
													onClick={sendWhatsAppBulk}
													disabled={waSending}
													className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-medium py-2 px-6 rounded-md transition-colors disabled:opacity-50"
												>
													<SendIcon />{" "}
													{waSending ? "Sending..." : "Send WhatsApp Messages"}
												</button>
											</div>
										</div>
										<div className="w-full md:w-80 space-y-4">
											<div className="bg-gray-900 rounded-lg p-4">
												<h4 className="text-green-400 font-semibold mb-2">
													Status
												</h4>
												<p className="text-gray-300 break-words whitespace-pre-line min-h-[48px]">
													{waStatus}
												</p>
											</div>
											{waResults.length > 0 && (
												<div className="bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto">
													<h4 className="text-green-400 font-semibold mb-2">
														Results
													</h4>
													{waResults.slice(-10).map((msg, idx) => (
														<div
															key={idx}
															className={`text-sm ${
																msg.includes("Sent to")
																	? "text-green-400"
																	: msg.includes("Failed")
																	? "text-red-400"
																	: "text-gray-300"
															}`}
														>
															{msg}
														</div>
													))}
													{waResults.length > 10 && (
														<p className="text-center text-gray-400 text-xs py-2">
															... and {waResults.length - 10} more
														</p>
													)}
												</div>
											)}
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Gmail/SMTP Tabs */}
						{activeTab === "gmail" && (
							<div className="space-y-6">
								{/* Gmail Auth Section */}
								<div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
									{!isGmailAuthenticated ? (
										<div className="text-center space-y-4">
											<div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
												<LockIcon />
											</div>
											<div>
												<h3 className="text-xl font-semibold text-white mb-2">
													Gmail Authentication Required
												</h3>
												<p className="text-gray-400">
													Connect your Gmail account to start sending emails
												</p>
											</div>
											<button
												onClick={authenticateGmail}
												className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-md transition-colors flex items-center gap-2 mx-auto"
											>
												<GmailIcon />
												Connect Gmail
											</button>
										</div>
									) : (
										<div className="text-center space-y-4">
											<div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
												<CheckIcon />
											</div>
											<div>
												<h3 className="text-xl font-semibold text-white mb-2">
													Gmail Connected
												</h3>
												<p className="text-gray-400">
													Ready to send emails via Gmail API
												</p>
											</div>
										</div>
									)}
								</div>
							</div>
						)}

						{activeTab === "smtp" && (
							<div className="space-y-6">
								<div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
									<h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
										<ServerIcon />
										SMTP Server Configuration
									</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-300 mb-2">
												SMTP Host
											</label>
											<input
												type="text"
												placeholder="smtp.gmail.com"
												value={smtpConfig.host}
												onChange={(e) =>
													setSMTPConfig({ ...smtpConfig, host: e.target.value })
												}
												className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-300 mb-2">
												Port
											</label>
											<input
												type="number"
												placeholder="587"
												value={smtpConfig.port}
												onChange={(e) =>
													setSMTPConfig({
														...smtpConfig,
														port: parseInt(e.target.value),
													})
												}
												className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-300 mb-2">
												Email Address
											</label>
											<input
												type="email"
												placeholder="your.email@gmail.com"
												value={smtpConfig.user}
												onChange={(e) =>
													setSMTPConfig({ ...smtpConfig, user: e.target.value })
												}
												className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-300 mb-2">
												Password
											</label>
											<input
												type="password"
												placeholder="App Password"
												value={smtpConfig.pass}
												onChange={(e) =>
													setSMTPConfig({ ...smtpConfig, pass: e.target.value })
												}
												className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
											/>
										</div>
									</div>
									<div className="mt-4">
										<label className="flex items-center gap-2 text-gray-300 cursor-pointer">
											<input
												type="checkbox"
												checked={smtpConfig.secure}
												onChange={(e) =>
													setSMTPConfig({
														...smtpConfig,
														secure: e.target.checked,
													})
												}
												className="w-4 h-4 text-indigo-600 bg-gray-900 border-gray-600 rounded focus:ring-indigo-500"
											/>
											<span className="text-sm">Use SSL/TLS (port 465)</span>
										</label>
									</div>
								</div>
							</div>
						)}

						{/* Email Composer */}
						{(activeTab === "gmail" ? isGmailAuthenticated : true) && (
							<div className="bg-gray-800 border border-gray-600 rounded-lg p-6 space-y-6">
								<h3 className="text-xl font-semibold text-white flex items-center gap-2">
									<MailIcon />
									Compose Email
								</h3>

								{/* Subject */}
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">
										Subject
									</label>
									<input
										type="text"
										placeholder="Enter email subject"
										value={subject}
										onChange={(e) => setSubject(e.target.value)}
										className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
									/>
								</div>

								{/* Recipients */}
								<div>
									<div className="flex items-center justify-between mb-2">
										<label className="block text-sm font-medium text-gray-300">
											Recipients
										</label>
										<button
											onClick={importEmailList}
											className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors"
											type="button"
										>
											<FolderIcon />
											Import File
										</button>
									</div>
									<textarea
										placeholder="Enter email addresses (one per line)&#10;example1@email.com&#10;example2@email.com"
										value={emailList}
										onChange={(e) => setEmailList(e.target.value)}
										rows={8}
										className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm resize-none"
									/>
								</div>

								{/* Message */}
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">
										Message
									</label>
									<textarea
										placeholder="Enter your email message (HTML supported)"
										value={message}
										onChange={(e) => setMessage(e.target.value)}
										rows={10}
										className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
									/>
								</div>

								{/* Delay */}
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">
										Delay between emails (milliseconds)
									</label>
									<input
										type="number"
										value={delay}
										onChange={(e) => setDelay(e.target.value)}
										min="100"
										max="10000"
										className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
									/>
									<p className="text-xs text-gray-400 mt-1">
										Recommended: 1000ms (1 second) to avoid rate limits
									</p>
								</div>

								{/* Send Button */}
								<div className="flex justify-end">
									<button
										onClick={
											activeTab === "gmail" ? sendGmailBulk : sendSMTPBulk
										}
										disabled={isSending}
										className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white font-medium py-2 px-6 rounded-md transition-colors disabled:opacity-50"
									>
										<SendIcon />
										{isSending ? "Sending..." : "Send Emails"}
									</button>
								</div>
							</div>
						)}

						{/* Progress Section */}
						{isSending && (
							<div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
								<h3 className="text-lg font-semibold text-white mb-4">
									Sending Progress
								</h3>
								<div className="w-full bg-gray-700 rounded-full h-2 mb-4">
									<div
										className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
										style={{
											width: `${(progress.current / progress.total) * 100}%`,
										}}
									/>
								</div>
								<div className="flex justify-between text-sm text-gray-300 mb-2">
									<span>
										{progress.current} of {progress.total} emails sent
									</span>
									{progress.recipient && (
										<span className="text-indigo-400">
											Current: {progress.recipient}
										</span>
									)}
								</div>
								<p
									className={`text-sm font-medium ${
										progress.status === "sent"
											? "text-green-400"
											: progress.status === "failed"
											? "text-red-400"
											: "text-indigo-400"
									}`}
								>
									Status: {progress.status}
									{progress.error && (
										<span className="text-red-400"> - {progress.error}</span>
									)}
								</p>
							</div>
						)}

						{/* Results Section */}
						{results.length > 0 && (
							<div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
								<h3 className="text-lg font-semibold text-white mb-4">
									Results
								</h3>
								<div className="flex gap-4 mb-4">
									<div className="flex items-center gap-2 text-sm">
										<div className="w-3 h-3 bg-green-500 rounded-full"></div>
										<span className="text-gray-300">
											Sent: {results.filter((r) => r.status === "sent").length}
										</span>
									</div>
									<div className="flex items-center gap-2 text-sm">
										<div className="w-3 h-3 bg-red-500 rounded-full"></div>
										<span className="text-gray-300">
											Failed:{" "}
											{results.filter((r) => r.status === "failed").length}
										</span>
									</div>
								</div>

								<div className="max-h-64 overflow-y-auto space-y-2">
									{results.slice(0, 10).map((result, index) => (
										<div
											key={index}
											className={`flex items-center justify-between p-3 rounded-md ${
												result.status === "sent"
													? "bg-green-500/10 border-l-4 border-green-500"
													: "bg-red-500/10 border-l-4 border-red-500"
											}`}
										>
											<span className="text-gray-300 font-medium">
												{result.recipient}
											</span>
											<div className="flex items-center gap-2">
												<span
													className={`text-xs font-semibold uppercase ${
														result.status === "sent"
															? "text-green-400"
															: "text-red-400"
													}`}
												>
													{result.status}
												</span>
												{result.error && (
													<span className="text-red-300 text-xs">
														({result.error})
													</span>
												)}
											</div>
										</div>
									))}
									{results.length > 10 && (
										<p className="text-center text-gray-400 text-sm py-2">
											... and {results.length - 10} more results
										</p>
									)}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
