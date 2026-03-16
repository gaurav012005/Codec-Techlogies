const nodemailer = require('nodemailer');

let _transporter = null;
let _testAccount = null;

/**
 * Get or create a Nodemailer transporter.
 * - If SMTP env vars are set, uses them (Gmail, etc.)
 * - Otherwise creates an Ethereal test account (emails visible at https://ethereal.email)
 */
async function getTransporter() {
    if (_transporter) return _transporter;

    // Use configured SMTP if available
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        _transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        console.log(`📧 Email: Using SMTP server ${process.env.SMTP_HOST}`);
        return _transporter;
    }

    // Use Gmail if env vars set
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        _transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });
        console.log(`📧 Email: Using Gmail (${process.env.GMAIL_USER})`);
        return _transporter;
    }

    // Fallback: Ethereal test account (free, no setup required)
    _testAccount = await nodemailer.createTestAccount();
    _transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: _testAccount.user,
            pass: _testAccount.pass,
        },
    });
    console.log(`📧 Email: Using Ethereal test account (${_testAccount.user})`);
    console.log(`   Preview emails at: https://ethereal.email/messages`);
    return _transporter;
}

/**
 * Send an email.
 * @param {Object} opts - { to, subject, body, from }
 * @returns {Object} - { messageId, previewUrl }
 */
async function sendEmail({ to, subject, body, from }) {
    const transporter = await getTransporter();

    const fromAddress = from || process.env.EMAIL_FROM || _testAccount?.user || 'HireAI <noreply@hireai.com>';

    const info = await transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        text: body,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #6c5ce7, #00cec9); padding: 2px; border-radius: 8px;">
                    <div style="background: #fff; border-radius: 7px; padding: 24px;">
                        <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #eee;">
                            <span style="font-size: 24px;">⚡</span>
                            <strong style="font-size: 18px; color: #6c5ce7;"> HireAI</strong>
                        </div>
                        <div style="white-space: pre-wrap; line-height: 1.7; color: #333; font-size: 15px;">${body.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
                        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
                            Sent via HireAI Recruitment Platform
                        </div>
                    </div>
                </div>
            </div>
        `,
    });

    let previewUrl = null;
    if (_testAccount) {
        previewUrl = nodemailer.getTestMessageUrl(info);
        console.log(`📧 Email sent! Preview: ${previewUrl}`);
    }

    return {
        messageId: info.messageId,
        previewUrl,
        accepted: info.accepted,
        rejected: info.rejected,
    };
}

module.exports = { sendEmail };
