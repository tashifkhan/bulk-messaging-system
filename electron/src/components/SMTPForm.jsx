import { ServerIcon, SendIcon } from "./Icons";
export default function SMTPForm({
	smtpConfig,
	setSMTPConfig,
	message,
	setMessage,
	subject,
	setSubject,
	emailList,
	setEmailList,
	delay,
	setDelay,
	importEmailList,
	sendSMTPBulk,
	isSending,
}) {
	return (
		<div className="space-y-8">
			<div className="bg-[#23272a] rounded-2xl shadow-xl border border-[#36393f] p-8">
				<form className="space-y-8">
					<h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
						<ServerIcon /> SMTP Server Configuration
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div>
							<label className="block text-sm font-semibold text-[#b9bbbe] mb-2">
								SMTP Host
							</label>
							<input
								type="text"
								placeholder="smtp.gmail.com"
								value={smtpConfig.host}
								onChange={(e) =>
									setSMTPConfig({ ...smtpConfig, host: e.target.value })
								}
								className="w-full px-5 py-3 bg-[#36393f] border border-[#23272a] rounded-xl text-[#dcddde] placeholder-[#72767d] text-base shadow focus:ring-2 focus:ring-[#5865f2] focus:border-transparent transition-all"
							/>
						</div>
						<div>
							<label className="block text-sm font-semibold text-[#b9bbbe] mb-2">
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
								className="w-full px-5 py-3 bg-[#36393f] border border-[#23272a] rounded-xl text-[#dcddde] placeholder-[#72767d] text-base shadow focus:ring-2 focus:ring-[#5865f2] focus:border-transparent transition-all"
							/>
						</div>
						<div>
							<label className="block text-sm font-semibold text-[#b9bbbe] mb-2">
								Email Address
							</label>
							<input
								type="email"
								placeholder="your.email@gmail.com"
								value={smtpConfig.user}
								onChange={(e) =>
									setSMTPConfig({ ...smtpConfig, user: e.target.value })
								}
								className="w-full px-5 py-3 bg-[#36393f] border border-[#23272a] rounded-xl text-[#dcddde] placeholder-[#72767d] text-base shadow focus:ring-2 focus:ring-[#5865f2] focus:border-transparent transition-all"
							/>
						</div>
						<div>
							<label className="block text-sm font-semibold text-[#b9bbbe] mb-2">
								Password
							</label>
							<input
								type="password"
								placeholder="App Password"
								value={smtpConfig.pass}
								onChange={(e) =>
									setSMTPConfig({ ...smtpConfig, pass: e.target.value })
								}
								className="w-full px-5 py-3 bg-[#36393f] border border-[#23272a] rounded-xl text-[#dcddde] placeholder-[#72767d] text-base shadow focus:ring-2 focus:ring-[#5865f2] focus:border-transparent transition-all"
							/>
						</div>
					</div>
					<div className="mt-4">
						<label className="flex items-center gap-2 text-[#b9bbbe] cursor-pointer">
							<input
								type="checkbox"
								checked={smtpConfig.secure}
								onChange={(e) =>
									setSMTPConfig({ ...smtpConfig, secure: e.target.checked })
								}
								className="w-5 h-5 text-[#5865f2] bg-[#36393f] border-[#23272a] rounded focus:ring-[#5865f2] transition-all"
							/>
							<span className="text-sm">Use SSL/TLS (port 465)</span>
						</label>
					</div>
					<div className="flex justify-end">
						<button
							onClick={sendSMTPBulk}
							disabled={isSending}
							type="button"
							className="flex items-center gap-2 bg-[#5865f2] hover:bg-[#4752c4] disabled:bg-gray-600 text-white font-semibold py-3 px-8 rounded-xl shadow transition-all disabled:opacity-50 text-lg"
						>
							<SendIcon /> {isSending ? "Sending..." : "Send Emails"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
