import { useState, useMemo } from "react";
import { HashIcon } from "./Icons";
import { parseContactsFromCsvWithMapping } from "../shared/contact-parser.js";

function DiscordSelect({ options, value, onChange, placeholder }) {
	return (
		<select
			value={value}
			onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
			className="w-full px-3 py-2 bg-[#383a40] text-[#dbdee1] rounded-[4px] text-sm border-none focus:ring-2 focus:ring-[#5865f2]/30 transition-shadow appearance-none cursor-pointer"
		>
			<option value="" className="bg-[#2b2d31]">{placeholder}</option>
			{options.map((opt, i) => (
				<option key={i} value={i} className="bg-[#2b2d31]">
					{opt}
				</option>
			))}
		</select>
	);
}

export default function ColumnMappingModal({
	fileName,
	headers,
	content,
	onImport,
	onCancel,
}) {
	const [phoneIndex, setPhoneIndex] = useState(
		headers.findIndex((h) => /phone|number|mobile|tel|cell/i.test(h))
	);
	const [nameIndex, setNameIndex] = useState(
		headers.findIndex((h) => /name|contact|person|full.?name/i.test(h))
	);
	const [emailIndex, setEmailIndex] = useState(
		headers.findIndex((h) => /email|e-?mail|address/i.test(h))
	);

	const preview = useMemo(() => {
		if (phoneIndex === undefined || phoneIndex < 0) return [];
		const result = parseContactsFromCsvWithMapping(content, {
			phoneIndex,
			nameIndex,
			emailIndex,
		});
		return result.contacts.slice(0, 5);
	}, [content, phoneIndex, nameIndex, emailIndex]);

	const handleImport = () => {
		if (phoneIndex === undefined || phoneIndex < 0) {
			alert("Please select a column for phone numbers");
			return;
		}
		const result = parseContactsFromCsvWithMapping(content, {
			phoneIndex,
			nameIndex,
			emailIndex,
		});
		onImport(result);
	};

	const unmappedColumns = headers.filter(
		(_, i) => i !== phoneIndex && i !== nameIndex && i !== emailIndex
	);

	const allMapped = phoneIndex !== undefined && phoneIndex >= 0;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85">
			<div className="bg-[#2b2d31] rounded-[4px] border border-[#3f4149] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
				<div className="flex items-center justify-between px-4 h-12 border-b border-[#3f4149]">
					<div className="flex items-center gap-2">
						<HashIcon className="w-5 h-5 text-[#949ba4]" />
						<h2 className="text-base font-semibold text-[#dbdee1]">
							Import Contacts
						</h2>
					</div>
					<button
						onClick={onCancel}
						className="w-8 h-8 rounded hover:bg-[#393c41] flex items-center justify-center text-[#949ba4] hover:text-[#dbdee1] transition-colors"
					>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
							<path d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z" />
						</svg>
					</button>
				</div>

				<div className="p-4 space-y-4">
					<div className="bg-[#1e1f22] rounded-[4px] px-4 py-3">
						<p className="text-xs text-[#949ba4]">
							<span className="text-[#dbdee1] font-medium">{fileName}</span>
							{" \u2022 "}{headers.length} columns found
						</p>
					</div>

					<div>
						<p className="text-[10px] text-[#949ba4] uppercase tracking-wider mb-2 font-semibold">
							Column Mapping
						</p>
						<div className="space-y-2">
							<div className="flex items-center gap-3">
								<div className="w-24 flex-shrink-0">
									<p className="text-xs text-[#dbdee1] font-medium">Phone *</p>
								</div>
								<div className="flex-1">
									<DiscordSelect
										options={headers}
										value={phoneIndex}
										onChange={setPhoneIndex}
										placeholder="Select column..."
									/>
								</div>
								{phoneIndex >= 0 && (
									<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[#23a55a] flex-shrink-0">
										<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
									</svg>
								)}
							</div>

							<div className="flex items-center gap-3">
								<div className="w-24 flex-shrink-0">
									<p className="text-xs text-[#949ba4]">Name</p>
								</div>
								<div className="flex-1">
									<DiscordSelect
										options={headers}
										value={nameIndex}
										onChange={setNameIndex}
										placeholder="Not mapped"
									/>
								</div>
								{nameIndex >= 0 && (
									<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[#23a55a] flex-shrink-0">
										<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
									</svg>
								)}
							</div>

							<div className="flex items-center gap-3">
								<div className="w-24 flex-shrink-0">
									<p className="text-xs text-[#949ba4]">Email</p>
								</div>
								<div className="flex-1">
									<DiscordSelect
										options={headers}
										value={emailIndex}
										onChange={setEmailIndex}
										placeholder="Not mapped"
									/>
								</div>
								{emailIndex >= 0 && (
									<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[#23a55a] flex-shrink-0">
										<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
									</svg>
								)}
							</div>
						</div>
					</div>

					{unmappedColumns.length > 0 && (
						<div>
							<p className="text-[10px] text-[#949ba4] uppercase tracking-wider mb-2 font-semibold">
								Available as Variables
							</p>
							<div className="flex flex-wrap gap-1.5">
								{unmappedColumns.map((col, i) => (
									<span
										key={i}
										className="px-2 py-1 bg-[#383a40] text-[#949ba4] text-xs rounded-[4px]"
									>
										{`{{${col}}}`}
									</span>
								))}
							</div>
						</div>
					)}

					<div>
						<p className="text-[10px] text-[#949ba4] uppercase tracking-wider mb-2 font-semibold">
							Preview
						</p>
						<div className="bg-[#1e1f22] rounded-[4px] max-h-32 overflow-y-auto">
							{phoneIndex === undefined || phoneIndex < 0 ? (
								<div className="flex items-center justify-center py-6 text-[#949ba4] text-xs">
									Select a phone column to preview
								</div>
							) : preview.length === 0 ? (
								<div className="flex items-center justify-center py-6 text-[#f23f43] text-xs">
									No valid phone numbers found
								</div>
							) : (
								<div className="divide-y divide-[#3f4149]">
									{preview.map((c, i) => (
										<div key={i} className="flex items-center gap-3 px-3 py-2">
											<div className="w-7 h-7 bg-[#5865f2] rounded-full flex items-center justify-center text-white font-semibold text-[10px] flex-shrink-0">
												{(c.name || c.number).charAt(0).toUpperCase()}
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-sm text-[#dbdee1] truncate font-medium">
													{c.name || "Unknown"}
												</p>
												<p className="text-[10px] text-[#6d6f78]">
													{c.number}
													{c.email ? ` \u2022 ${c.email}` : ""}
												</p>
											</div>
											{Object.keys(c.fields).length > 0 && (
												<span className="text-[10px] text-[#6d6f78] flex-shrink-0">
													{Object.keys(c.fields).length} vars
												</span>
											)}
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</div>

				<div className="flex items-center justify-between px-4 py-3 border-t border-[#3f4149]">
					<button
						onClick={onCancel}
						className="px-4 py-2 rounded-[4px] text-sm font-medium text-[#dbdee1] bg-transparent hover:bg-[#393c41] transition-colors"
					>
						Cancel
					</button>
					<button
						onClick={handleImport}
						disabled={!allMapped}
						className="px-6 py-2 rounded-[4px] text-sm font-medium transition-all duration-150 bg-[#5865f2] hover:bg-[#4752c4] text-white disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Import
					</button>
				</div>
			</div>
		</div>
	);
}
