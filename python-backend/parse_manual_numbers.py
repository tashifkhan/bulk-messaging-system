import sys
import json
import re


def clean_phone_number(phone):
    if not phone:
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


def parse_manual_numbers(numbers_text):
    contacts = []
    raw_numbers = re.split(r"[\n,;]+", numbers_text)
    for raw_number in raw_numbers:
        raw_number = raw_number.strip()
        if not raw_number:
            continue
        parts = re.split(r"[:\-\|]", raw_number, 1)
        if len(parts) == 2:
            name_part = parts[0].strip()
            number_part = parts[1].strip()
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
            phone = clean_phone_number(raw_number)
            name = None
        if phone:
            contacts.append(
                {"number": phone, "name": name or f"Contact {len(contacts) + 1}"}
            )
    return {
        "success": True,
        "contacts": contacts,
        "count": len(contacts),
        "message": f"Successfully parsed {len(contacts)} contacts",
    }


if __name__ == "__main__":
    numbers_text = sys.argv[1] if len(sys.argv) > 1 else ""
    result = parse_manual_numbers(numbers_text)
    print(json.dumps(result))
