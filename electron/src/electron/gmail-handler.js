/* global process, Buffer */
import 'dotenv/config';
import { google } from 'googleapis';
import Store from 'electron-store';
import { BrowserWindow } from 'electron';
import http from 'http';
import fs from 'fs';
import path from 'path';

const store = new Store();

// Gmail OAuth2 configuration
const GMAIL_SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
const DEFAULT_REDIRECT_URI = 'http://localhost:3000/oauth/callback';

let oauth2Client = null;

function getGoogleCredentials() {
    const credentialsPath = process.env.GOOGLE_CREDENTIALS_PATH || path.join(process.cwd(), 'google-credentials.json');
    let fileCredentials = null;

    if (fs.existsSync(credentialsPath)) {
        const parsed = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
        fileCredentials = parsed.installed || parsed.web || parsed;
    }

    const clientId = process.env.GOOGLE_CLIENT_ID || fileCredentials?.client_id;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || fileCredentials?.client_secret;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || DEFAULT_REDIRECT_URI;

    return { clientId, clientSecret, redirectUri };
}

function createOAuthClient() {
    const { clientId, clientSecret, redirectUri } = getGoogleCredentials();

    if (!clientId || !clientSecret) {
        throw new Error('Missing Google OAuth credentials. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, or add google-credentials.json in the electron folder.');
    }

    return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

function getFriendlyOAuthError(error) {
    const code = error?.code || error?.status;
    const apiError = error?.response?.data?.error;
    const apiDescription = error?.response?.data?.error_description;

    if (apiError === 'invalid_client' || String(error?.message || '').includes('invalid_client')) {
        return 'Google rejected the OAuth credentials. The GOOGLE_CLIENT_SECRET does not match GOOGLE_CLIENT_ID. Download a fresh OAuth Client JSON from Google Cloud Console and save it as electron/google-credentials.json, or update the values in electron/.env.';
    }

    if (apiError === 'redirect_uri_mismatch') {
        return 'Google rejected the redirect URI. Add http://localhost:3000/oauth/callback to the OAuth client redirect URIs, or set GOOGLE_REDIRECT_URI to the value configured in Google Cloud Console.';
    }

    if (apiDescription) return apiDescription;
    if (code) return `Google OAuth failed with status ${code}.`;
    return error?.message || 'Google OAuth failed.';
}

function startOAuthCallbackServer(redirectUri, onCallback) {
    const redirectUrl = new URL(redirectUri);

    if (!['localhost', '127.0.0.1'].includes(redirectUrl.hostname)) {
        return Promise.resolve(null);
    }

    return new Promise((resolve) => {
        const server = http.createServer((req, res) => {
            const requestUrl = new URL(req.url, redirectUri);

            if (requestUrl.pathname !== redirectUrl.pathname) {
                res.writeHead(404);
                res.end('Not found');
                return;
            }

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<html><body><h2>Authentication received.</h2><p>You can close this window and return to the app.</p></body></html>');
            onCallback(requestUrl);
        });

        server.once('error', () => resolve(null));
        server.listen(Number(redirectUrl.port || 80), redirectUrl.hostname, () => resolve(server));
    });
}

function safeCloseWindow(window) {
    if (window && !window.isDestroyed()) {
        window.close();
    }
}

export async function handleGmailAuth() {
    try {
        console.log('Starting Gmail authentication');
        const { redirectUri } = getGoogleCredentials();
        oauth2Client = createOAuthClient();

        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: GMAIL_SCOPES,
            prompt: 'consent' // Force consent screen to get refresh token
        });

        // Open auth URL in browser window
        const authWindow = new BrowserWindow({
            width: 800,
            height: 800,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true
            },
            show: false
        });

        authWindow.once('ready-to-show', () => {
            authWindow.show();
        });

        authWindow.loadURL(authUrl);

        return new Promise((resolve) => {
            let hasResolved = false;
            let callbackServer = null;
            let timeout = null;

            const finish = async (result) => {
                if (hasResolved) return;
                hasResolved = true;
                clearTimeout(timeout);

                if (callbackServer) {
                    callbackServer.close();
                }

                safeCloseWindow(authWindow);
                resolve(result);
            };

            const handleCallbackUrl = async (callbackUrl) => {
                const code = callbackUrl.searchParams.get('code');
                const error = callbackUrl.searchParams.get('error');

                if (error) {
                    await finish({ success: false, error: `Google OAuth error: ${error}` });
                    return;
                }

                if (!code) {
                    await finish({ success: false, error: 'No authorization code received from Google.' });
                    return;
                }

                try {
                    console.log('Google authorization code received; exchanging for token');
                    const { tokens } = await oauth2Client.getToken(code);
                    oauth2Client.setCredentials(tokens);
                    store.set('gmail_token', tokens);
                    await finish({ success: true });
                } catch (tokenError) {
                    console.error('Google token exchange failed:', getFriendlyOAuthError(tokenError));
                    await finish({ success: false, error: getFriendlyOAuthError(tokenError) });
                }
            };

            timeout = setTimeout(() => {
                finish({ success: false, error: 'Authentication timeout. Please try again.' });
            }, 300000); // 5 minutes timeout

            startOAuthCallbackServer(redirectUri, handleCallbackUrl).then((server) => {
                callbackServer = server;
            });

            authWindow.webContents.on('will-redirect', (event, url) => {
                const redirectTarget = new URL(url);
                console.log('Google OAuth redirect:', `${redirectTarget.origin}${redirectTarget.pathname}`);

                if (url.startsWith(redirectUri)) {
                    event.preventDefault();
                    handleCallbackUrl(redirectTarget);
                }
            });

            authWindow.on('closed', () => {
                finish({ success: false, error: 'Authentication window was closed.' });
            });
        });
    } catch (error) {
        console.error('Gmail auth error:', getFriendlyOAuthError(error));
        return { success: false, error: getFriendlyOAuthError(error) };
    }
}

