const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendPasswordResetEmail = async (email, resetToken) => {
    // Note: On the free plan, you can only send to the email you signed up with
    // or you must verify a domain.
    // For testing, we use 'onboarding@resend.dev' as the sender.

    // Construct the Deep Link for the app
    const resetUrl = `wth://reset-password?token=${resetToken}`;

    try {
        const data = await resend.emails.send({
            from: 'WTH Support <onboarding@resend.dev>',
            to: [email],
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
        });

        console.log('✅ Resend Email Id:', data.id);
        return { success: true, messageId: data.id };
    } catch (error) {
        console.error('❌ Resend API Error:', error);
        throw error;
    }
};

// No "verifyConfig" needed for HTTP API as it doesn't maintain a connection
const verifyConfig = async () => {
    if (!process.env.RESEND_API_KEY) {
        console.error('❌ Resend API Key is missing!');
    } else {
        console.log('✅ Resend Service: API Key present');
    }
};

module.exports = {
    sendPasswordResetEmail,
    verifyConfig
};
