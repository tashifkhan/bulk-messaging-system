import { MailIcon, GmailIcon, ServerIcon, WhatsAppIcon } from "./Icons";

export default function Sidebar({ activeTab, setActiveTab }) {
	const servers = [
		{ id: "whatsapp", icon: WhatsAppIcon, label: "WhatsApp", color: "#25d366" },
		{ id: "gmail", icon: GmailIcon, label: "Gmail", color: "#ea4335" },
		{ id: "smtp", icon: ServerIcon, label: "SMTP", color: "#5865f2" },
	];

	return (
		<div className="w-[72px] bg-[#1e1f22] flex flex-col items-center py-3 gap-2 flex-shrink-0">
			<div className="w-12 h-12 bg-[#5865f2] rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-200 hover:rounded-xl shadow-md">
				<MailIcon className="w-6 h-6 text-white" />
			</div>

			<div className="w-8 h-[2px] bg-[#35363c] rounded-full my-1" />

			<nav className="flex flex-col gap-2 flex-1">
				{servers.map((server) => {
					const isActive = activeTab === server.id;
					const Icon = server.icon;
					return (
						<div key={server.id} className="relative group flex items-center justify-center">
							<div
								className={`absolute -left-3 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all duration-200 ${
									isActive
										? "h-6 bg-white"
										: "h-0 bg-white group-hover:h-5"
								}`}
							/>
							<button
								onClick={() => setActiveTab(server.id)}
								className={`w-12 h-12 flex items-center justify-center transition-all duration-200 text-white ${
									isActive
										? "rounded-xl"
										: "rounded-3xl hover:rounded-xl"
								}`}
								style={{ backgroundColor: server.color }}
								title={server.label}
							>
								<Icon />
							</button>
						</div>
					);
				})}
			</nav>

			<div className="mt-auto">
				<div className="w-8 h-[2px] bg-[#35363c] rounded-full mb-3" />
				<div className="w-12 h-12 bg-[#248046] rounded-3xl hover:rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
						<path d="M20 11.1111H12.8889V4H11.1111V11.1111H4V12.8889H11.1111V20H12.8889V12.8889H20V11.1111Z" />
					</svg>
				</div>
			</div>
		</div>
	);
}
