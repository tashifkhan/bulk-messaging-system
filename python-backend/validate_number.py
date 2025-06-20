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


if __name__ == "__main__":
    number = sys.argv[1] if len(sys.argv) > 1 else ""
    phone = clean_phone_number(number)
    result = {"valid": phone is not None, "cleaned_number": phone, "original": number}
    print(json.dumps(result))
