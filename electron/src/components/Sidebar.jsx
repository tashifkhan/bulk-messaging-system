import React from "react";
const MailIcon = () => (
	<svg
		className="w-6 h-6 text-amber-50"
		viewBox="0 0 24 24"
		fill="currentColor"
	>
		<path d="M2.25 6.75c0 .41.2.775.51.999L12 13.52l9.24-5.771c.31-.224.51-.589.51-.999V5.25A2.25 2.25 0 0 0 19.5 3H4.5A2.25 2.25 0 0 0 2.25 5.25v1.5z" />
		<path d="M12 14.985L2.756 9.214A2.25 2.25 0 0 0 2.25 11.25v7.5A2.25 2.25 0 0 0 4.5 21h15a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-.506-2.036L12 14.985z" />
	</svg>
);
const GmailIcon = () => (
	<svg
		className="w-5 h-5 text-amber-50"
		viewBox="0 0 24 24"
		fill="currentColor"
	>
		<path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
	</svg>
);
const ServerIcon = () => (
	<svg
		className="w-5 h-5 text-amber-50"
		viewBox="0 0 24 24"
		fill="currentColor"
	>
		<path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6zM4 14a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2z" />
		<circle cx="7" cy="7" r="1" />
		<circle cx="7" cy="15" r="1" />
	</svg>
);
const WhatsAppIcon = () => (
	<svg
		className="w-5 h-5 text-amber-50"
		viewBox="0 0 32 32"
		fill="currentColor"
	>
		<path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.832 4.584 2.236 6.393L4 29l7.828-2.236C13.416 27.168 15.615 28 18 28c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-2.021 0-3.938-.586-5.555-1.6l-.396-.25-4.646 1.328 1.328-4.646-.25-.396C6.586 18.938 6 17.021 6 15c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.29-7.71c-.26-.13-1.54-.76-1.78-.85-.24-.09-.41-.13-.58.13-.17.26-.67.85-.82 1.02-.15.17-.3.19-.56.06-.26-.13-1.09-.4-2.07-1.28-.76-.68-1.27-1.52-1.42-1.78-.15-.26-.02-.4.11-.53.11-.11.26-.3.39-.45.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.06-.13-.58-1.39-.8-1.91-.21-.51-.43-.44-.58-.45-.15-.01-.32-.01-.5-.01-.17 0-.45.06-.68.32-.23.26-.9.88-.9 2.15s.92 2.49 1.05 2.66c.13.17 1.81 2.77 4.39 3.78.61.21 1.09.33 1.46.42.61.13 1.16.11 1.6.07.49-.05 1.54-.63 1.76-1.24.22-.61.22-1.13.15-1.24-.07-.11-.24-.17-.5-.3z" />
	</svg>
);
export default function Sidebar({ activeTab, setActiveTab }) {
	return (
		<aside className="w-20 gap-5 flex flex-col items-center py-6 bg-[#23272a] shadow-lg border-r border-[#23272a]">
			{/* App Icon */}
			<div className="mb-8">
				<div className="w-12 h-12 bg-[#5865f2] rounded-2xl flex items-center justify-center shadow-lg">
					<MailIcon />
				</div>
			</div>
			{/* Nav Icons */}
			<nav className="flex flex-col gap-4 flex-1">
				<button
					className={`group w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-150 ${
						activeTab === "gmail"
							? "bg-[#5865f2] shadow-lg"
							: "hover:bg-[#36393f]"
					}`}
					onClick={() => setActiveTab("gmail")}
				>
					<GmailIcon />
				</button>
				<button
					className={`group w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-150 ${
						activeTab === "smtp"
							? "bg-[#5865f2] shadow-lg"
							: "hover:bg-[#36393f]"
					}`}
					onClick={() => setActiveTab("smtp")}
				>
					<ServerIcon />
				</button>
				<button
					className={`group w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-150 ${
						activeTab === "whatsapp"
							? "bg-green-600 shadow-lg"
							: "hover:bg-[#36393f]"
					}`}
					onClick={() => setActiveTab("whatsapp")}
				>
					<WhatsAppIcon />
				</button>
			</nav>
			{/* Footer (optional) */}
			<div className="mt-8">
				<span className="text-xs text-[#72767d]">v1.0</span>
			</div>
		</aside>
	);
}
