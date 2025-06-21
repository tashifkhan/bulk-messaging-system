# Bulk Messaging System

A desktop application for sending bulk WhatsApp messages and emails. Built with Electron and React for the frontend, with Python backend support for advanced contact processing and validation.

## Features

### Core Functionality

- **WhatsApp Bulk Messaging**: Send messages to multiple contacts via WhatsApp Web
- **Email Bulk Sending**: Support for both Gmail API and SMTP servers
- **Contact Management**: Import and process contacts from various file formats
- **Real-time Progress Tracking**: Monitor sending progress with detailed status updates
- **Rate Limiting**: Configurable delays to avoid spam detection
- **Cross-Platform**: Works on Windows, macOS, and Linux

### WhatsApp Features

- **WhatsApp Web Integration**: Connect via QR code authentication
- **Contact Import**: Support for CSV, Excel, and text files
- **Manual Number Entry**: Add phone numbers manually with validation
- **Message Templates**: Create and save message templates
- **Status Monitoring**: Real-time connection and sending status
- **Error Handling**: Robust error handling with retry mechanisms

### Email Features

- **Gmail API Integration**: Secure OAuth2 authentication
- **SMTP Support**: Use any SMTP server (Gmail, Outlook, custom)
- **Email Validation**: Automatic email format validation
- **File Attachments**: Support for email attachments
- **HTML Email Support**: Rich text email composition
- **Bounce Handling**: Track failed deliveries

### Advanced Features

- **Contact Processing**: Advanced contact extraction and validation
- **Number Formatting**: Automatic phone number formatting
- **Duplicate Detection**: Remove duplicate contacts
- **Export Results**: Export sending results and statistics
- **Secure Storage**: Encrypted credential storage
- **Modern UI**: Beautiful, responsive interface with dark theme

## Architecture

### Frontend (Electron + React)

- **Electron**: Cross-platform desktop application framework
- **React 19**: Modern UI with hooks and functional components
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Vite**: Fast build tool and development server

### Backend Components

- **Python Backend**: Contact processing and validation utilities
- **WhatsApp Web.js**: WhatsApp Web API integration
- **Nodemailer**: Email sending functionality
- **Google APIs**: Gmail API integration

## Getting Started

### Prerequisites

- **Node.js 16+** and npm
- **Python 3.8+** (for backend utilities)
- **Google Cloud Console account** (for Gmail API)
- **WhatsApp account** (for WhatsApp messaging)
- **SMTP server credentials** (if using SMTP method)

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/tashifkhan/bulk-messaging-system
cd WhatsappBulkMessaging
```

2. **Install Electron dependencies:**

```bash
cd electron
npm install
```

3. **Install Python backend dependencies:**

```bash
cd ../python-backend
pip install -r requirements.txt
```

4. **Start the development server:**

```bash
# From the electron directory
npm run dev
```

## Configuration

### Gmail API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure OAuth consent screen
6. Create desktop application credentials
7. Download the credentials JSON file

### Environment Variables

Create a `.env` file in the `electron` directory:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

### SMTP Configuration

#### Gmail SMTP

- **Host**: smtp.gmail.com
- **Port**: 587 (TLS) or 465 (SSL)
- **Security**: Use App Password (not regular password)

#### Outlook/Hotmail SMTP

- **Host**: smtp-mail.outlook.com
- **Port**: 587
- **Security**: TLS

## Usage Guide

### WhatsApp Messaging

1. **Connect to WhatsApp:**

   - Click "WhatsApp" tab
   - Click "Connect to WhatsApp"
   - Scan QR code with your phone
   - Wait for authentication

2. **Import Contacts:**

   - Click "Import Contacts" to upload CSV/Excel files
   - Or manually enter phone numbers
   - Validate and format phone numbers

3. **Compose Message:**

   - Enter your message text
   - Use templates if available
   - Set delay between messages

4. **Send Messages:**
   - Review recipient list
   - Click "Send Bulk Messages"
   - Monitor progress in real-time

### Email Sending

#### Gmail API Method

1. Click "Gmail API" tab
2. Authenticate with your Google account
3. Import or enter email addresses
4. Compose email (subject, message)
5. Configure delay between emails
6. Click "Send Bulk Email"

#### SMTP Method

1. Click "SMTP" tab
2. Enter SMTP server configuration
3. Import or enter email addresses
4. Compose email
5. Configure delay between emails
6. Click "Send Bulk Email"

### Contact Management

#### Supported File Formats

- **CSV**: Comma-separated values
- **Excel**: .xlsx and .xls files
- **Text**: Plain text files (one contact per line)

#### Contact Processing Features

- Automatic phone number formatting
- Email validation
- Duplicate removal
- Country code detection
- Invalid contact filtering

## File Structure

```
WhatsappBulkMessaging/
├── electron/                    # Electron application
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── BulkMailer.jsx  # Main application component
│   │   │   ├── WhatsAppForm.jsx # WhatsApp interface
│   │   │   ├── GmailForm.jsx   # Gmail interface
│   │   │   ├── SMTPForm.jsx    # SMTP interface
│   │   │   └── Sidebar.jsx     # Navigation sidebar
│   │   ├── electron/           # Electron main process
│   │   │   ├── main.js         # Main Electron entry point
│   │   │   ├── preload.js      # Secure IPC bridge
│   │   │   ├── gmail-handler.js # Gmail API integration
│   │   │   ├── smtp-handler.js # SMTP email sending
│   │   │   └── utils.js        # Utility functions
│   │   ├── ui/                 # React UI
│   │   │   ├── App.jsx         # Main React component
│   │   │   └── main.jsx        # React entry point
│   │   └── utils/              # Utility functions
│   │       └── contactProcessor.browser.js # Contact processing
│   ├── package.json            # Node.js dependencies
│   └── electron-builder.json   # Build configuration
├── python-backend/             # Python utilities
│   ├── app.py                  # Main Python application
│   ├── extract_contacts.py     # Contact extraction utilities
│   ├── parse_manual_numbers.py # Manual number parsing
│   ├── validate_number.py      # Phone number validation
│   └── requirements.txt        # Python dependencies
├── localhost/                  # Local development utilities
│   ├── app.py                  # Local server
│   └── cli_functions.py        # Command-line functions
└── README.md                   # This file
```

## Development

### Available Scripts

#### Electron Development

```bash
# Development
npm run dev                    # Start both React and Electron
npm run dev:react             # Start React dev server only
npm run dev:electron          # Start Electron only

