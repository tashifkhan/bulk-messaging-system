import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    // Gmail methods
    authenticateGmail: () => ipcRenderer.invoke('gmail-auth'),
    getGmailToken: () => ipcRenderer.invoke('gmail-token'),
    sendEmail: (emailData) => ipcRenderer.invoke('send-email', emailData),
    
    // SMTP methods
    sendSMTPEmail: (smtpData) => ipcRenderer.invoke('smtp-send', smtpData),
    
    // File operations
    importEmailList: () => ipcRenderer.invoke('import-email-list'),
    
    // Progress tracking
    onProgress: (callback) => {
        ipcRenderer.on('email-progress', callback);
        return () => ipcRenderer.removeListener('email-progress', callback);
    }
});
