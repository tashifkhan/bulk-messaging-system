import { app, BrowserWindow, ipcMain, dialog } from "electron"
import path from "path"
import { fileURLToPath } from 'url'
import { isDev } from "./utils.js"
import { handleGmailAuth, handleSendEmail, handleGmailToken } from "./gmail-handler.js"
import { handleSMTPSend } from "./smtp-handler.js"
import pkg from 'whatsapp-web.js'
const { Client, LocalAuth } = pkg
import qrcode from 'qrcode-terminal'
import fs from 'fs'
import csv from 'csv-parser'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let whatsappClient;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, '../../desktopIcon.icns')
    });

    if (isDev()) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../../dist-react/index.html'));
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC handlers for Gmail
ipcMain.handle('gmail-auth', handleGmailAuth);
ipcMain.handle('gmail-token', handleGmailToken);
ipcMain.handle('send-email', handleSendEmail);

// IPC handlers for SMTP
ipcMain.handle('smtp-send', handleSMTPSend);

// IPC handlers for WhatsApp
ipcMain.handle('whatsapp-start-client', async () => {
    if (whatsappClient) {
        mainWindow.webContents.send('whatsapp-status', 'Client already running.');
        return;
    }

    whatsappClient = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu'
            ],
        },
    });

    whatsappClient.on('qr', (qr) => {
        mainWindow.webContents.send('whatsapp-qr', qr);
    });

    whatsappClient.on('ready', () => {
        mainWindow.webContents.send('whatsapp-status', 'Client is ready!');
    });

    whatsappClient.on('authenticated', () => {
        mainWindow.webContents.send('whatsapp-status', 'Authenticated!');
    });

    whatsappClient.on('auth_failure', (msg) => {
        mainWindow.webContents.send('whatsapp-status', 'Authentication failed: ' + msg);
    });

    whatsappClient.on('disconnected', (reason) => {
        mainWindow.webContents.send('whatsapp-status', 'Client disconnected: ' + reason);
        whatsappClient = null;
    });

    try {
        await whatsappClient.initialize();
        mainWindow.webContents.send('whatsapp-status', 'WhatsApp client initializing...');
    } catch (error) {
        mainWindow.webContents.send('whatsapp-status', 'Failed to initialize client: ' + error.message);
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
        const personalizedMessage = messageText.replace('{{name}}', contact.name || 'Friend');
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
    const { filePaths } = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
            { name: 'Text Files', extensions: ['txt', 'csv'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    if (filePaths && filePaths.length > 0) {
        const filePath = filePaths[0];
        const ext = path.extname(filePath).toLowerCase();
        const contacts = [];
        try {
            if (ext === '.csv') {
                return new Promise((resolve, reject) => {
                    fs.createReadStream(filePath)
                        .pipe(csv())
                        .on('data', (row) => {
                            if (row.number) {
                                contacts.push({ number: row.number.trim(), name: row.name ? row.name.trim() : null });
                            }
                        })
                        .on('end', () => {
                            resolve(contacts);
                        })
                        .on('error', (error) => {
                            reject(error);
                        });
                });
            } else if (ext === '.txt') {
                const data = fs.readFileSync(filePath, 'utf-8');
                data.split(/\r?\n/).forEach(line => {
                    line = line.trim();
                    if (line) {
                        const parts = line.split(',');
                        contacts.push({ number: parts[0].trim(), name: parts[1] ? parts[1].trim() : null });
                    }
                });
                return contacts;
            } else {
                throw new Error('Unsupported file type');
            }
        } catch (error) {
            return [];
        }
    }
    return null;
});

// File dialog for importing email lists
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