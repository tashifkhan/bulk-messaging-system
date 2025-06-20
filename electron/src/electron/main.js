import { app, BrowserWindow, ipcMain, dialog } from "electron"
import path from "path"
import { fileURLToPath } from 'url'
import { isDev } from "./utils.js"
import { handleGmailAuth, handleSendEmail, handleGmailToken } from "./gmail-handler.js"
import { handleSMTPSend } from "./smtp-handler.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

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