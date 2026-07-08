import { useState, useEffect, useMemo } from "react";
import Sidebar from "./Sidebar";
import ChannelSidebar from "./ChannelSidebar";
import TopBar from "./TopBar";
import WhatsAppForm from "./WhatsAppForm";
import GmailForm from "./GmailForm";
import SMTPForm from "./SMTPForm";
import ColumnMappingModal from "./ColumnMappingModal";
import { parseContactsFromText } from "../shared/contact-parser.js";

const channelConfig = {
	whatsapp: [
		{ id: "connection", name: "connection" },
		{ id: "contacts", name: "contacts" },
		{ id: "compose", name: "compose" },
		{ id: "activity", name: "activity-log" },
	],
	gmail: [
		{ id: "auth", name: "auth" },
		{ id: "recipients", name: "recipients" },
		{ id: "compose", name: "compose" },
		{ id: "activity", name: "activity-log" },
	],
	smtp: [
		{ id: "config", name: "config" },
		{ id: "recipients", name: "recipients" },
		{ id: "compose", name: "compose" },
		{ id: "activity", name: "activity-log" },
	],
};

export default function BulkMailer() {
	const [activeTab, setActiveTabInternal] = useState("whatsapp");
	const [activeChannel, setActiveChannel] = useState("connection");

	const setActiveTab = (tab) => {
		setActiveTabInternal(tab);
		const channels = channelConfig[tab];
		if (channels && channels.length > 0) {
			setActiveChannel(channels[0].id);
		}
	};
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

	const [waContacts, setWaContacts] = useState([]);
	const [waMessage, setWaMessage] = useState("");
	const [waStatus, setWaStatus] = useState("");
	const [waQR, setWaQR] = useState(null);
	const [waSending, setWaSending] = useState(false);
	const [waResults, setWaResults] = useState([]);

	const [showMappingModal, setShowMappingModal] = useState(false);
	const [rawImportData, setRawImportData] = useState(null);

	const contactFieldNames = useMemo(() => {
		const names = new Set();
		waContacts.forEach((c) => {
			if (c.name) names.add("name");
			Object.keys(c.fields || {}).forEach((k) => names.add(k));
		});
		return [...names];
	}, [waContacts]);

	const checkGmailAuth = async () => {
		try {
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

	useEffect(() => {
		const gmailAuthTimer = window.setTimeout(() => {
			checkGmailAuth();
		}, 0);

		const removeWaStatus = window.electronAPI?.onWhatsAppStatus?.((status) =>
			setWaStatus(status)
		);
		const removeWaQR = window.electronAPI?.onWhatsAppQR?.((qr) =>
			setWaQR(qr)
		);
		const removeWaSendStatus = window.electronAPI?.onWhatsAppSendStatus?.(
			(msg) => {
				setWaStatus(msg);
				setWaResults((prev) => [...prev, msg]);
			}
		);

		return () => {
			window.clearTimeout(gmailAuthTimer);
			if (removeWaStatus) removeWaStatus();
			if (removeWaQR) removeWaQR();
			if (removeWaSendStatus) removeWaSendStatus();
		};
	}, []);

	const handleChannelSelect = (channelId) => {
		setActiveChannel(channelId);
		const el = document.getElementById(`section-${channelId}`);
		if (el) {
			el.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	};

	const authenticateGmail = async () => {
		try {
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
				alert(
					`Gmail authentication failed: ${
						result.error || result.message || "Unknown error"
					}`
				);
			}
		} catch (error) {
			console.error("Error authenticating Gmail:", error);
			alert(`Error authenticating Gmail: ${error.message}`);
		}
	};

	const importEmailList = async () => {
		try {
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
			if (!window.electronAPI?.importWhatsAppContacts) {
				alert(
					"WhatsApp contact import is only available in the Electron app."
				);
				return;
			}
			const result = await window.electronAPI.importWhatsAppContacts();
			if (!result || result.canceled) return;
			if (result.success && result.ext === ".csv" && result.headers?.length > 0) {
				setRawImportData({ content: result.content, fileName: result.fileName, headers: result.headers });
				setShowMappingModal(true);
			} else if (result.success && result.ext === ".txt") {
				const contacts = parseContactsFromText(result.content);
				setWaContacts(contacts);
				alert(`Imported ${contacts.length} contacts from ${result.fileName}`);
			} else {
				alert(result.error || "No valid contacts found in file.");
			}
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

	const handleMappingImport = (mappingResult) => {
		setWaContacts(mappingResult.contacts);
		setShowMappingModal(false);
		setRawImportData(null);
		if (mappingResult.contacts.length > 0) {
			alert(`Imported ${mappingResult.contacts.length} contacts from ${rawImportData?.fileName || "file"}`);
		}
	};

	const handleCancelMapping = () => {
		setShowMappingModal(false);
		setRawImportData(null);
	};

	const waTemplateService = {
		save: (name) => window.electronAPI.saveTemplate({ name, channel: "whatsapp", message: waMessage }),
		list: async () => {
			const r = await window.electronAPI.listTemplates();
			return (r.templates || []).filter((t) => t.channel === "whatsapp");
		},
		del: (name) => window.electronAPI.deleteTemplate(name),
	};

	const gmailTemplateService = {
		save: (name) => window.electronAPI.saveTemplate({ name, channel: "gmail", subject, message }),
		list: async () => {
			const r = await window.electronAPI.listTemplates();
			return (r.templates || []).filter((t) => t.channel === "gmail");
		},
		del: (name) => window.electronAPI.deleteTemplate(name),
	};

	const smtpTemplateService = {
		save: (name) => window.electronAPI.saveTemplate({ name, channel: "smtp", subject, message }),
		list: async () => {
			const r = await window.electronAPI.listTemplates();
			return (r.templates || []).filter((t) => t.channel === "smtp");
		},
		del: (name) => window.electronAPI.deleteTemplate(name),
	};

	return (
		<div className="flex h-screen bg-[#313338]">
			<Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
			<ChannelSidebar
				channels={channelConfig[activeTab]}
				activeChannel={activeChannel}
				onChannelSelect={handleChannelSelect}
				activeTab={activeTab}
			/>
			<main className="flex-1 flex flex-col min-w-0">
				<TopBar activeTab={activeTab} />
				<section className="flex-1 overflow-y-auto">
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
							contactFieldNames={contactFieldNames}
							templateService={waTemplateService}
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
							templateService={gmailTemplateService}
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
							templateService={smtpTemplateService}
						/>
					)}
				</section>
			</main>

			{showMappingModal && rawImportData && (
				<ColumnMappingModal
					fileName={rawImportData.fileName}
					headers={rawImportData.headers}
					content={rawImportData.content}
					onImport={handleMappingImport}
					onCancel={handleCancelMapping}
				/>
			)}
		</div>
	);
}
