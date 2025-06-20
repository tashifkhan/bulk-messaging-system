import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import WhatsAppForm from "./WhatsAppForm";
import GmailForm from "./GmailForm";
import SMTPForm from "./SMTPForm";
import ContactProcessor from "../utils/contactProcessor.browser.js";

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
			// Check if electronAPI is available
			if (!window.electronAPI?.getGmailToken) {
				console.warn("Gmail token function not available");
				return;
			}

			const result = await window.electronAPI.getGmailToken();
			setIsGmailAuthenticated(result.hasToken);
		} catch (error) {
			console.error("Error checking Gmail auth:", error);
		}
	};

	const authenticateGmail = async () => {
		try {
			// Check if electronAPI is available
			if (!window.electronAPI) {
				alert(
					"Electron API not available. Please make sure you're running in Electron environment."
				);
				return;
			}

			if (!window.electronAPI.authenticateGmail) {
				alert(
					"Gmail authentication function not available. Please check Electron configuration."
				);
				return;
			}

			const result = await window.electronAPI.authenticateGmail();
			if (result.success) {
				setIsGmailAuthenticated(true);
				alert("Gmail authentication successful!");
			} else {
				alert(`Gmail authentication failed: ${result.error}`);
			}
		} catch (error) {
			console.error("Error authenticating Gmail:", error);
			alert(`Error authenticating Gmail: ${error.message}`);
		}
	};

	const handleProgress = (event, progressData) => {
		setProgress(progressData);
	};

	const importEmailList = async () => {
		try {
			// Check if electronAPI is available
			if (!window.electronAPI) {
				alert(
					"Electron API not available. Please make sure you're running in Electron environment."
				);
				return;
			}

			if (!window.electronAPI.importEmailList) {
				alert(
					"Import email list function not available. Please check Electron configuration."
				);
				return;
			}

			const result = await window.electronAPI.importEmailList();
			if (!result.canceled && result.filePaths.length > 0) {
				// Read file content
				const filePath = result.filePaths[0];
				const fileContent = await window.electronAPI.readEmailListFile(
					filePath
				);

				if (fileContent) {
					setEmailList(fileContent);
					alert(
						`Successfully imported ${
							fileContent.split("\n").filter((line) => line.trim()).length
						} email addresses.`
					);
				}
			}
		} catch (error) {
			console.error("Import error:", error);
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
		try {
			// Check if electronAPI is available
			if (!window.electronAPI) {
				alert(
					"Electron API not available. Please make sure you're running in Electron environment."
				);
				return;
			}

			if (!window.electronAPI.startWhatsAppClient) {
				alert(
					"Start WhatsApp client function not available. Please check Electron configuration."
				);
				return;
			}

			setWaStatus("Initializing WhatsApp client...");
			setWaQR(null);
			await window.electronAPI.startWhatsAppClient();
		} catch (error) {
			console.error("Error starting WhatsApp client:", error);
			setWaStatus(`Error: ${error.message}`);
			alert(`Error starting WhatsApp client: ${error.message}`);
		}
	};

	const logoutWhatsApp = async () => {
		try {
			// Check if electronAPI is available
			if (!window.electronAPI) {
				alert(
					"Electron API not available. Please make sure you're running in Electron environment."
				);
				return;
			}

			if (!window.electronAPI.logoutWhatsApp) {
				alert(
					"Logout WhatsApp function not available. Please check Electron configuration."
				);
				return;
			}

			const result = await window.electronAPI.logoutWhatsApp();
			if (result.success) {
				setWaContacts([]);
				setWaResults([]);
				setWaQR(null);
				setWaStatus("Disconnected");
				alert("Successfully logged out from WhatsApp");
			} else {
				alert(`Logout failed: ${result.message}`);
			}
		} catch (error) {
			console.error("Error logging out from WhatsApp:", error);
			alert(`Error logging out from WhatsApp: ${error.message}`);
		}
	};

	const importWhatsAppContacts = async () => {
		try {
			const input = document.createElement("input");
			input.type = "file";
			input.accept = ".txt,.csv,.xlsx,.xls";
			return new Promise((resolve) => {
				input.onchange = async (event) => {
					const file = event.target.files[0];
					if (!file) {
						resolve();
						return;
					}
					try {
						const processor = new ContactProcessor();
						const ext = file.name.split(".").pop().toLowerCase();
						let contacts = [];
						if (ext === "csv") {
							const text = await file.text();
							contacts = await processor.extractContactsFromCsvText(text);
						} else if (ext === "txt") {
							const text = await file.text();
							contacts = processor.extractContactsFromTxtText(text);
						} else if (["xlsx", "xls"].includes(ext)) {
							const arrayBuffer = await file.arrayBuffer();
							contacts =
								processor.extractContactsFromExcelArrayBuffer(arrayBuffer);
						}
						if (contacts.length) {
							setWaContacts(contacts);
							alert(
								`Successfully imported ${contacts.length} contacts from ${file.name}.`
							);
						} else {
							alert("No valid contacts found in file.");
						}
					} catch (error) {
						console.error("Error importing WhatsApp contacts:", error);
						alert(`Error importing WhatsApp contacts: ${error.message}`);
					}
					resolve();
				};
				input.click();
			});
		} catch (error) {
			console.error("Error importing WhatsApp contacts:", error);
			alert(`Error importing WhatsApp contacts: ${error.message}`);
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

		try {
			// Check if electronAPI is available
			if (!window.electronAPI) {
				alert(
					"Electron API not available. Please make sure you're running in Electron environment."
				);
				return;
			}

			if (!window.electronAPI.sendWhatsAppMessages) {
				alert(
					"Send WhatsApp messages function not available. Please check Electron configuration."
				);
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
		} catch (error) {
			console.error("Error sending WhatsApp messages:", error);
			setWaSending(false);
			setWaStatus(`Error: ${error.message}`);
			alert(`Error sending WhatsApp messages: ${error.message}`);
		}
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
							logoutWhatsApp={logoutWhatsApp}
							importWhatsAppContacts={importWhatsAppContacts}
							sendWhatsAppBulk={sendWhatsAppBulk}
						/>
					)}

					{activeTab === "gmail" && (
						<GmailForm
							isGmailAuthenticated={isGmailAuthenticated}
							emailList={emailList}
							setEmailList={setEmailList}
							subject={subject}
							setSubject={setSubject}
							message={message}
							setMessage={setMessage}
							delay={delay}
							setDelay={setDelay}
							isSending={isSending}
							results={results}
							importEmailList={importEmailList}
							sendGmailBulk={sendGmailBulk}
							authenticateGmail={authenticateGmail}
						/>
					)}

					{activeTab === "smtp" && (
						<SMTPForm
							smtpConfig={smtpConfig}
							setSMTPConfig={setSMTPConfig}
							emailList={emailList}
							setEmailList={setEmailList}
							subject={subject}
							setSubject={setSubject}
							message={message}
							setMessage={setMessage}
							delay={delay}
							setDelay={setDelay}
							isSending={isSending}
							results={results}
							importEmailList={importEmailList}
							sendSMTPBulk={sendSMTPBulk}
						/>
					)}
				</section>
			</main>
		</div>
	);
}
