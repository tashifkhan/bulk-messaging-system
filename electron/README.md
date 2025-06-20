# 📧 Bulk Email Sender

A professional Electron-based desktop application for sending bulk emails using Gmail API or SMTP. Perfect for marketing campaigns, newsletters, and mass communications.

## ✨ Features

- **Gmail API Integration**: Secure OAuth2 authentication with Google
- **SMTP Support**: Use any SMTP server (Gmail, Outlook, custom servers)
- **Bulk Email Sending**: Send personalized emails to multiple recipients
- **Progress Tracking**: Real-time progress monitoring with detailed status
- **Rate Limiting**: Configurable delays to avoid spam filters
- **Email Import**: Import recipient lists from text/CSV files
- **Modern UI**: Beautiful, responsive interface with dark/light themes
- **Secure Storage**: Encrypted credential storage
- **Cross-Platform**: Works on Windows, macOS, and Linux

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- Google Cloud Console account (for Gmail API)
- SMTP server credentials (if using SMTP method)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd electron
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
# Terminal 1: Start React dev server
npm run dev:react

# Terminal 2: Start Electron app
npm run dev:electron
```

## 🔧 Gmail API Setup

To use Gmail API functionality, you'll need to set up Google OAuth2 credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure OAuth consent screen
6. Create desktop application credentials
7. Download the credentials JSON file
8. Add your credentials to the app configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

## 📮 SMTP Configuration

For SMTP sending, you can use various providers:

### Gmail SMTP

- **Host**: smtp.gmail.com
- **Port**: 587 (TLS) or 465 (SSL)
- **Security**: Use App Password (not regular password)

### Outlook/Hotmail SMTP

- **Host**: smtp-mail.outlook.com
- **Port**: 587
- **Security**: TLS

### Custom SMTP

Configure with your server's specific settings.

## 📱 Usage

### Gmail Method

1. Click "Gmail API" tab
2. Authenticate with your Google account
3. Compose your email (subject, recipients, message)
4. Configure delay between emails
5. Click "Send Bulk Email"

### SMTP Method

1. Click "SMTP" tab
2. Enter your SMTP server configuration
3. Compose your email
4. Configure delay between emails
5. Click "Send Bulk Email"

### Email Recipients

- Enter one email address per line
- Import from text/CSV files
- Automatic email validation
- Real-time recipient count

### Rate Limiting

- Default: 1000ms (1 second) between emails
- Adjustable from 100ms to 10 seconds
- Helps avoid spam filters and rate limits

## 🔒 Security Features

- **No Plain Text Storage**: Passwords are never stored in plain text
- **Secure IPC**: All communication between processes is secured
- **Context Isolation**: Renderer process is isolated from Node.js
- **OAuth2**: Secure authentication with Google
- **Encrypted Storage**: Sensitive data is encrypted

## 📦 Building for Production

### Build React App

```bash
npm run build
```

### Build Electron Distributables

```bash
# macOS (ARM64)
npm run dist:mac

# Windows (x64)
npm run dist:win

# Linux (x64)
npm run dist:linux
```

Built applications will be in the `dist/` directory.

## 🛠️ Development

### Project Structure

```
src/
├── components/           # React components
│   ├── BulkMailer.jsx   # Main email interface
│   └── BulkMailer.css   # Component styles
├── electron/            # Electron main process
│   ├── main.js          # Main Electron entry point
│   ├── preload.js       # Secure IPC bridge
│   ├── gmail-handler.js # Gmail API integration
│   └── smtp-handler.js  # SMTP email sending
└── ui/                  # React UI
    ├── App.jsx          # Main React component
    ├── App.css          # App styles
    ├── index.css        # Global styles
    └── main.jsx         # React entry point
```

### Available Scripts

- `npm run dev:react` - Start React development server
- `npm run dev:electron` - Start Electron in development mode
- `npm run build` - Build React app for production
- `npm run dist:mac` - Build macOS app
- `npm run dist:win` - Build Windows app
- `npm run dist:linux` - Build Linux app
- `npm run lint` - Lint code

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Important Notes

- **Email Limits**: Respect provider limits (Gmail: 500/day for free accounts)
- **Spam Compliance**: Ensure compliance with CAN-SPAM Act and GDPR
- **Rate Limits**: Use appropriate delays to avoid being flagged as spam
- **Testing**: Always test with small batches first
- **Permissions**: Only send emails to consenting recipients

## 🐛 Troubleshooting

### Common Issues

**Gmail API not working**

- Ensure OAuth2 credentials are properly configured
- Check that Gmail API is enabled in Google Cloud Console
- Verify redirect URI matches configuration

**SMTP authentication failed**

- Use App Password for Gmail (not regular password)
- Check server settings (host, port, security)
- Verify credentials are correct

**Emails going to spam**

- Increase delay between emails
- Verify sender reputation
- Include unsubscribe links
- Use proper email formatting

## 📞 Support

For support and questions:

- Create an issue on GitHub
- Check the troubleshooting section
- Review Gmail/SMTP provider documentation

---

Built with ❤️ using Electron, React, and modern web technologies.