# Building
npm run build                 # Build React app
npm run start                 # Build and start Electron
npm run prod                  # Production build and start

# Distribution
npm run dist:mac             # Build macOS app
npm run dist:win             # Build Windows app
npm run dist:linux           # Build Linux app

# Code Quality
npm run lint                 # Lint code
```

#### Python Backend

```bash
# Install dependencies
pip install -r requirements.txt

# Run utilities
python extract_contacts.py
python validate_number.py
python parse_manual_numbers.py
```

### Development Guidelines

1. **Code Style**: Follow ESLint configuration for JavaScript/React
2. **Component Structure**: Use functional components with hooks
3. **State Management**: Use React useState and useEffect
4. **Error Handling**: Implement proper error boundaries
5. **Security**: Never expose sensitive data in renderer process

## Security Features

- **Context Isolation**: Renderer process isolated from Node.js
- **Secure IPC**: All inter-process communication is secured
- **OAuth2 Authentication**: Secure Google API authentication
- **Encrypted Storage**: Sensitive data encrypted at rest
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: Built-in protection against spam detection

## Building for Production

### Electron App

```bash
# Build for all platforms
npm run dist:mac    # macOS (ARM64)
npm run dist:win    # Windows (x64)
npm run dist:linux  # Linux (x64)
```

Built applications will be in the `electron/dist/` directory.

### Python Backend

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run utilities
python app.py
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a pull request

### Contribution Guidelines

- Follow existing code style and patterns
- Add tests for new features
- Update documentation for API changes
- Ensure cross-platform compatibility
- Test thoroughly before submitting

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Important Notes

### Legal Compliance

- **WhatsApp Terms**: Ensure compliance with WhatsApp's Terms of Service
- **Email Regulations**: Follow CAN-SPAM Act and GDPR requirements
- **Rate Limits**: Respect provider limits and rate restrictions
- **Consent**: Only send messages to contacts who have opted in

### Usage Limits

- **Gmail**: 500 emails/day for free accounts
- **WhatsApp**: Respect daily sending limits
- **SMTP**: Follow your provider's sending limits

### Best Practices

- Use appropriate delays between messages
- Monitor delivery rates and bounce rates
- Keep contact lists clean and updated
- Test with small batches first
- Maintain proper authentication credentials

## Troubleshooting

### Common Issues

1. **WhatsApp QR Code Not Loading**

   - Check internet connection
   - Restart the application
   - Clear browser cache

2. **Gmail Authentication Failed**

   - Verify OAuth2 credentials
   - Check Google Cloud Console settings
   - Ensure Gmail API is enabled

3. **SMTP Connection Issues**

   - Verify server settings
   - Check firewall settings
   - Use correct port and security settings

4. **Contact Import Errors**
   - Check file format compatibility
   - Verify file encoding (UTF-8)
   - Ensure proper column headers

### Support

For issues and questions:

1. Check the troubleshooting section
2. Review existing GitHub issues
3. Create a new issue with detailed information
4. Include system information and error logs

## Updates and Maintenance

- Regular updates for security patches
- WhatsApp Web.js library updates
- Google API changes compatibility
- Cross-platform compatibility maintenance
- Performance optimizations
