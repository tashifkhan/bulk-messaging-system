import { useState } from "react";
const GmailIcon = () => (
	<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
		<path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
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
export default function GmailForm({
	isGmailAuthenticated,
	authenticateGmail,
	subject,
	setSubject,
	emailList,
	setEmailList,
	message,
	setMessage,
	delay,
	setDelay,
	importEmailList,
	sendGmailBulk,
	isSending,
}) {
	return (
		<div className="space-y-8">
			<div className="bg-[#23272a] rounded-2xl shadow-xl border border-[#36393f] p-8">
				{/* Gmail Auth Section */}
				{!isGmailAuthenticated ? (
					<div className="text-center space-y-6">
						<div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
							<LockIcon />
						</div>
						<h3 className="text-2xl font-bold text-white mb-2">
							Gmail Authentication Required
						</h3>
						<p className="text-[#b9bbbe]">
							Connect your Gmail account to start sending emails
						</p>
						<button
							onClick={authenticateGmail}
							className="bg-[#ea4335] hover:bg-[#c5221f] text-white font-semibold py-2 px-8 rounded-xl shadow transition-all flex items-center gap-2 mx-auto text-lg"
						>
							<GmailIcon /> Connect Gmail
						</button>
					</div>
				) : (
					<div className="text-center space-y-6">
						<div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
							<CheckIcon />
						</div>
						<h3 className="text-2xl font-bold text-white mb-2">
							Gmail Connected
						</h3>
						<p className="text-[#b9bbbe]">Ready to send emails via Gmail API</p>
					</div>
				)}
				{/* Email Composer */}
				{isGmailAuthenticated && (
					<form className="mt-10 space-y-8">
						<div>
							<label className="block text-sm font-semibold text-[#b9bbbe] mb-2">
								Subject
							</label>
							<input
								type="text"
								placeholder="Enter email subject"
								value={subject}
								onChange={(e) => setSubject(e.target.value)}
								className="w-full px-5 py-3 bg-[#36393f] border border-[#23272a] rounded-xl text-[#dcddde] placeholder-[#72767d] text-base shadow focus:ring-2 focus:ring-[#5865f2] focus:border-transparent transition-all"
							/>
						</div>
						<div>
							<div className="flex items-center justify-between mb-2">
								<label className="block text-sm font-semibold text-[#b9bbbe]">
									Recipients
								</label>
								<button
									onClick={importEmailList}
									className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-xl shadow transition-colors"
									type="button"
								>
									<FolderIcon /> Import File
								</button>
							</div>
							<textarea
								placeholder="Enter email addresses (one per line)\nexample1@email.com\nexample2@email.com"
								value={emailList}
								onChange={(e) => setEmailList(e.target.value)}
								rows={5}
								className="w-full px-5 py-3 bg-[#36393f] border border-[#23272a] rounded-xl text-[#dcddde] placeholder-[#72767d] font-mono text-base resize-none shadow focus:ring-2 focus:ring-[#5865f2] focus:border-transparent transition-all"
							/>
						</div>
						<div>
							<label className="block text-sm font-semibold text-[#b9bbbe] mb-2">
								Message
							</label>
							<textarea
								placeholder="Enter your email message (HTML supported)"
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								rows={8}
								className="w-full px-5 py-3 bg-[#36393f] border border-[#23272a] rounded-xl text-[#dcddde] placeholder-[#72767d] text-base resize-none shadow focus:ring-2 focus:ring-[#5865f2] focus:border-transparent transition-all"
							/>
						</div>
						<div>
							<label className="block text-sm font-semibold text-[#b9bbbe] mb-2">
								Delay between emails (milliseconds)
							</label>
							<input
								type="number"
								value={delay}
								onChange={(e) => setDelay(e.target.value)}
								min="100"
								max="10000"
								className="w-full px-5 py-3 bg-[#36393f] border border-[#23272a] rounded-xl text-[#dcddde] placeholder-[#72767d] text-base shadow focus:ring-2 focus:ring-[#5865f2] focus:border-transparent transition-all"
							/>
							<p className="text-xs text-[#72767d] mt-1">
								Recommended: 1000ms (1 second) to avoid rate limits
							</p>
						</div>
						<div className="flex justify-end">
							<button
								onClick={sendGmailBulk}
								disabled={isSending}
								type="button"
								className="flex items-center gap-2 bg-[#5865f2] hover:bg-[#4752c4] disabled:bg-gray-600 text-white font-semibold py-3 px-8 rounded-xl shadow transition-all disabled:opacity-50 text-lg"
							>
								<SendIcon /> {isSending ? "Sending..." : "Send Emails"}
							</button>
						</div>
					</form>
				)}
			</div>
		</div>
	);
}
