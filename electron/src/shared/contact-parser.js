function cleanPhoneNumber(phone) {
	if (!phone) return null;

	const phoneText = String(phone).trim();
	let cleaned = phoneText.replace(/[-\s().]/g, "");
	cleaned = cleaned.replace(/[^\d+]/g, "");

	if (!cleaned.startsWith("+") && cleaned.startsWith("0")) {
		cleaned = cleaned.replace(/^0+/, "");
	}

	if (!cleaned.startsWith("+") && cleaned.length > 10) {
		cleaned = `+${cleaned}`;
	}

	const digitsOnly = cleaned.replace(/\D/g, "");
	if (digitsOnly.length < 7 || digitsOnly.length > 15) return null;

	return cleaned;
}

function parseDelimitedLine(line) {
	const values = [];
	let current = "";
	let inQuotes = false;

	for (let index = 0; index < line.length; index += 1) {
		const char = line[index];
		const nextChar = line[index + 1];

		if (char === '"' && nextChar === '"' && inQuotes) {
			current += '"';
			index += 1;
			continue;
		}

		if (char === '"') {
			inQuotes = !inQuotes;
			continue;
		}

		if (char === "," && !inQuotes) {
			values.push(current.trim());
			current = "";
			continue;
		}

		current += char;
	}

	values.push(current.trim());
	return values;
}

export function parseManualNumbers(numbersText = "") {
	const contacts = [];
	const rawNumbers = String(numbersText).split(/[\n,;]+/);

	for (const rawValue of rawNumbers) {
		const rawNumber = rawValue.trim();
		if (!rawNumber) continue;

		const parts = rawNumber.split(/[:|]|\s-\s/, 2).map((part) => part.trim());
		let phone = null;
		let name = null;

		if (parts.length === 2) {
			const [left, right] = parts;
			const phoneLike = /[\d+\-()\s]{7,}/;

			if (phoneLike.test(right)) {
				phone = cleanPhoneNumber(right);
				name = left;
			} else if (phoneLike.test(left)) {
				phone = cleanPhoneNumber(left);
				name = right;
			}
		}

		if (!phone) {
			phone = cleanPhoneNumber(rawNumber);
		}

		if (phone) {
			contacts.push({
				number: phone,
				name: name || `Contact ${contacts.length + 1}`,
				email: "",
				fields: {},
			});
		}
	}

	return {
		success: true,
		contacts,
		count: contacts.length,
		message: `Successfully parsed ${contacts.length} contacts`,
	};
}

export function parseContactsFromCsv(csvText = "") {
	const lines = String(csvText)
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean);

	if (lines.length === 0) return [];

	const firstRow = parseDelimitedLine(lines[0]);
	const lowerHeaders = firstRow.map((header) => header.toLowerCase());
	const hasHeader = lowerHeaders.some((header) =>
		["number", "phone", "mobile", "name"].includes(header)
	);
	const numberIndex = hasHeader
		? lowerHeaders.findIndex((header) => ["number", "phone", "mobile"].includes(header))
		: 0;
	const nameIndex = hasHeader ? lowerHeaders.indexOf("name") : 1;
	const dataLines = hasHeader ? lines.slice(1) : lines;
	const contacts = [];

	for (const line of dataLines) {
		const row = parseDelimitedLine(line);
		const number = cleanPhoneNumber(row[numberIndex]);
		if (!number) continue;

		contacts.push({
			number,
			name: row[nameIndex]?.trim() || `Contact ${contacts.length + 1}`,
			email: "",
			fields: {},
		});
	}

	return contacts;
}

export function parseContactsFromText(text = "") {
	return parseManualNumbers(text).contacts;
}

export function parseEmailsFromText(text = "") {
	return String(text)
		.split(/[\n,;]+/)
		.map((line) => line.trim())
		.filter((line) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(line));
}

export function parseEmailsFromCsv(csvText = "") {
	const lines = String(csvText)
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean);

	if (lines.length === 0) return [];

	const firstRow = parseDelimitedLine(lines[0]);
	const lowerHeaders = firstRow.map((header) => header.toLowerCase());
	const emailIndex = lowerHeaders.findIndex((header) =>
		["email", "address", "email_address"].includes(header)
	);
	const hasHeader = emailIndex !== -1;
	const dataLines = hasHeader ? lines.slice(1) : lines;
	const columnIndex = hasHeader ? emailIndex : 0;

	return dataLines
		.map((line) => parseDelimitedLine(line)[columnIndex]?.trim())
		.filter((email) => email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
}

export function parseCsvHeaders(csvText = "") {
	const lines = String(csvText).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
	if (lines.length === 0) return [];
	return parseDelimitedLine(lines[0]).map((h) => h.trim());
}

export function parseContactsFromCsvWithMapping(csvText = "", mapping = {}) {
	const lines = String(csvText).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
	if (lines.length < 2) return { success: false, contacts: [], message: "No data rows found" };

	const headers = parseDelimitedLine(lines[0]).map((h) => h.trim());
	const dataLines = lines.slice(1);
	const contacts = [];

	for (const line of dataLines) {
		if (!line.trim()) continue;
		const values = parseDelimitedLine(line);
		const contact = { fields: {} };

		if (mapping.phoneIndex !== undefined && mapping.phoneIndex >= 0) {
			const phone = cleanPhoneNumber(values[mapping.phoneIndex]);
			if (!phone) continue;
			contact.number = phone;
		}

		if (mapping.nameIndex !== undefined && mapping.nameIndex >= 0) {
			contact.name = values[mapping.nameIndex]?.trim() || "";
		}

		if (mapping.emailIndex !== undefined && mapping.emailIndex >= 0) {
			contact.email = values[mapping.emailIndex]?.trim() || "";
		}

		headers.forEach((header, idx) => {
			if (values[idx] !== undefined) {
				contact.fields[header] = values[idx].trim();
			}
		});

		if (!contact.number) continue;
		if (!contact.name) contact.name = `Contact ${contacts.length + 1}`;
		if (!contact.email) contact.email = "";

		contacts.push(contact);
	}

	return {
		success: true,
		contacts,
		count: contacts.length,
		message: `Successfully imported ${contacts.length} contacts`,
	};
}
