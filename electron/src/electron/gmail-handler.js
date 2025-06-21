import 'dotenv/config';
import { google } from 'googleapis';
import Store from 'electron-store';
import { BrowserWindow } from 'electron';

const store = new Store();

// Gmail OAuth2 configuration
const GMAIL_SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
const REDIRECT_URI = 'http://localhost:3000/oauth/callback';

let oauth2Client = null;

export async function handleGmailAuth() {
    try {
        console.log('Starting Gmail authentication...');
        
        // Check for credentials
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
            console.error('Missing environment variables:', {
                hasClientId: !!process.env.GOOGLE_CLIENT_ID,
                hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET
            });
            return {
                success: false,
                error: 'Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in environment.'
            };
        }

        console.log('Creating OAuth2 client...');
        oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            REDIRECT_URI
        );

        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: GMAIL_SCOPES,
            prompt: 'consent' // Force consent screen to get refresh token
        });

        console.log('Generated auth URL:', authUrl);

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

            const timeout = setTimeout(() => {
                if (!hasResolved) {
                    hasResolved = true;
                    authWindow.close();
                    resolve({ success: false, error: 'Authentication timeout. Please try again.' });
                }
            }, 300000); // 5 minutes timeout

            authWindow.webContents.on('will-redirect', (event, url) => {
                console.log('Redirect detected:', url);
                
                if (url.startsWith(REDIRECT_URI)) {
                    clearTimeout(timeout);
                    
                    if (!hasResolved) {
                        hasResolved = true;
                        
                        const urlParams = new URL(url);
                        const code = urlParams.searchParams.get('code');
                        const error = urlParams.searchParams.get('error');

                        if (error) {
                            console.error('OAuth error:', error);
                            authWindow.close();
                            resolve({ success: false, error: `OAuth error: ${error}` });
                            return;
                        }

                        if (code) {
                            console.log('Got authorization code, exchanging for token...');
                            oauth2Client.getToken(code, (err, token) => {
                                if (err) {
                                    console.error('Token exchange error:', err);
                                    authWindow.close();
                                    resolve({ success: false, error: err.message });
                                } else {
                                    console.log('Token received successfully');
                                    oauth2Client.setCredentials(token);
                                    store.set('gmail_token', token);
                                    authWindow.close();
                                    resolve({ success: true });
                                }
                            });
                        } else {
                            console.error('No authorization code received');
                            authWindow.close();
                            resolve({ success: false, error: 'No authorization code received from Google.' });
                        }
                    }
                }
            });

            authWindow.on('closed', () => {
                if (!hasResolved) {
                    hasResolved = true;
                    clearTimeout(timeout);
                    resolve({ success: false, error: 'Authentication window was closed.' });
                }
            });
        });
    } catch (error) {
        console.error('Gmail auth error:', error);
        return { success: false, error: error.message };
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
            oauth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
                REDIRECT_URI
            );
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
