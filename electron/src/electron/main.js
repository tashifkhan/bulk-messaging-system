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
            enableRemoteModule: false,
            webSecurity: true,
            preload: path.join(__dirname, 'preload.js')
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
        
        // Add error handling for failed resource loads
        mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
            console.error('Failed to load:', validatedURL, 'Error:', errorDescription);
        });
    }
}

app.whenReady().then(() => {
    // Clean up WhatsApp files on startup for fresh session
    deleteWhatsAppFiles();
    
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    // Clean up WhatsApp files when app is closing
    if (whatsappClient) {
        try {
            // Attempt to logout from WhatsApp before closing
            whatsappClient.logout().catch(err => {
                console.error('Error during logout on close:', err);
            });
        } catch (error) {
            console.error('Error attempting logout on close:', error);
        }
        whatsappClient = null;
    }
    deleteWhatsAppFiles();
    
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    // Additional cleanup before app quits
    if (whatsappClient) {
        try {
            // Attempt to logout from WhatsApp before quitting
            whatsappClient.logout().catch(err => {
                console.error('Error during logout on quit:', err);
            });
        } catch (error) {
            console.error('Error attempting logout on quit:', error);
        }
        whatsappClient = null;
    }
    deleteWhatsAppFiles();
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

    // Send initializing status immediately
    mainWindow.webContents.send('whatsapp-status', 'Initializing WhatsApp client...');

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
        mainWindow.webContents.send('whatsapp-status', 'Scan QR code to authenticate');
        // Convert QR string to data URL using QRCode library
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
        // Clear QR code when ready
        mainWindow.webContents.send('whatsapp-qr', null);
    });

    whatsappClient.on('authenticated', () => {
        mainWindow.webContents.send('whatsapp-status', 'Authenticated!');
        // Clear QR code when authenticated
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

// Read email list file content
ipcMain.handle('read-email-list-file', async (event, filePath) => {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        // Determine file type and parse accordingly
        if (filePath.endsWith('.csv')) {
            // Parse CSV file
            return new Promise((resolve, reject) => {
                const emails = [];
                fs.createReadStream(filePath)
                    .pipe(csv())
                    .on('data', (row) => {
                        // Look for common email column names
                        const email = row.email || row.Email || row.EMAIL || 
                                     row.address || row.Address || row.ADDRESS ||
                                     Object.values(row)[0]; // fallback to first column
                        if (email && email.includes('@')) {
                            emails.push(email.trim());
                        }
                    })
                    .on('end', () => {
                        resolve(emails.join('\n'));
                    })
                    .on('error', (error) => {
                        reject(error);
                    });
            });
        } else {
            // For text files, split by lines and filter valid emails
            const lines = fileContent.split('\n');
            const emails = lines
                .map(line => line.trim())
                .filter(line => line && line.includes('@'));
            return emails.join('\n');
        }
    } catch (error) {
        console.error('Error reading email list file:', error);
        throw error;
    }
});

// Helper function to delete WhatsApp cache and auth files
const deleteWhatsAppFiles = () => {
    try {
        const cacheDir = path.join(__dirname, '../../.wwebjs_cache');
        const authDir = path.join(__dirname, '../../.wwebjs_auth');
        
        // Delete cache directory
        if (fs.existsSync(cacheDir)) {
            fs.rmSync(cacheDir, { recursive: true, force: true });
            console.log('Deleted .wwebjs_cache directory');
        }
        
        // Delete auth directory
        if (fs.existsSync(authDir)) {
            fs.rmSync(authDir, { recursive: true, force: true });
            console.log('Deleted .wwebjs_auth directory');
        }
    } catch (error) {
        console.error('Error deleting WhatsApp files:', error);
    }
};

// IPC handlers for WhatsApp logout
ipcMain.handle('whatsapp-logout', async () => {
    if (whatsappClient) {
        try {
            await whatsappClient.logout();
            whatsappClient = null;
            
            // Delete cache and auth files after logout
            deleteWhatsAppFiles();
            
            mainWindow.webContents.send('whatsapp-status', 'Disconnected');
            mainWindow.webContents.send('whatsapp-qr', null);
            return { success: true, message: 'Successfully logged out from WhatsApp and cleared cache' };
        } catch (error) {
            console.error('Error logging out from WhatsApp:', error);
            whatsappClient = null; // Force cleanup even if logout fails
            
            // Delete cache and auth files even if logout fails
            deleteWhatsAppFiles();
            
            mainWindow.webContents.send('whatsapp-status', 'Disconnected (forced)');
            mainWindow.webContents.send('whatsapp-qr', null);
            return { success: false, message: `Logout error: ${error.message}` };
        }
    } else {
        // If no active session, still clean up any leftover files
        deleteWhatsAppFiles();
        return { success: true, message: 'No active WhatsApp session to logout from (cleaned up files)' };
    }
});