import nodemailer from 'nodemailer';
import Store from 'electron-store';

const store = new Store();

export async function handleSMTPSend(event, smtpData) {
    try {
        const { 
            smtpConfig, 
            recipients, 
            subject, 
            message, 
            delay = 1000,
            saveCredentials = false 
        } = smtpData;
        
        // Validate SMTP configuration
        if (!smtpConfig.host || !smtpConfig.port || !smtpConfig.user || !smtpConfig.pass) {
            return { success: false, error: 'Incomplete SMTP configuration' };
        }
        
        // Save credentials if requested (encrypted storage)
        if (saveCredentials) {
            store.set('smtp_config', {
                host: smtpConfig.host,
                port: smtpConfig.port,
                secure: smtpConfig.secure,
                user: smtpConfig.user
                // Note: We don't save the password for security
            });
        }
        
        // Create transporter
        const transporter = nodemailer.createTransporter({
            host: smtpConfig.host,
            port: smtpConfig.port,
            secure: smtpConfig.secure, // true for 465, false for other ports
            auth: {
                user: smtpConfig.user,
                pass: smtpConfig.pass,
            },
            tls: {
                rejectUnauthorized: false // For self-signed certificates
            }
        });
        
        // Verify connection
        await transporter.verify();
        
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
                const mailOptions = {
                    from: smtpConfig.user,
                    to: recipient,
                    subject: subject,
                    html: message, // Support HTML content
                    text: message.replace(/<[^>]*>/g, '') // Strip HTML for text version
                };
                
                await transporter.sendMail(mailOptions);
                
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
        return { success: false, error: error.message };
    }
}

export function getSavedSMTPConfig() {
    return store.get('smtp_config', {});
}
