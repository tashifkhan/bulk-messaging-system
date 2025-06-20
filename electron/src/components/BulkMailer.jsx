import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import WhatsAppForm from "./WhatsAppForm";
import {
	GmailIcon,
	ServerIcon,
	MailIcon,
	FolderIcon,
	SendIcon,
	CheckIcon,
	LockIcon,
	WhatsAppIcon,
} from "./Icons";

export default function BulkMailer() {
	const [activeTab, setActiveTab] = useState("whatsapp");
	const [isGmailAuthenticated, setIsGmailAuthenticated] = useState(false);
	const [emailList, setEmailList] = useState("");
	const [subject, setSubject] = useState("");
	const [message, setMessage] = useState("");
	const [delay, setDelay] = useState(1000);
	const [smtpConfig, setSMTPConfig] = useState({
		host: "",
		port: 587,
		secure: false,
		user: "",
		pass: "",
	});
	const [isSending, setIsSending] = useState(false);

	// Progress tracking
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
		<div className="flex h-screen bg-[#313338]">
			<Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
			<main className="flex-1 flex flex-col bg-gradient-to-br from-[#36393f] via-[#23272a] to-[#23272a]">
				<TopBar activeTab={activeTab} />
				<section className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col items-center">
					{activeTab === "whatsapp" && (
						<WhatsAppForm
							waContacts={waContacts}
							setWaContacts={setWaContacts}
							waMessage={waMessage}
							setWaMessage={setWaMessage}
							waStatus={waStatus}
							waQR={waQR}
							waSending={waSending}
							waResults={waResults}
							startWhatsAppClient={startWhatsAppClient}
							importWhatsAppContacts={importWhatsAppContacts}
							sendWhatsAppBulk={sendWhatsAppBulk}
						/>
					)}

					{activeTab === "gmail" && (
						<div className="w-full max-w-4xl space-y-6">
							<div className="flex items-center gap-3 mb-8">
								<div className="p-3 bg-[#ea4335] rounded-xl">
									<GmailIcon className="w-8 h-8 text-white" />
								</div>
								<div>
									<h1 className="text-2xl font-bold text-white">
										Gmail Bulk Sender
									</h1>
									<p className="text-gray-400">
										Send bulk emails using Gmail API
									</p>
								</div>
							</div>

							{/* Gmail Authentication */}
							<div className="bg-[#2b2d31] rounded-lg p-6 border border-[#3f4248]">
								<h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
									<div className="w-2 h-2 bg-[#ea4335] rounded-full"></div>
									Gmail Authentication
								</h2>

								<div className="flex items-center gap-4">
									{isGmailAuthenticated ? (
										<div className="flex items-center gap-2 text-green-400">
											<CheckIcon className="w-5 h-5" />
											<span className="font-medium">Gmail Authenticated</span>
										</div>
									) : (
										<div className="flex items-center gap-2 text-yellow-400">
											<LockIcon className="w-5 h-5" />
											<span className="font-medium">Not Authenticated</span>
										</div>
									)}
								</div>
							</div>

							{/* Email Configuration */}
							<div className="bg-[#2b2d31] rounded-lg p-6 border border-[#3f4248]">
								<h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
									<div className="w-2 h-2 bg-[#23a55a] rounded-full"></div>
									Email Configuration
								</h2>

								<div className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<button
											onClick={importEmailList}
											className="flex items-center gap-2 px-4 py-2 bg-[#5865f2] hover:bg-[#4752c4] text-white font-medium rounded-md transition-colors"
										>
											<FolderIcon className="w-4 h-4" />
											Import Email List
										</button>
										<div className="bg-[#313338] rounded-md p-3 border border-[#3f4248]">
											<span className="text-gray-400 text-sm">Recipients:</span>
											<p className="text-white font-medium">
												{
													emailList.split("\n").filter((email) => email.trim())
														.length
												}
											</p>
										</div>
									</div>

									<div>
										<label className="block text-gray-300 text-sm font-medium mb-2">
											Email Recipients (one per line)
										</label>
										<textarea
											value={emailList}
											onChange={(e) => setEmailList(e.target.value)}
											placeholder="email1@example.com&#10;email2@example.com&#10;email3@example.com"
											className="w-full h-32 px-3 py-2 bg-[#313338] border border-[#3f4248] rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-[#5865f2] focus:ring-1 focus:ring-[#5865f2] resize-none"
										/>
									</div>

									<div>
										<label className="block text-gray-300 text-sm font-medium mb-2">
											Subject
										</label>
										<input
											type="text"
											value={subject}
											onChange={(e) => setSubject(e.target.value)}
											placeholder="Enter email subject"
											className="w-full px-3 py-2 bg-[#313338] border border-[#3f4248] rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-[#5865f2] focus:ring-1 focus:ring-[#5865f2]"
										/>
									</div>

									<div>
										<label className="block text-gray-300 text-sm font-medium mb-2">
											Message
										</label>
										<textarea
											value={message}
											onChange={(e) => setMessage(e.target.value)}
											placeholder="Enter your email message..."
											className="w-full h-32 px-3 py-2 bg-[#313338] border border-[#3f4248] rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-[#5865f2] focus:ring-1 focus:ring-[#5865f2] resize-none"
										/>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-gray-300 text-sm font-medium mb-2">
												Delay (ms)
											</label>
											<input
												type="number"
												value={delay}
												onChange={(e) => setDelay(e.target.value)}
												min="1000"
												className="w-full px-3 py-2 bg-[#313338] border border-[#3f4248] rounded-md text-white focus:outline-none focus:border-[#5865f2] focus:ring-1 focus:ring-[#5865f2]"
											/>
										</div>
										<button
											onClick={sendGmailBulk}
											disabled={isSending || !isGmailAuthenticated}
											className="flex items-center justify-center gap-2 px-6 py-2 bg-[#ea4335] hover:bg-[#d23125] disabled:bg-[#3f4248] disabled:text-gray-500 text-white font-medium rounded-md transition-colors"
										>
											{isSending ? (
												<>
													<div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
													Sending...
												</>
											) : (
												<>
													<SendIcon className="w-4 h-4" />
													Send Bulk Email
												</>
											)}
										</button>
									</div>
								</div>
							</div>
						</div>
					)}

					{activeTab === "smtp" && (
						<div className="w-full max-w-4xl space-y-6">
							<div className="flex items-center gap-3 mb-8">
								<div className="p-3 bg-[#5865f2] rounded-xl">
									<ServerIcon className="w-8 h-8 text-white" />
								</div>
								<div>
									<h1 className="text-2xl font-bold text-white">
										SMTP Bulk Sender
									</h1>
									<p className="text-gray-400">
										Send bulk emails using SMTP configuration
									</p>
								</div>
							</div>

							{/* SMTP Configuration */}
							<div className="bg-[#2b2d31] rounded-lg p-6 border border-[#3f4248]">
								<h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
									<div className="w-2 h-2 bg-[#5865f2] rounded-full"></div>
									SMTP Configuration
								</h2>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-gray-300 text-sm font-medium mb-2">
											Host
										</label>
										<input
											type="text"
											value={smtpConfig.host}
											onChange={(e) =>
												setSMTPConfig({ ...smtpConfig, host: e.target.value })
											}
											placeholder="smtp.gmail.com"
											className="w-full px-3 py-2 bg-[#313338] border border-[#3f4248] rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-[#5865f2] focus:ring-1 focus:ring-[#5865f2]"
										/>
									</div>
									<div>
										<label className="block text-gray-300 text-sm font-medium mb-2">
											Port
										</label>
										<input
											type="number"
											value={smtpConfig.port}
											onChange={(e) =>
												setSMTPConfig({
													...smtpConfig,
													port: parseInt(e.target.value),
												})
											}
											className="w-full px-3 py-2 bg-[#313338] border border-[#3f4248] rounded-md text-white focus:outline-none focus:border-[#5865f2] focus:ring-1 focus:ring-[#5865f2]"
										/>
									</div>
									<div>
										<label className="block text-gray-300 text-sm font-medium mb-2">
											Username
										</label>
										<input
											type="text"
											value={smtpConfig.user}
											onChange={(e) =>
												setSMTPConfig({ ...smtpConfig, user: e.target.value })
											}
											placeholder="your@email.com"
											className="w-full px-3 py-2 bg-[#313338] border border-[#3f4248] rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-[#5865f2] focus:ring-1 focus:ring-[#5865f2]"
										/>
									</div>
									<div>
										<label className="block text-gray-300 text-sm font-medium mb-2">
											Password
										</label>
										<input
											type="password"
											value={smtpConfig.pass}
											onChange={(e) =>
												setSMTPConfig({ ...smtpConfig, pass: e.target.value })
											}
											placeholder="your-password"
											className="w-full px-3 py-2 bg-[#313338] border border-[#3f4248] rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-[#5865f2] focus:ring-1 focus:ring-[#5865f2]"
										/>
									</div>
								</div>

								<div className="mt-4">
									<label className="flex items-center gap-2">
										<input
											type="checkbox"
											checked={smtpConfig.secure}
											onChange={(e) =>
												setSMTPConfig({
													...smtpConfig,
													secure: e.target.checked,
												})
											}
											className="w-4 h-4 text-[#5865f2] bg-[#313338] border-[#3f4248] rounded focus:ring-[#5865f2] focus:ring-2"
										/>
										<span className="text-gray-300 text-sm">
											Use secure connection (SSL/TLS)
										</span>
									</label>
								</div>
							</div>

							{/* Email Configuration - Same as Gmail but with SMTP send button */}
							<div className="bg-[#2b2d31] rounded-lg p-6 border border-[#3f4248]">
								<h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
									<div className="w-2 h-2 bg-[#23a55a] rounded-full"></div>
									Email Configuration
								</h2>

								<div className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<button
											onClick={importEmailList}
											className="flex items-center gap-2 px-4 py-2 bg-[#5865f2] hover:bg-[#4752c4] text-white font-medium rounded-md transition-colors"
										>
											<FolderIcon className="w-4 h-4" />
											Import Email List
										</button>
										<div className="bg-[#313338] rounded-md p-3 border border-[#3f4248]">
											<span className="text-gray-400 text-sm">Recipients:</span>
											<p className="text-white font-medium">
												{
													emailList.split("\n").filter((email) => email.trim())
														.length
												}
											</p>
										</div>
									</div>

									<div>
										<label className="block text-gray-300 text-sm font-medium mb-2">
											Email Recipients (one per line)
										</label>
										<textarea
											value={emailList}
											onChange={(e) => setEmailList(e.target.value)}
											placeholder="email1@example.com&#10;email2@example.com&#10;email3@example.com"
											className="w-full h-32 px-3 py-2 bg-[#313338] border border-[#3f4248] rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-[#5865f2] focus:ring-1 focus:ring-[#5865f2] resize-none"
										/>
									</div>

									<div>
										<label className="block text-gray-300 text-sm font-medium mb-2">
											Subject
										</label>
										<input
											type="text"
											value={subject}
											onChange={(e) => setSubject(e.target.value)}
											placeholder="Enter email subject"
											className="w-full px-3 py-2 bg-[#313338] border border-[#3f4248] rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-[#5865f2] focus:ring-1 focus:ring-[#5865f2]"
										/>
									</div>

									<div>
										<label className="block text-gray-300 text-sm font-medium mb-2">
											Message
										</label>
										<textarea
											value={message}
											onChange={(e) => setMessage(e.target.value)}
											placeholder="Enter your email message..."
											className="w-full h-32 px-3 py-2 bg-[#313338] border border-[#3f4248] rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-[#5865f2] focus:ring-1 focus:ring-[#5865f2] resize-none"
										/>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-gray-300 text-sm font-medium mb-2">
												Delay (ms)
											</label>
											<input
												type="number"
												value={delay}
												onChange={(e) => setDelay(e.target.value)}
												min="1000"
												className="w-full px-3 py-2 bg-[#313338] border border-[#3f4248] rounded-md text-white focus:outline-none focus:border-[#5865f2] focus:ring-1 focus:ring-[#5865f2]"
											/>
										</div>
										<button
											onClick={sendSMTPBulk}
											disabled={isSending}
											className="flex items-center justify-center gap-2 px-6 py-2 bg-[#5865f2] hover:bg-[#4752c4] disabled:bg-[#3f4248] disabled:text-gray-500 text-white font-medium rounded-md transition-colors"
										>
											{isSending ? (
												<>
													<div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
													Sending...
												</>
											) : (
												<>
													<SendIcon className="w-4 h-4" />
													Send SMTP Email
												</>
											)}
										</button>
									</div>
								</div>
							</div>
						</div>
					)}
				</section>
			</main>
		</div>
	);
}
