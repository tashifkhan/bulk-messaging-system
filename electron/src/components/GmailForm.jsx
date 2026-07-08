import React, { useState } from "react";
import { GmailIcon, FolderIcon, SendIcon, CheckIcon, LockIcon, HashIcon } from "./Icons";

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

function DiscordMessage({ avatar, username, color, timestamp, content }) {
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

function DiscordTextarea({ className = "", ...props }) {
	return (
		<textarea
			className={`w-full px-3 py-2.5 bg-[#383a40] text-[#dbdee1] placeholder-[#6d6f78] rounded-[4px] text-sm border-none focus:ring-2 focus:ring-[#5865f2]/30 transition-shadow resize-none ${className}`}
			{...props}
		/>
	);
}

function DiscordButton({ variant = "primary", className = "", children, ...props }) {
	const variants = {
		primary: "bg-[#5865f2] hover:bg-[#4752c4] text-white",
		green: "bg-[#23a55a] hover:bg-[#1a8a4a] text-white",
		red: "bg-[#da373c] hover:bg-[#a1282b] text-white",
		secondary: "bg-[#4e5058] hover:bg-[#6d6f78] text-white",
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

export default function GmailForm({
	isGmailAuthenticated,
	emailList,
	setEmailList,
	subject,
	setSubject,
	message,
	setMessage,
	delay,
	setDelay,
	isSending,
	results,
	importEmailList,
	sendGmailBulk,
	authenticateGmail,
	templateService,
}) {
	const recipientCount = emailList.split("\n").filter((e) => e.trim()).length;

	const formatTime = () => new Date().toLocaleTimeString();

	return (
		<div className="max-w-[800px] mx-auto">
			{/* Auth Section */}
			<div id="section-auth" className="scroll-mt-12">
				<SectionHeader title="Auth" />
				<div className="px-4">
					<div className="bg-[#2b2d31] rounded-[4px] border border-[#3f4149] p-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-[#ea4335] rounded-full flex items-center justify-center">
									{isGmailAuthenticated ? (
										<CheckIcon className="w-5 h-5 text-white" />
									) : (
										<LockIcon className="w-5 h-5 text-white" />
									)}
								</div>
								<div>
									<p className="text-sm font-semibold text-[#dbdee1]">Gmail Authentication</p>
									<p className="text-xs text-[#949ba4]">
										{isGmailAuthenticated ? "Authenticated" : "Authentication required"}
									</p>
								</div>
							</div>
							{isGmailAuthenticated ? (
								<div className="flex items-center gap-2 px-3 py-1.5 bg-[#23a55a]/10 border border-[#23a55a]/30 rounded-[4px]">
									<div className="w-2 h-2 rounded-full bg-[#23a55a]" />
									<span className="text-xs font-medium text-[#23a55a]">Authenticated</span>
								</div>
							) : (
								<DiscordButton variant="red" onClick={authenticateGmail} disabled={isSending}>
									<LockIcon className="w-4 h-4" />
									Authenticate
								</DiscordButton>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Recipients Section */}
			<div id="section-recipients" className="scroll-mt-12">
				<SectionHeader title="Recipients" />
				<div className="px-4">
					<div className="bg-[#2b2d31] rounded-[4px] border border-[#3f4149] p-4">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-[#23a55a] rounded-full flex items-center justify-center">
									<FolderIcon className="w-5 h-5 text-white" />
								</div>
								<div>
									<p className="text-sm font-semibold text-[#dbdee1]">Recipients</p>
									<p className="text-xs text-[#949ba4]">Import or enter email addresses</p>
								</div>
							</div>
							<DiscordButton variant="green" onClick={importEmailList} disabled={isSending}>
								<FolderIcon className="w-4 h-4" />
								Import
							</DiscordButton>
						</div>

						<div className="flex items-center gap-4 mb-4">
							<div className="bg-[#1e1f22] rounded-[4px] px-4 py-3 flex-1">
								<p className="text-[10px] text-[#949ba4] uppercase tracking-wider">Recipients</p>
								<p className="text-xl font-semibold text-[#dbdee1] mt-1">{recipientCount}</p>
							</div>
							<div className="bg-[#1e1f22] rounded-[4px] px-4 py-3 flex-1">
								<p className="text-[10px] text-[#949ba4] uppercase tracking-wider">Status</p>
								<p className="text-sm font-semibold text-[#dbdee1] mt-1">
									{recipientCount > 0 ? "Ready" : "No recipients"}
								</p>
							</div>
						</div>

						<DiscordTextarea
							value={emailList}
							onChange={(e) => setEmailList(e.target.value)}
							placeholder="email1@example.com&#10;email2@example.com&#10;email3@example.com"
							disabled={isSending}
							className="h-24"
						/>
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
								<p className="text-sm font-semibold text-[#dbdee1]">Email Content</p>
								<p className="text-xs text-[#949ba4]">Compose your email</p>
							</div>
						</div>

						<div className="space-y-3">
							<DiscordInput
								type="text"
								value={subject}
								onChange={(e) => setSubject(e.target.value)}
								placeholder="Enter email subject"
								disabled={isSending}
							/>

							<div className="relative">
								<DiscordTextarea
									value={message}
									onChange={(e) => setMessage(e.target.value)}
									placeholder="Type your email message here..."
									disabled={isSending}
									className="h-32"
								/>
								<span className="absolute bottom-3 right-3 text-[10px] text-[#6d6f78]">
									{message.length}/10000
								</span>
							</div>

							{templateService && (
								<EmailTemplateControls
									templateService={templateService}
									setSubject={setSubject}
									setMessage={setMessage}
								/>
							)}

							<div className="flex items-center gap-4">
								<div className="flex-1">
									<p className="text-[10px] text-[#949ba4] uppercase tracking-wider mb-1">Delay (ms)</p>
									<DiscordInput
										type="number"
										value={delay}
										onChange={(e) => setDelay(e.target.value)}
										min="1000"
										disabled={isSending}
									/>
								</div>
								<div className="flex-1 self-end">
									<DiscordButton
										variant="red"
										onClick={sendGmailBulk}
										disabled={isSending || !isGmailAuthenticated || recipientCount === 0 || !subject.trim() || !message.trim()}
										className="w-full justify-center py-2.5"
									>
										{isSending ? (
											<>
												<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
												<span>Sending...</span>
											</>
										) : (
											<>
												<SendIcon className="w-4 h-4" />
												<span>Send Bulk Email</span>
											</>
										)}
									</DiscordButton>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Activity Section */}
			<div id="section-activity" className="scroll-mt-12">
				<SectionHeader title="Activity Log" />
				<div className="px-4 pb-8">
					<div className="bg-[#2b2d31] rounded-[4px] border border-[#3f4149] min-h-[200px]">
						{results.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-16 text-[#949ba4]">
								<div className="w-10 h-10 bg-[#2b2d31] rounded-full border border-[#3f4149] flex items-center justify-center mb-3">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[#6d6f78]">
										<path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
									</svg>
								</div>
								<p className="text-xs font-medium">No activity yet</p>
								<p className="text-[10px] text-[#6d6f78] mt-0.5">Email results will appear here</p>
							</div>
						) : (
							<div className="py-2">
								{results.map((result, i) => (
									<DiscordMessage
										key={i}
										avatar="G"
										username="Gmail"
										color="#ea4335"
										timestamp={formatTime()}
										content={`${result.email} - ${result.status}${result.error ? ` (${result.error})` : ""}`}
										type={result.status === "sent" ? "success" : "error"}
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

function EmailTemplateControls({ templateService: ts, setSubject, setMessage }) {
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
		if (tpl?.subject) setSubject(tpl.subject);
		if (tpl?.message) setMessage(tpl.message);
		setShowList(false);
	};

	const handleDelete = async (name) => {
		await ts.del(name);
		setTemplates((prev) => prev.filter((t) => t.name !== name));
	};

	return (
		<div className="bg-[#1e1f22] rounded-[4px] p-3 mb-3">
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
