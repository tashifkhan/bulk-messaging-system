from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import csv
import re
import os
from werkzeug.utils import secure_filename
import json

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"txt", "csv", "xlsx", "xls"}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16MB max file size


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def clean_phone_number(phone):
    """Clean and standardize phone number format"""
    if not phone or pd.isna(phone):
        return None

    # Convert to string and remove all non-digit characters except +
    phone_str = str(phone).strip()

    # Remove common separators and spaces
    cleaned = re.sub(r"[-\s\(\)\.]", "", phone_str)

    # Remove any non-digit characters except +
    cleaned = re.sub(r"[^\d+]", "", cleaned)

    # Remove leading zeros if not international format
    if not cleaned.startswith("+") and cleaned.startswith("0"):
        cleaned = cleaned.lstrip("0")

    # Add + if it's missing and looks like international format
    if not cleaned.startswith("+") and len(cleaned) > 10:
        cleaned = "+" + cleaned

    # Validate length (should be between 10-15 digits for valid phone numbers)
    digits_only = re.sub(r"[^\d]", "", cleaned)
    if len(digits_only) < 7 or len(digits_only) > 15:
        return None

    return cleaned


def extract_contacts_from_csv(file_path):
    """Extract contacts from CSV file"""
    contacts = []

    try:
        # Try reading with pandas first
        df = pd.read_csv(file_path)

        # Look for common column names for phone numbers
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

        # Use the first phone column found, or the first column if none found
        phone_col = phone_columns[0] if phone_columns else df.columns[0]
        name_col = (
            name_columns[0]
            if name_columns
            else (df.columns[1] if len(df.columns) > 1 else None)
        )

        for _, row in df.iterrows():
            phone = clean_phone_number(row[phone_col])
            if phone:
                name = (
                    str(row[name_col]).strip()
                    if name_col and not pd.isna(row[name_col])
                    else None
                )
                contacts.append(
                    {"number": phone, "name": name or f"Contact {len(contacts) + 1}"}
                )

    except Exception as e:
        # Fallback to manual CSV parsing
        try:
            with open(file_path, "r", encoding="utf-8") as file:
                csv_reader = csv.reader(file)
                headers = next(csv_reader, None)

                for row in csv_reader:
                    if row:  # Skip empty rows
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
            print(f"Error parsing CSV: {e}")

    return contacts


def extract_contacts_from_txt(file_path):
    """Extract contacts from TXT file"""
    contacts = []

    try:
        with open(file_path, "r", encoding="utf-8") as file:
            lines = file.readlines()

        for line_num, line in enumerate(lines, 1):
            line = line.strip()
            if not line:
                continue

            # Try to split by common separators
            parts = re.split(r"[,;\t|]", line)

            # Extract phone number (look for the part that looks most like a phone number)
            phone_candidate = None
            name_candidate = None

            for part in parts:
                part = part.strip()
                if re.search(r"[\d+\-\(\)\s]{7,}", part):  # Looks like a phone number
                    if not phone_candidate:
                        phone_candidate = part
                elif part and not name_candidate:  # Looks like a name
                    name_candidate = part

            # If no clear separation, try to extract phone from the whole line
            if not phone_candidate:
                phone_match = re.search(r"[\+]?[\d\-\(\)\s]{7,}", line)
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
        print(f"Error parsing TXT file: {e}")

    return contacts


def extract_contacts_from_excel(file_path):
    """Extract contacts from Excel file"""
    contacts = []

    try:
        df = pd.read_excel(file_path)

        # Look for common column names for phone numbers
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

        # Use the first phone column found, or the first column if none found
        phone_col = phone_columns[0] if phone_columns else df.columns[0]
        name_col = (
            name_columns[0]
            if name_columns
            else (df.columns[1] if len(df.columns) > 1 else None)
        )

        for _, row in df.iterrows():
            phone = clean_phone_number(row[phone_col])
            if phone:
                name = (
                    str(row[name_col]).strip()
                    if name_col and not pd.isna(row[name_col])
                    else None
                )
                contacts.append(
                    {"number": phone, "name": name or f"Contact {len(contacts) + 1}"}
                )

    except Exception as e:
        print(f"Error parsing Excel file: {e}")

    return contacts


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify(
        {"status": "healthy", "message": "WhatsApp Contact Processor API is running"}
    )


