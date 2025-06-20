import sys
import json
import os
import re
import pandas as pd
import csv


def clean_phone_number(phone):
    if not phone or pd.isna(phone):
        return None
    phone_str = str(phone).strip()
    cleaned = re.sub(r"[-\s\(\)\.]", "", phone_str)
    cleaned = re.sub(r"[^\d+]", "", cleaned)
    if not cleaned.startswith("+") and cleaned.startswith("0"):
        cleaned = cleaned.lstrip("0")
    if not cleaned.startswith("+") and len(cleaned) > 10:
        cleaned = "+" + cleaned
    digits_only = re.sub(r"[^\d]", "", cleaned)
    if len(digits_only) < 7 or len(digits_only) > 15:
        return None
    return cleaned


def extract_contacts_from_csv(file_path):
    contacts = []
    try:
        df = pd.read_csv(file_path)
        phone_columns = []
        name_columns = []
        for col in df.columns:
            col_lower = col.lower()
            if any(
                keyword in col_lower
                for keyword in ["phone", "number", "mobile", "cell", "tel"]
            ):
                phone_columns.append(col)
            elif any(keyword in col_lower for keyword in ["name", "contact", "person"]):
                name_columns.append(col)
        phone_col = phone_columns[0] if len(phone_columns) > 0 else df.columns[0]
        name_col = (
            name_columns[0]
            if len(name_columns) > 0
            else (df.columns[1] if len(df.columns) > 1 else None)
        )
        for _, row in df.iterrows():
            phone = clean_phone_number(row[phone_col])
            if phone:
                name_val = row[name_col] if name_col is not None else None
                if name_col is not None and not (
                    isinstance(name_val, float) and pd.isna(name_val)
                ):
                    name = str(name_val).strip()
                else:
                    name = None
                contacts.append(
                    {"number": phone, "name": name or f"Contact {len(contacts) + 1}"}
                )
    except Exception as e:
        try:
            with open(file_path, "r", encoding="utf-8") as file:
                csv_reader = csv.reader(file)
                headers = next(csv_reader, None)
                for row in csv_reader:
                    if row:
                        phone = clean_phone_number(row[0])
                        if phone:
                            name = (
                                row[1].strip()
                                if len(row) > 1 and row[1].strip()
                                else None
                            )
                            contacts.append(
                                {
                                    "number": phone,
                                    "name": name or f"Contact {len(contacts) + 1}",
                                }
                            )
        except Exception as e:
            pass
    return contacts


def extract_contacts_from_txt(file_path):
    contacts = []
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            lines = file.readlines()
        for line_num, line in enumerate(lines, 1):
            line = line.strip()
            if not line:
                continue
            parts = re.split(r"[,;\t|]", line)
            phone_candidate = None
            name_candidate = None
            for part in parts:
                part = part.strip()
                if re.search(r"[\d+\-\(\)\s]{7,}", part):
                    if not phone_candidate:
                        phone_candidate = part
                elif part and not name_candidate:
                    name_candidate = part
            if not phone_candidate:
                phone_match = re.search(r"[\+]?[+\-\(\)\s]{7,}", line)
                if phone_match:
                    phone_candidate = phone_match.group()
                    name_candidate = line.replace(phone_candidate, "").strip()
            phone = clean_phone_number(phone_candidate)
            if phone:
                contacts.append(
                    {
                        "number": phone,
                        "name": name_candidate or f"Contact {len(contacts) + 1}",
                    }
                )
    except Exception as e:
        pass
    return contacts


def extract_contacts_from_excel(file_path):
    contacts = []
    try:
        df = pd.read_excel(file_path)
        phone_columns = []
        name_columns = []
        for col in df.columns:
            col_lower = col.lower()
            if any(
                keyword in col_lower
                for keyword in ["phone", "number", "mobile", "cell", "tel"]
            ):
                phone_columns.append(col)
            elif any(keyword in col_lower for keyword in ["name", "contact", "person"]):
                name_columns.append(col)
        phone_col = phone_columns[0] if len(phone_columns) > 0 else df.columns[0]
        name_col = (
            name_columns[0]
            if len(name_columns) > 0
            else (df.columns[1] if len(df.columns) > 1 else None)
        )
        for _, row in df.iterrows():
            phone = clean_phone_number(row[phone_col])
            if phone:
                name_val = row[name_col] if name_col is not None else None
                if name_col is not None and not (
                    isinstance(name_val, float) and pd.isna(name_val)
                ):
                    name = str(name_val).strip()
                else:
                    name = None
                contacts.append(
                    {"number": phone, "name": name or f"Contact {len(contacts) + 1}"}
                )
    except Exception as e:
        pass
    return contacts


if __name__ == "__main__":
    file_path = sys.argv[1] if len(sys.argv) > 1 else ""
    if not os.path.exists(file_path):
        print(json.dumps({"success": False, "error": "File not found"}))
        sys.exit(1)
    ext = os.path.splitext(file_path)[1].lower()
    contacts = []
    if ext == ".csv":
        contacts = extract_contacts_from_csv(file_path)
    elif ext == ".txt":
        contacts = extract_contacts_from_txt(file_path)
    elif ext in [".xlsx", ".xls"]:
        contacts = extract_contacts_from_excel(file_path)
    else:
        print(json.dumps({"success": False, "error": "Unsupported file type"}))
        sys.exit(1)
    print(json.dumps({"success": True, "contacts": contacts, "count": len(contacts)}))
