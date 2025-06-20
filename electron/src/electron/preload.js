const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Gmail methods
    authenticateGmail: () => ipcRenderer.invoke('gmail-auth'),
    getGmailToken: () => ipcRenderer.invoke('gmail-token'),
    sendEmail: (emailData) => ipcRenderer.invoke('send-email', emailData),
    
    // SMTP methods
    sendSMTPEmail: (smtpData) => ipcRenderer.invoke('smtp-send', smtpData),
    
    // File operations
    importEmailList: () => ipcRenderer.invoke('import-email-list'),
    readEmailListFile: (filePath) => ipcRenderer.invoke('read-email-list-file', filePath),
    
    // Progress tracking
    onProgress: (callback) => {
        ipcRenderer.on('email-progress', callback);
        return () => ipcRenderer.removeListener('email-progress', callback);
    },

    // WhatsApp methods
    startWhatsAppClient: () => ipcRenderer.invoke('whatsapp-start-client'),
    sendWhatsAppMessages: (data) => ipcRenderer.invoke('whatsapp-send-messages', data),
    importWhatsAppContacts: () => ipcRenderer.invoke('whatsapp-import-contacts'),
    onWhatsAppStatus: (callback) => {
        ipcRenderer.on('whatsapp-status', callback);
        return () => ipcRenderer.removeListener('whatsapp-status', callback);
    },
    onWhatsAppQR: (callback) => {
        ipcRenderer.on('whatsapp-qr', callback);
        return () => ipcRenderer.removeListener('whatsapp-qr', callback);
    },
    onWhatsAppSendStatus: (callback) => {
        ipcRenderer.on('whatsapp-send-status', callback);
        return () => ipcRenderer.removeListener('whatsapp-send-status', callback);
    }
});
