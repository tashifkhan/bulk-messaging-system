import { HashIcon } from "./Icons";

const tabNames = {
	whatsapp: "WhatsApp",
	gmail: "Gmail",
	smtp: "SMTP",
};

const tabDescriptions = {
	whatsapp: "Send bulk messages to your WhatsApp contacts",
	gmail: "Send bulk emails through the Gmail API",
	smtp: "Send bulk emails via custom SMTP server",
};

export default function TopBar({ activeTab }) {
	const name = tabNames[activeTab] || "App";
	const description = tabDescriptions[activeTab] || "";

	return (
		<header className="h-12 flex items-center px-4 border-b border-[#2b2d31] bg-[#313338] flex-shrink-0">
			<div className="flex items-center gap-2 min-w-0">
				<HashIcon className="w-6 h-6 text-[#949ba4] flex-shrink-0" />
				<h1 className="text-base font-semibold text-[#dbdee1] truncate">
					{name}
				</h1>
				{description && (
					<>
						<div className="w-px h-5 bg-[#3f4149] mx-1 flex-shrink-0" />
						<span className="text-sm text-[#949ba4] hidden sm:block truncate">
							{description}
						</span>
					</>
				)}
			</div>
		</header>
	);
}