export async function handleGmailToken() {
    try {
        const token = store.get('gmail_token');
        return { success: !!token, hasToken: !!token };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function handleSendEmail(event, emailData) {
    try {
        const { recipients, subject, message, delay = 1000 } = emailData;
        const token = store.get('gmail_token');
        
        if (!token) {
            return { success: false, error: 'Not authenticated with Gmail' };
        }

        // Set up OAuth2 client with stored token
        if (!oauth2Client) {
            oauth2Client = createOAuthClient();
        }
        oauth2Client.setCredentials(token);

        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
        const results = [];
        
        for (let i = 0; i < recipients.length; i++) {
            const recipient = recipients[i];
            
            // Send progress update
            event.sender.send('email-progress', {
                current: i + 1,
                total: recipients.length,
                recipient: recipient,
                status: 'sending'
            });
            
            try {
                const email = createEmail(recipient, subject, message);
                await gmail.users.messages.send({ 
                    userId: 'me', 
                    requestBody: { raw: email } 
                });
                
                results.push({ recipient, status: 'sent' });
                
                event.sender.send('email-progress', {
                    current: i + 1,
                    total: recipients.length,
                    recipient: recipient,
                    status: 'sent'
                });
                
                // Rate limiting delay
                if (i < recipients.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
                
            } catch (error) {
                console.error(`Failed to send email to ${recipient}:`, error);
                results.push({ recipient, status: 'failed', error: error.message });
                
                event.sender.send('email-progress', {
                    current: i + 1,
                    total: recipients.length,
                    recipient: recipient,
                    status: 'failed',
                    error: error.message
                });
            }
        }
        
        return { success: true, results };
    } catch (error) {
        console.error('Gmail send error:', error);
        return { success: false, error: error.message };
    }
}

function createEmail(to, subject, message) {
    const email = [
        `To: ${to}`,
        `Subject: ${subject}`,
        `Content-Type: text/html; charset=utf-8`,
        '',
        message
    ].join('\r\n');
    
    return Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
}
