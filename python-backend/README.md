# WhatsApp Contact Processor - Python Backend

This Python Flask backend processes CSV, TXT, and Excel files to extract phone numbers and contact information for the WhatsApp bulk messaging system.

## Features

- **File Processing**: Supports CSV, TXT, XLSX, and XLS files
- **Smart Phone Number Extraction**: Automatically detects and cleans phone numbers
- **Manual Number Input**: Parse manually entered phone numbers
- **Flexible Format Support**: Handles various phone number formats
- **Name Detection**: Automatically extracts contact names when available
- **CORS Enabled**: Ready for frontend integration

## Setup

1. **Install Dependencies**:

   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

2. **Manual Setup** (alternative):

   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Start the Server**:
   ```bash
   source venv/bin/activate
   python app.py
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### 1. Health Check

- **GET** `/health`
- Returns server status

### 2. File Upload

- **POST** `/upload`
- Upload CSV, TXT, XLSX, or XLS files
- Returns extracted contacts

### 3. Parse Manual Numbers

- **POST** `/parse-manual-numbers`
- Body: `{ "numbers": "phone numbers text" }`
- Returns parsed contacts

### 4. Validate Number

- **POST** `/validate-number`
- Body: `{ "number": "phone number" }`
- Returns validation result

## Supported File Formats

### CSV Files

```csv
name,phone
John Doe,+1234567890
Jane Smith,555-123-4567
```

### TXT Files

```
John Doe: +1234567890
Jane Smith - 555-123-4567
+44 20 7946 0958 Bob Johnson
(555) 987-6543
```

### Excel Files

- Standard Excel files with name and phone columns
- Automatically detects column headers

## Phone Number Formats

The system supports various phone number formats:

- International: `+1234567890`
- With parentheses: `(555) 123-4567`
- With dashes: `555-123-4567`
- With spaces: `555 123 4567`
- Mixed formats: `+1 (555) 123-4567`

## Manual Input Formats

When adding numbers manually, you can use:

- Simple format: `+1234567890`
- With name: `John Doe: +1234567890`
- Alternative: `+1234567890 - John Doe`
- One number per line

## Error Handling

- Invalid file types are rejected
- Malformed phone numbers are filtered out
- Network errors are handled gracefully
- Fallback parsing for edge cases

## Testing

Test files are included:

- `sample_contacts.csv` - Sample CSV format
- `sample_contacts.txt` - Sample TXT format

## Integration

The Electron frontend automatically connects to this backend when:

1. The Python server is running on port 5000
2. File import or manual number entry is used
3. Falls back to basic parsing if backend is unavailable
