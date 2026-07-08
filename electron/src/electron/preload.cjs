const { contextBridge, ipcRenderer } = require('electron');

function on(channel, callback) {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
}

contextBridge.exposeInMainWorld('electronAPI', {
    authenticateGmail: () => ipcRenderer.invoke('gmail-auth'),
    getGmailToken: () => ipcRenderer.invoke('gmail-token'),
    sendEmail: (emailData) => ipcRenderer.invoke('send-email', emailData),

    sendSMTPEmail: (smtpData) => ipcRenderer.invoke('smtp-send', smtpData),

    importEmailList: () => ipcRenderer.invoke('import-email-list'),
    readEmailListFile: (filePath) => ipcRenderer.invoke('read-email-list-file', filePath),

    onProgress: (callback) => on('email-progress', callback),

    startWhatsAppClient: () => ipcRenderer.invoke('whatsapp-start-client'),
    logoutWhatsApp: () => ipcRenderer.invoke('whatsapp-logout'),
    sendWhatsAppMessages: (data) => ipcRenderer.invoke('whatsapp-send-messages', data),
    importWhatsAppContacts: () => ipcRenderer.invoke('whatsapp-import-contacts'),
    onWhatsAppStatus: (callback) => on('whatsapp-status', callback),
    onWhatsAppQR: (callback) => on('whatsapp-qr', callback),
    onWhatsAppSendStatus: (callback) => on('whatsapp-send-status', callback),

    saveTemplate: (data) => ipcRenderer.invoke('template-save', data),
    listTemplates: () => ipcRenderer.invoke('template-list'),
    deleteTemplate: (name) => ipcRenderer.invoke('template-delete', name),
});
