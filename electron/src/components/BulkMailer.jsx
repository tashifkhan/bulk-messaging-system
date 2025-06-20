import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import WhatsAppForm from "./WhatsAppForm";
import GmailForm from "./GmailForm";
import SMTPForm from "./SMTPForm";
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
	const [activeTab, setActiveTab] = useState("gmail");
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
					<div className="w-full max-w-4xl space-y-8">
						{activeTab === "whatsapp" && <WhatsAppForm />}
						{activeTab === "gmail" && (
							<GmailForm
								isGmailAuthenticated={isGmailAuthenticated}
								authenticateGmail={checkGmailAuth}
								subject={subject}
								setSubject={setSubject}
								emailList={emailList}
								setEmailList={setEmailList}
								message={message}
								setMessage={setMessage}
								delay={delay}
								setDelay={setDelay}
								importEmailList={importEmailList}
								sendGmailBulk={sendGmailBulk}
								isSending={isSending}
							/>
						)}
						{activeTab === "smtp" && (
							<SMTPForm
								smtpConfig={smtpConfig}
								setSMTPConfig={setSMTPConfig}
								message={message}
								setMessage={setMessage}
								subject={subject}
								setSubject={setSubject}
								emailList={emailList}
								setEmailList={setEmailList}
								delay={delay}
								setDelay={setDelay}
								importEmailList={importEmailList}
								sendSMTPBulk={sendSMTPBulk}
								isSending={isSending}
							/>
						)}
					</div>
				</section>
			</main>
		</div>
	);
}
