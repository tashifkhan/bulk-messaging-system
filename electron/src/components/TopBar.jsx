export default function TopBar({ activeTab }) {
	return (
		<header className="h-16 flex items-center px-8 border-b border-[#23272a] bg-[#23272a]/80 backdrop-blur-md shadow-sm">
			<div className="flex items-center gap-3 text-[#dcddde] text-lg font-semibold">
				<span className="text-[#454356]">{".   #"}</span>
				<span>
					{activeTab === "gmail"
						? "Gmail"
						: activeTab === "smtp"
						? "SMTP"
						: "WhatsApp"}
				</span>
				<span className="text-xs text-[#72767d] font-normal ml-2">
					{activeTab === "gmail"
						? "Bulk Email via Gmail API"
						: activeTab === "smtp"
						? "Bulk Email via SMTP"
						: "Bulk WhatsApp Messaging"}
				</span>
			</div>
		</header>
	);
}
