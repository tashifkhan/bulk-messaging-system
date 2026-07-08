/* global process */
import { app, BrowserWindow, ipcMain, dialog } from "electron"
import path from "path"
import { fileURLToPath } from 'url'
import { isDev } from "./utils.js"
import { handleGmailAuth, handleSendEmail, handleGmailToken } from "./gmail-handler.js"
import { handleSMTPSend } from "./smtp-handler.js"
import pkg from 'whatsapp-web.js'
const { Client, LocalAuth } = pkg
import QRCode from 'qrcode'
import fs from 'fs'
import Store from 'electron-store'
import {
    parseEmailsFromCsv,
    parseEmailsFromText,
    parseCsvHeaders,
} from '../shared/contact-parser.js'

const store = new Store();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let whatsappClient;

function getBrowserExecutablePath() {
    const explicitPath = process.env.PUPPETEER_EXECUTABLE_PATH;
    const candidatePaths = [
        explicitPath,
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
        '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
        '/Applications/Chromium.app/Contents/MacOS/Chromium',
        '/usr/bin/google-chrome-stable',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium',
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
    ].filter(Boolean);

    return candidatePaths.find((candidatePath) => fs.existsSync(candidatePath));
}

function formatWhatsAppStartupError(error) {
    const message = error?.message || 'Unknown startup error';

    if (message.includes('.cache/puppeteer') || message.includes('Chrome for Testing')) {
        return 'Could not start the browser. Install Google Chrome or Brave, or set PUPPETEER_EXECUTABLE_PATH to a Chromium-based browser.';
    }

    if (message.includes('Browser was not found')) {
        return 'No compatible browser found. Install Google Chrome or Brave and try again.';
    }

    return `Failed to initialize WhatsApp: ${message.split('\n')[0]}`;
}

async function disposeWhatsAppClient() {
    if (!whatsappClient) return;

    const client = whatsappClient;
    whatsappClient = null;

    try {
        await client.destroy();
    } catch (error) {
        console.error('Error destroying WhatsApp client:', error);
    }
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            webSecurity: true,
            preload: path.join(__dirname, 'preload.cjs')
        },
        icon: path.join(__dirname, '../../desktopIcon.icns')
    });

    if (isDev()) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        const distPath = path.join(__dirname, '../../dist-react/index.html');
        console.log('Loading from dist path:', distPath);
        console.log('Dist path exists:', fs.existsSync(distPath));
        
        mainWindow.loadFile(distPath).catch(err => {
            console.error('Failed to load dist file:', err);
        });
        
        mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
            console.error('Failed to load:', validatedURL, 'Error:', errorDescription);
        });
    }
}

app.whenReady().then(() => {
    deleteWhatsAppFiles();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    disposeWhatsAppClient();
    deleteWhatsAppFiles();
    
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    disposeWhatsAppClient();
    deleteWhatsAppFiles();
});

ipcMain.handle('gmail-auth', handleGmailAuth);
ipcMain.handle('gmail-token', handleGmailToken);
ipcMain.handle('send-email', handleSendEmail);
ipcMain.handle('smtp-send', handleSMTPSend);

ipcMain.handle('whatsapp-start-client', async () => {
    if (whatsappClient) {
        mainWindow.webContents.send('whatsapp-status', 'Client already running.');
        return;
    }

    mainWindow.webContents.send('whatsapp-status', 'Initializing WhatsApp client...');

    const browserExecutablePath = getBrowserExecutablePath();

    if (!browserExecutablePath) {
        mainWindow.webContents.send('whatsapp-status', 'No compatible browser found. Install Google Chrome or Brave and try again.');
        return { success: false, message: 'No compatible browser found' };
    }

    whatsappClient = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            executablePath: browserExecutablePath,
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ],
        },
    });

    whatsappClient.on('qr', (qr) => {
        mainWindow.webContents.send('whatsapp-status', 'Scan QR code to authenticate');
        QRCode.toDataURL(qr)
            .then(dataUrl => {
                mainWindow.webContents.send('whatsapp-qr', dataUrl);
            })
            .catch(err => {
                console.error('Error generating QR code:', err);
                mainWindow.webContents.send('whatsapp-status', 'Error generating QR code');
            });
    });

    whatsappClient.on('ready', () => {
        mainWindow.webContents.send('whatsapp-status', 'Client is ready!');
        mainWindow.webContents.send('whatsapp-qr', null);
    });

    whatsappClient.on('authenticated', () => {
        mainWindow.webContents.send('whatsapp-status', 'Authenticated!');
        mainWindow.webContents.send('whatsapp-qr', null);
    });

    whatsappClient.on('auth_failure', (msg) => {
        mainWindow.webContents.send('whatsapp-status', 'Authentication failed: ' + msg);
    });

    whatsappClient.on('disconnected', (reason) => {
        mainWindow.webContents.send('whatsapp-status', 'Client disconnected: ' + reason);
        whatsappClient = null;
    });

    try {
        mainWindow.webContents.send('whatsapp-status', 'Starting WhatsApp client...');
        await whatsappClient.initialize();
        return { success: true };
    } catch (error) {
        console.error('Failed to initialize WhatsApp client:', error);
        mainWindow.webContents.send('whatsapp-status', formatWhatsAppStartupError(error));
        whatsappClient = null;
        return { success: false, message: formatWhatsAppStartupError(error) };
    }
});

