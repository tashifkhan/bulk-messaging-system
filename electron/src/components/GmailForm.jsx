import { useState } from "react";
import { GmailIcon, FolderIcon, SendIcon, CheckIcon, LockIcon } from "./Icons";

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
}) {
	return (
		<div className="w-full max-w-5xl mx-auto">
			{/* Modern Header */}
			<div className="flex items-center justify-between mb-8 p-6 bg-gradient-to-r from-[#ea4335]/10 to-[#ea4335]/5 rounded-2xl border border-[#ea4335]/20">
				<div className="flex items-center gap-4">
					<div className="relative">
						<div className="w-16 h-16 bg-gradient-to-br from-[#ea4335] to-[#d23125] rounded-2xl flex items-center justify-center shadow-lg">
							<GmailIcon className="w-8 h-8 text-white" />
						</div>
						<div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#23272a] rounded-full flex items-center justify-center border-2 border-[#ea4335]">
							<div
								className={`w-3 h-3 rounded-full ${
									isGmailAuthenticated ? "bg-green-400" : "bg-gray-500"
								}`}
							></div>
						</div>
					</div>
					<div>
						<h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
							Gmail Bulk Sender
						</h1>
						<p className="text-gray-400 font-medium">
							Send bulk emails using Gmail API
						</p>
					</div>
				</div>
				<div className="text-right">
					<div className="text-sm text-gray-400 mb-1">Authentication</div>
					<div
						className={`font-semibold text-lg ${
							isGmailAuthenticated ? "text-green-400" : "text-yellow-400"
						}`}
					>
						{isGmailAuthenticated ? "Authenticated" : "Not Authenticated"}
					</div>
				</div>
			</div>

			{/* Main Content Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column - Controls */}
				<div className="lg:col-span-2 space-y-6">
					{/* Authentication Status */}
					<div className="bg-[#2b2d31] rounded-xl p-6 border border-[#404249] shadow-xl">
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-[#ea4335] rounded-lg flex items-center justify-center">
									{isGmailAuthenticated ? (
										<CheckIcon className="w-5 h-5 text-white" />
									) : (
										<LockIcon className="w-5 h-5 text-white" />
									)}
								</div>
								<div>
									<h3 className="text-lg font-semibold text-white">
										Gmail Authentication
									</h3>
									<p className="text-sm text-gray-400">
										{isGmailAuthenticated
											? "Ready to send emails"
											: "Authentication required"}
									</p>
								</div>
							</div>
							{isGmailAuthenticated ? (
								<div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
									<CheckIcon className="w-4 h-4 text-green-400" />
									<span className="text-green-400 font-medium">
										Authenticated
									</span>
								</div>
							) : (
								<button
									onClick={authenticateGmail}
									disabled={isSending}
									className="px-6 py-3 bg-gradient-to-r from-[#ea4335] to-[#d23125] hover:from-[#d23125] hover:to-[#c2312f] disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center gap-2"
								>
									<LockIcon className="w-4 h-4" />
									Authenticate Gmail
								</button>
							)}
						</div>
					</div>

					{/* Email Configuration */}
					<div className="bg-[#2b2d31] rounded-xl p-6 border border-[#404249] shadow-xl">
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-[#23a55a] rounded-lg flex items-center justify-center">
									<FolderIcon className="w-5 h-5 text-white" />
								</div>
								<div>
									<h3 className="text-lg font-semibold text-white">
										Recipients
									</h3>
									<p className="text-sm text-gray-400">
										Import or enter email addresses
									</p>
								</div>
							</div>
							<button
								onClick={importEmailList}
								disabled={isSending}
								className="px-6 py-3 bg-gradient-to-r from-[#23a55a] to-[#1e8e4f] hover:from-[#1e8e4f] hover:to-[#198a47] disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center gap-2"
							>
								<FolderIcon className="w-4 h-4" />
								Import Email List
							</button>
						</div>

						<div className="grid grid-cols-2 gap-4 mb-4">
							<div className="bg-[#313338] rounded-lg p-4 border border-[#404249]">
								<div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
									Recipients
								</div>
								<div className="text-2xl font-bold text-white">
									{emailList.split("\n").filter((email) => email.trim()).length}
								</div>
							</div>
							<div className="bg-[#313338] rounded-lg p-4 border border-[#404249]">
								<div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
									Status
								</div>
								<div className="text-sm font-semibold text-white">
									{emailList.split("\n").filter((email) => email.trim())
										.length > 0
										? "Ready"
										: "No recipients"}
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div>
								<label className="block text-gray-300 text-sm font-medium mb-2">
									Email Recipients (one per line)
								</label>
								<textarea
									value={emailList}
									onChange={(e) => setEmailList(e.target.value)}
									placeholder="email1@example.com
email2@example.com
email3@example.com"
									disabled={isSending}
									className="w-full h-32 px-4 py-3 bg-[#313338] border border-[#404249] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#5865f2] focus:ring-2 focus:ring-[#5865f2]/20 disabled:opacity-50 resize-none transition-all duration-200"
								/>
							</div>
						</div>
					</div>

					{/* Email Content */}
					<div className="bg-[#2b2d31] rounded-xl p-6 border border-[#404249] shadow-xl">
						<div className="flex items-center gap-3 mb-6">
							<div className="w-10 h-10 bg-[#f23f42] rounded-lg flex items-center justify-center">
								<SendIcon className="w-5 h-5 text-white" />
							</div>
							<div>
								<h3 className="text-lg font-semibold text-white">
									Email Content
								</h3>
								<p className="text-sm text-gray-400">Compose your email</p>
							</div>
						</div>

						<div className="space-y-4">
							<div>
								<label className="block text-gray-300 text-sm font-medium mb-2">
									Subject
								</label>
								<input
									type="text"
									value={subject}
									onChange={(e) => setSubject(e.target.value)}
									placeholder="Enter email subject"
									disabled={isSending}
									className="w-full px-4 py-3 bg-[#313338] border border-[#404249] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#5865f2] focus:ring-2 focus:ring-[#5865f2]/20 disabled:opacity-50 transition-all duration-200"
								/>
							</div>

							<div className="relative">
								<label className="block text-gray-300 text-sm font-medium mb-2">
									Message
								</label>
								<textarea
									value={message}
									onChange={(e) => setMessage(e.target.value)}
									placeholder="Type your email message here..."
									disabled={isSending}
									className="w-full h-40 px-4 py-3 bg-[#313338] border border-[#404249] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#5865f2] focus:ring-2 focus:ring-[#5865f2]/20 disabled:opacity-50 resize-none transition-all duration-200"
								/>
								<div className="absolute bottom-3 right-3 text-xs text-gray-500">
									{message.length}/10000
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-gray-300 text-sm font-medium mb-2">
										Delay between emails (ms)
									</label>
									<input
										type="number"
										value={delay}
										onChange={(e) => setDelay(e.target.value)}
										min="1000"
										disabled={isSending}
										className="w-full px-4 py-3 bg-[#313338] border border-[#404249] rounded-lg text-white focus:outline-none focus:border-[#5865f2] focus:ring-2 focus:ring-[#5865f2]/20 disabled:opacity-50 transition-all duration-200"
									/>
								</div>
								<div className="flex items-end">
									<button
										onClick={sendGmailBulk}
										disabled={
											isSending ||
											!isGmailAuthenticated ||
											emailList.split("\n").filter((email) => email.trim())
												.length === 0 ||
											!subject.trim() ||
											!message.trim()
										}
										className="w-full px-6 py-3 bg-gradient-to-r from-[#ea4335] to-[#d23125] hover:from-[#d23125] hover:to-[#c2312f] disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-2"
									>
										{isSending ? (
											<>
												<div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
												<span>Sending...</span>
											</>
										) : (
											<>
												<SendIcon className="w-4 h-4" />
												<span>Send Bulk Email</span>
											</>
										)}
									</button>
								</div>
							</div>
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
								<p className="text-sm text-gray-400">Real-time email status</p>
							</div>
						</div>

						<div className="flex-1 bg-[#313338] rounded-lg border border-[#404249] overflow-hidden">
							{results.length === 0 ? (
								<div className="h-full flex flex-col items-center justify-center text-gray-500">
									<div className="w-16 h-16 bg-[#404249] rounded-full flex items-center justify-center mb-4">
										<div className="w-8 h-8 border-2 border-gray-500 border-dashed rounded-full"></div>
									</div>
									<p className="font-medium">No activity yet</p>
									<p className="text-sm">Email results will appear here</p>
								</div>
							) : (
								<div className="h-full overflow-y-auto p-4">
									<div className="space-y-3">
										{/* Display email results */}
										{results.map((result, index) => (
											<div
												key={`result-${index}`}
												className="flex items-start gap-3 p-3 rounded-lg bg-[#2b2d31] border border-[#404249]"
											>
												<div
													className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
														result.status === "sent"
															? "bg-green-400"
															: result.status === "failed"
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
															result.status === "sent"
																? "text-green-400"
																: result.status === "failed"
																? "text-red-400"
																: "text-gray-300"
														}`}
													>
														{result.email} - {result.status}
														{result.error && ` (${result.error})`}
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