@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(file_path)

        # Extract contacts based on file type
        file_extension = filename.rsplit(".", 1)[1].lower()

        try:
            if file_extension == "csv":
                contacts = extract_contacts_from_csv(file_path)
            elif file_extension == "txt":
                contacts = extract_contacts_from_txt(file_path)
            elif file_extension in ["xlsx", "xls"]:
                contacts = extract_contacts_from_excel(file_path)
            else:
                return jsonify({"error": "Unsupported file type"}), 400

            # Clean up uploaded file
            os.remove(file_path)

            return jsonify(
                {
                    "success": True,
                    "contacts": contacts,
                    "count": len(contacts),
                    "message": f"Successfully extracted {len(contacts)} contacts",
                }
            )

        except Exception as e:
            # Clean up uploaded file on error
            if os.path.exists(file_path):
                os.remove(file_path)
            return jsonify({"error": f"Failed to process file: {str(e)}"}), 500

    return (
        jsonify({"error": "Invalid file type. Allowed types: txt, csv, xlsx, xls"}),
        400,
    )


@app.route("/parse-manual-numbers", methods=["POST"])
def parse_manual_numbers():
    """Parse manually entered phone numbers"""
    try:
        data = request.get_json()
        if not data or "numbers" not in data:
            return jsonify({"error": "No numbers provided"}), 400

        numbers_text = data["numbers"]
        contacts = []

        # Split by common separators (newlines, commas, semicolons)
        raw_numbers = re.split(r"[\n,;]+", numbers_text)

        for raw_number in raw_numbers:
            raw_number = raw_number.strip()
            if not raw_number:
                continue

            # Try to extract name and number if both are present
            parts = re.split(r"[:\-\|]", raw_number, 1)

            if len(parts) == 2:
                # Format: "Name: Number" or "Name - Number"
                name_part = parts[0].strip()
                number_part = parts[1].strip()

                # Check which part is the number
                if re.search(r"[\d+\-\(\)\s]{7,}", number_part):
                    phone = clean_phone_number(number_part)
                    name = name_part
                elif re.search(r"[\d+\-\(\)\s]{7,}", name_part):
                    phone = clean_phone_number(name_part)
                    name = number_part
                else:
                    phone = clean_phone_number(raw_number)
                    name = None
            else:
                # Just a phone number
                phone = clean_phone_number(raw_number)
                name = None

            if phone:
                contacts.append(
                    {"number": phone, "name": name or f"Contact {len(contacts) + 1}"}
                )

        return jsonify(
            {
                "success": True,
                "contacts": contacts,
                "count": len(contacts),
                "message": f"Successfully parsed {len(contacts)} contacts",
            }
        )

    except Exception as e:
        return jsonify({"error": f"Failed to parse numbers: {str(e)}"}), 500


@app.route("/validate-number", methods=["POST"])
def validate_number():
    """Validate a single phone number"""
    try:
        data = request.get_json()
        if not data or "number" not in data:
            return jsonify({"error": "No number provided"}), 400

        phone = clean_phone_number(data["number"])

        return jsonify(
            {
                "valid": phone is not None,
                "cleaned_number": phone,
                "original": data["number"],
            }
        )

    except Exception as e:
        return (
            jsonify(
                {
                    "error": f"Failed to validate number: {str(e)}",
                },
            ),
            500,
        )


if __name__ == "__main__":
    app.run(
        debug=True,
        host="0.0.0.0",
        port=5034,
    )
