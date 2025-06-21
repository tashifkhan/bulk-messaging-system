import fs from "fs/promises";
import path from "path";
import csv from "csvtojson";
import XLSX from "xlsx";
import EventEmitter from "events";

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
  },
  cleanupUploadedFile: true
};

class ContactProcessor extends EventEmitter {
  constructor(config = {}) {
    super();
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

  static healthCheck() {
    return {
      status: "healthy",
      message: "WhatsApp Contact Processor is ready"
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
    return path.extname(filename).slice(1).toLowerCase();
  }

  isAllowedExtension(filename) {
    const ext = this.getExtension(filename);
    return this.config.allowedExtensions.includes(ext);
  }

  async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
    } catch {
      // ignore
    }
  }

  async extractContactsFromCsv(filePath) {
    const rows = await csv().fromFile(filePath);
    const contacts = [];
    if (rows.length === 0) return contacts;

    const cols = Object.keys(rows[0]);
    const phoneCols = cols.filter(c =>
      this.config.columnPatterns.phone.some(rx => rx.test(c))
    );
    const nameCols = cols.filter(c =>
      this.config.columnPatterns.name.some(rx => rx.test(c))
    );
    const phoneCol = phoneCols[0] || cols[0];
    const nameCol = nameCols[0] || cols[1] || null;

    rows.forEach(row => {
      const raw = row[phoneCol];
      const phone = this.cleanPhoneNumber(raw);
      if (!phone) return;
      let name = nameCol && row[nameCol]
        ? String(row[nameCol]).trim()
        : null;
      name = name || `Contact ${contacts.length + 1}`;
      contacts.push({ number: phone, name });
    });
    return contacts;
  }

  async extractContactsFromTxt(filePath) {
    const text = await fs.readFile(filePath, "utf8");
    const lines = text.split(/\r?\n/);
    const contacts = [];

    lines.forEach(line => {
      const L = line.trim();
      if (!L) return;
      const parts = L.split(/[,;\t|]/).map(p => p.trim());
      let phoneCand = null;
      let nameCand = null;

      parts.forEach(p => {
        if (!phoneCand && /[\d+\-()\s]{7,}/.test(p)) {
          phoneCand = p;
        } else if (!nameCand && p) {
          nameCand = p;
        }
      });
      if (!phoneCand) {
        const m = L.match(/[+]?[\d\-()\s]{7,}/);
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

  async extractContactsFromExcel(filePath) {
    const wb = XLSX.readFile(filePath);
    const sheetName = wb.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], {
      defval: ""
    });
    const contacts = [];
    if (rows.length === 0) return contacts;

    const cols = Object.keys(rows[0]);
    const phoneCols = cols.filter(c =>
      this.config.columnPatterns.phone.some(rx => rx.test(c))
    );
    const nameCols = cols.filter(c =>
      this.config.columnPatterns.name.some(rx => rx.test(c))
    );
    const phoneCol = phoneCols[0] || cols[0];
    const nameCol = nameCols[0] || cols[1] || null;

    rows.forEach(row => {
      const phone = this.cleanPhoneNumber(row[phoneCol]);
      if (!phone) return;
      let name = nameCol && row[nameCol]
        ? String(row[nameCol]).trim()
        : null;
      name = name || `Contact ${contacts.length + 1}`;
      contacts.push({ number: phone, name });
    });
    return contacts;
  }

  async processFile(filePath, originalName) {
    if (!this.isAllowedExtension(originalName)) {
      throw new Error(
        `Invalid file type. Allowed: ${
          this.config.allowedExtensions.join(", ")
        }`
      );
    }
    const ext = this.getExtension(originalName);
    this.emit("start", { filePath, originalName, ext });
    let contacts = [];
    try {
      if (ext === "csv") {
        contacts = await this.extractContactsFromCsv(filePath);
      } else if (ext === "txt") {
        contacts = await this.extractContactsFromTxt(filePath);
      } else {
        contacts = await this.extractContactsFromExcel(filePath);
      }
      this.emit("done", { count: contacts.length });
      return {
        success: true,
        contacts,
        count: contacts.length,
        message: `Extracted ${contacts.length} contacts`
      };
    } catch (err) {
      this.emit("error", err);
      throw err;
    } finally {
      if (this.config.cleanupUploadedFile) {
        await this.deleteFile(filePath);
      }
    }
  }

  parseManualNumbers(numbersText) {
    const raw = String(numbersText).split(/[\n,;]+/);
    const contacts = [];

    raw.forEach(item => {
      const txt = item.trim();
      if (!txt) return;
      const parts = txt.split(/[:-|]/).map(p => p.trim());
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

  validateNumber(number) {
    const cleaned = this.cleanPhoneNumber(number);
    return {
      valid: Boolean(cleaned),
      cleaned,
      original: number
    };
  }
}

export default ContactProcessor; 