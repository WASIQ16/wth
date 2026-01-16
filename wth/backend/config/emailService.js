const nodemailer = require('nodemailer');

// Create transporter with Gmail
const createTransporter = () => {
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        },
        logger: true,
        debug: true,
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 10000,
        dnsTimeout: 5000,
        family: 4 // Force IPv4
    });
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
    const transporter = createTransporter();

    const resetUrl = `wth://reset-password?token=${resetToken}`;

    const mailOptions = {
        from: `"WTH Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset Request - WTH',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .container {
                        background-color: #f9f9f9;
                        border-radius: 10px;
                        padding: 30px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .header {
                        background-color: #253D2C;
                        color: white;
                        padding: 20px;
                        border-radius: 10px 10px 0 0;
                        text-align: center;
                    }
                    .content {
                        background-color: white;
                        padding: 30px;
                        border-radius: 0 0 10px 10px;
                    }
                    .button {
                        display: inline-block;
                        background-color: #68BA7F;
                        color: white;
                        padding: 12px 30px;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 20px 0;
                        font-weight: bold;
                    }
                    .token-box {
                        background-color: #f5f5f5;
                        border: 2px dashed #253D2C;
                        padding: 15px;
                        border-radius: 5px;
                        margin: 20px 0;
                        text-align: center;
                        font-family: monospace;
                        font-size: 16px;
                        word-break: break-all;
                    }
                    .footer {
                        margin-top: 30px;
                        text-align: center;
                        color: #666;
                        font-size: 12px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <p>Hello,</p>
                        <p>We received a request to reset your password for your WTH account. If you didn't make this request, you can safely ignore this email.</p>
                        
                        <p>To reset your password, use the following reset token in the app:</p>
                        
                        <div class="token-box">
                            ${resetToken}
                        </div>
                        
                        <p><strong>This token will expire in 1 hour.</strong></p>
                        
                        <p>Steps to reset your password:</p>
                        <ol>
                            <li>Open the WTH app</li>
                            <li>Go to the Reset Password screen</li>
                            <li>Enter the token above</li>
                            <li>Set your new password</li>
                        </ol>
                        
                        <div class="footer">
                            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
                            <p>&copy; 2026 WTH. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Password reset email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        throw error;
    }
};

// Verify connection configuration
const verifyConfig = async () => {
    const transporter = createTransporter();
    try {
        await transporter.verify();
        console.log('✅ Email Service: Connection to Gmail is successful!');
    } catch (error) {
        console.error('❌ Email Service: Connection failed:', error);
    }
};

module.exports = {
    sendPasswordResetEmail,
    verifyConfig
};
