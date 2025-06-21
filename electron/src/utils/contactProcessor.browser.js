import * as XLSX from "xlsx";
import csv from "csvtojson";

const DEFAULT_CONFIG = {
  allowedExtensions: ["txt", "csv", "xlsx", "xls"],
  phone: {
    minLength: 7,
    maxLength: 15,
    internationalThreshold: 10,
    prefixPlus: true
  },
  columnPatterns: {
    phone: [/phone/i, /number/i, /mobile/i, /cell/i, /tel/i],
    name: [/name/i, /contact/i, /person/i]
  }
};

class ContactProcessor {
  constructor(config = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      phone: {
        ...DEFAULT_CONFIG.phone,
        ...(config.phone || {})
      },
      columnPatterns: {
        phone:
          config.columnPatterns?.phone ||
          DEFAULT_CONFIG.columnPatterns.phone,
        name:
          config.columnPatterns?.name ||
          DEFAULT_CONFIG.columnPatterns.name
      }
    };
  }

  cleanPhoneNumber(input) {
    if (!input) return null;
    let s = String(input).trim();
    s = s.replace(/[-\s().]/g, "");
    s = s.replace(/[^\d+]/g, "");
    if (!s.startsWith("+") && s.startsWith("0")) {
      s = s.replace(/^0+/, "");
    }
    const digits = s.replace(/[^\d]/g, "");
    if (
      this.config.phone.prefixPlus &&
      !s.startsWith("+") &&
      digits.length > this.config.phone.internationalThreshold
    ) {
      s = "+" + s;
    }
    if (
      digits.length < this.config.phone.minLength ||
      digits.length > this.config.phone.maxLength
    ) {
      return null;
    }
    return s;
  }

  getExtension(filename) {
    return filename.split(".").pop().toLowerCase();
  }

  isAllowedExtension(filename) {
    const ext = this.getExtension(filename);
    return this.config.allowedExtensions.includes(ext);
  }

  async extractContactsFromCsvText(text) {
    const rows = await csv().fromString(text);
    return this._rowsToContacts(rows);
  }

  extractContactsFromTxtText(text) {
    const lines = text.split(/\r?\n/);
    const contacts = [];
    lines.forEach((line) => {
      const L = line.trim();
      if (!L) return;
      const parts = L.split(/[,;\t|]/).map((p) => p.trim());
      let phoneCand = null;
      let nameCand = null;
      parts.forEach((p) => {
        if (!phoneCand && /[\d+\-()\s]{7,}/.test(p)) {
          phoneCand = p;
        } else if (!nameCand && p) {
          nameCand = p;
        }
      });
      if (!phoneCand) {
        const m = L.match(/[+]?[-\d()\s]{7,}/);
        if (m) {
          phoneCand = m[0];
          nameCand = L.replace(m[0], "").trim();
        }
      }
      const phone = this.cleanPhoneNumber(phoneCand);
      if (!phone) return;
      const name = nameCand || `Contact ${contacts.length + 1}`;
      contacts.push({ number: phone, name });
    });
    return contacts;
  }

  extractContactsFromExcelArrayBuffer(arrayBuffer) {
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
    return this._rowsToContacts(rows);
  }

  _rowsToContacts(rows) {
    const contacts = [];
    if (rows.length === 0) return contacts;
    const cols = Object.keys(rows[0]);
    const phoneCol = cols.find(c =>
      this.config.columnPatterns.phone.some(rx => rx.test(c))
    ) || cols[0];
    const nameCol = cols.find(c =>
      this.config.columnPatterns.name.some(rx => rx.test(c))
    ) || cols[1] || null;
    rows.forEach((row) => {
      const phone = this.cleanPhoneNumber(row[phoneCol]);
      if (!phone) return;
      let name = nameCol && row[nameCol] ? String(row[nameCol]).trim() : null;
      name = name || `Contact ${contacts.length + 1}`;
      contacts.push({ number: phone, name });
    });
    return contacts;
  }

  parseManualNumbers(numbersText) {
    const raw = String(numbersText).split(/[\n,;]+/);
    const contacts = [];
    raw.forEach((item) => {
      const txt = item.trim();
      if (!txt) return;
      const parts = txt.split(/[:-|]/).map((p) => p.trim());
      let phone, name;
      if (parts.length === 2) {
        const [a, b] = parts;
        if (/[\d+\-()\s]{7,}/.test(b)) {
          phone = this.cleanPhoneNumber(b);
          name = a;
        } else if (/[\d+\-()\s]{7,}/.test(a)) {
          phone = this.cleanPhoneNumber(a);
          name = b;
        } else {
          phone = this.cleanPhoneNumber(txt);
        }
      } else {
        phone = this.cleanPhoneNumber(txt);
      }
      if (phone) {
        name = name || `Contact ${contacts.length + 1}`;
        contacts.push({ number: phone, name });
      }
    });
    return {
      success: true,
      contacts,
      count: contacts.length,
      message: `Parsed ${contacts.length} contacts`
    };
  }
}

export default ContactProcessor; 