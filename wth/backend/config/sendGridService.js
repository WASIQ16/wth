const sgMail = require('@sendgrid/mail');

// Set the API Key from environment variables
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
    console.error('❌ SENDGRID_API_KEY is missing in environment variables');
}

const sendPasswordResetEmail = async (email, resetToken) => {

    // Construct the Deep Link for the app if needed, or just display the token
    const resetUrl = `wth://reset-password?token=${resetToken}`;

    const msg = {
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL, // This must be a verified sender in SendGrid
        subject: 'Password Reset Request - WTH',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #253D2C; color: white; padding: 15px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; }
                    .token-box { background: #f4f4f4; padding: 15px; text-align: center; letter-spacing: 2px; font-family: monospace; font-size: 18px; margin: 20px 0; border: 1px dashed #253D2C; }
                    .footer { font-size: 12px; color: #666; text-align: center; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>🔐 Password Reset</h2>
                    </div>
                    <div class="content">
                        <p>Hello,</p>
                        <p>You requested a password reset for your WTH account.</p>
                        <p>Use the following token in the app:</p>
                        
                        <div class="token-box">
                            ${resetToken}
                        </div>
                        
                        <p>This token expires in 1 hour.</p>
                        <p>If you didn't request this, please ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 WTH App</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await sgMail.send(msg);
        console.log('✅ SendGrid Email Sent successfully to:', email);
        return { success: true };
    } catch (error) {
        console.error('❌ SendGrid API Error:', error);
        if (error.response) {
            console.error(error.response.body);
        }
        throw error;
    }
};

const verifyConfig = async () => {
    if (!process.env.SENDGRID_API_KEY) {
        console.error('❌ SENDGRID_API_KEY is missing!');
    } else {
        console.log('✅ SendGrid Service: API Key present');
    }

    if (!process.env.SENDGRID_FROM_EMAIL) {
        console.warn('⚠️  SENDGRID_FROM_EMAIL is missing! Email sending will fail if not set.');
    }
};

module.exports = {
    sendPasswordResetEmail,
    verifyConfig
};
