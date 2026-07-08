import { HashIcon, SettingsIcon } from "./Icons";

const serviceColors = {
	whatsapp: { bg: "#25d366", text: "#dbdee1" },
	gmail: { bg: "#ea4335", text: "#dbdee1" },
	smtp: { bg: "#5865f2", text: "#dbdee1" },
};

const serviceNames = {
	whatsapp: "WhatsApp",
	gmail: "Gmail",
	smtp: "SMTP",
};

const serviceAvatars = {
	whatsapp: "W",
	gmail: "G",
	smtp: "S",
};

export default function ChannelSidebar({
	channels = [],
	activeChannel,
	onChannelSelect,
	activeTab,
}) {
	const colors = serviceColors[activeTab] || serviceColors.whatsapp;
	const name = serviceNames[activeTab] || "App";
	const avatar = serviceAvatars[activeTab] || "A";

	return (
		<div className="w-60 bg-[#2b2d31] flex flex-col flex-shrink-0">
			<div className="h-12 px-4 flex items-center shadow-[0_1px_0_#1e1f22] z-10">
				<h1 className="text-base font-semibold text-[#dbdee1] truncate">
					{name}
				</h1>
			</div>

			<div className="flex-1 overflow-y-auto px-2 py-3">
				<div className="mb-2">
					<div className="flex items-center gap-1 px-2 py-1">
						<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className="text-[#949ba4]">
							<path d="M5 2a1 1 0 0 0-1 1v1H3a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V7h1a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H8V3a1 1 0 0 0-1-1H6z" />
						</svg>
						<span className="text-[11px] font-semibold text-[#949ba4] uppercase tracking-wider">
							Text Channels
						</span>
					</div>
				</div>

				<div className="space-y-0.5">
					{channels.map((channel) => {
						const isActive = activeChannel === channel.id;
						return (
							<button
								key={channel.id}
								onClick={() => onChannelSelect(channel.id)}
								className={`w-full flex items-center gap-1.5 px-2 py-1 rounded text-sm transition-colors ${
									isActive
										? "bg-[#3f4248] text-[#dbdee1]"
										: "text-[#949ba4] hover:bg-[#393c41] hover:text-[#dbdee1]"
								}`}
							>
								<HashIcon />
								<span className="truncate">{channel.name}</span>
							</button>
						);
					})}
				</div>
			</div>

			<div className="px-2 py-2 bg-[#1e1f22] flex-shrink-0">
				<div className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-[#393c41] cursor-pointer transition-colors">
					<div
						className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
						style={{ backgroundColor: colors.bg }}
					>
						{avatar}
					</div>
					<div className="flex-1 min-w-0">
						<div className="text-sm font-semibold text-[#dbdee1] truncate leading-tight">
							{name}
						</div>
						<div className="flex items-center gap-1">
							<div className="w-2 h-2 rounded-full bg-[#23a55a]" />
							<span className="text-[11px] text-[#949ba4]">Online</span>
						</div>
					</div>
					<button className="w-7 h-7 rounded hover:bg-[#393c41] flex items-center justify-center text-[#949ba4] hover:text-[#dbdee1] transition-colors flex-shrink-0">
						<SettingsIcon />
					</button>
				</div>
			</div>
		</div>
	);
}