ipcMain.handle('whatsapp-send-messages', async (event, { contacts, messageText }) => {
    if (!whatsappClient || whatsappClient.info === undefined) {
        mainWindow.webContents.send('whatsapp-send-status', 'WhatsApp client not ready. Please scan QR first.');
        return { success: false, message: 'Client not ready' };
    }

    mainWindow.webContents.send('whatsapp-send-status', `Sending messages to ${contacts.length} contacts...`);
    let sentCount = 0;
    let failedCount = 0;

    for (const contact of contacts) {
        const number = contact.number;
        let personalizedMessage = messageText;
        personalizedMessage = personalizedMessage.replaceAll('{{name}}', contact.name || 'Friend');
        personalizedMessage = personalizedMessage.replaceAll('{{number}}', contact.number || '');
        personalizedMessage = personalizedMessage.replaceAll('{{email}}', contact.email || '');
        if (contact.fields) {
            for (const [key, value] of Object.entries(contact.fields)) {
                personalizedMessage = personalizedMessage.replaceAll(`{{${key}}}`, String(value || ''));
            }
        }

        const chatId = number.startsWith('+') ? `${number.substring(1)}@c.us` : `${number}@c.us`;

        try {
            const isRegistered = await whatsappClient.isRegisteredUser(chatId);
            if (isRegistered) {
                await whatsappClient.sendMessage(chatId, personalizedMessage);
                mainWindow.webContents.send('whatsapp-send-status', `Sent to ${number}`);
                sentCount++;
                await new Promise(resolve => setTimeout(resolve, 3000));
            } else {
                mainWindow.webContents.send('whatsapp-send-status', `Failed: ${number} not registered`);
                failedCount++;
            }
        } catch (error) {
            mainWindow.webContents.send('whatsapp-send-status', `Failed to send to ${number}: ${error.message}`);
            failedCount++;
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    mainWindow.webContents.send('whatsapp-send-status', `Mass messaging complete. Sent: ${sentCount}, Failed: ${failedCount}`);
    return { success: true, sent: sentCount, failed: failedCount };
});

ipcMain.handle('whatsapp-import-contacts', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
            { name: 'Contact Files', extensions: ['txt', 'csv'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });

    if (canceled || !filePaths?.length) {
        return { canceled: true };
    }

    const filePath = filePaths[0];
    const ext = path.extname(filePath).toLowerCase();

    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const fileName = path.basename(filePath);
        let headers = [];

        if (ext === '.csv') {
            headers = parseCsvHeaders(content);
            return { success: true, content, fileName, ext, headers };
        } else if (ext === '.txt') {
            return { success: true, content, fileName, ext, headers: [] };
        } else {
            return { success: false, error: 'Unsupported file type. Use .csv or .txt files.' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('import-email-list', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
            { name: 'Text Files', extensions: ['txt'] },
            { name: 'CSV Files', extensions: ['csv'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    
    return result;
});

ipcMain.handle('read-email-list-file', async (event, filePath) => {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        if (filePath.endsWith('.csv')) {
            return parseEmailsFromCsv(fileContent).join('\n');
        }

        return parseEmailsFromText(fileContent).join('\n');
    } catch (error) {
        console.error('Error reading email list file:', error);
        throw error;
    }
});

const deleteWhatsAppFiles = () => {
    try {
        const cacheDir = path.join(__dirname, '../../.wwebjs_cache');
        const authDir = path.join(__dirname, '../../.wwebjs_auth');
        
        if (fs.existsSync(cacheDir)) {
            fs.rmSync(cacheDir, { recursive: true, force: true });
            console.log('Deleted .wwebjs_cache directory');
        }
        
        if (fs.existsSync(authDir)) {
            fs.rmSync(authDir, { recursive: true, force: true });
            console.log('Deleted .wwebjs_auth directory');
        }
    } catch {
        console.error('Error deleting WhatsApp files');
    }
};

ipcMain.handle('whatsapp-logout', async () => {
    if (whatsappClient) {
        try {
            await whatsappClient.logout();
            whatsappClient = null;
            deleteWhatsAppFiles();
            mainWindow.webContents.send('whatsapp-status', 'Disconnected');
            mainWindow.webContents.send('whatsapp-qr', null);
            return { success: true, message: 'Successfully logged out from WhatsApp and cleared cache' };
        } catch (error) {
            console.error('Error logging out from WhatsApp:', error);
            whatsappClient = null;
            deleteWhatsAppFiles();
            mainWindow.webContents.send('whatsapp-status', 'Disconnected (forced)');
            mainWindow.webContents.send('whatsapp-qr', null);
            return { success: false, message: `Logout error: ${error.message}` };
        }
    } else {
        deleteWhatsAppFiles();
        return { success: true, message: 'No active WhatsApp session to logout from (cleaned up files)' };
    }
});

ipcMain.handle('template-save', async (event, data) => {
    try {
        const templates = store.get('templates', []);
        const idx = templates.findIndex((t) => t.name === data.name);
        if (idx >= 0) {
            templates[idx] = { ...templates[idx], ...data, updatedAt: Date.now() };
        } else {
            templates.push({ ...data, updatedAt: Date.now() });
        }
        store.set('templates', templates);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('template-list', async () => {
    try {
        const templates = store.get('templates', []);
        return { success: true, templates };
    } catch (error) {
        return { success: false, error: error.message, templates: [] };
    }
});

ipcMain.handle('template-delete', async (event, name) => {
    try {
        const templates = store.get('templates', []);
        store.set('templates', templates.filter((t) => t.name !== name));
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});
