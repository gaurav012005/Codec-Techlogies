const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transporter = null;

const createTransporter = () => {
    try {
        if (process.env.SMTP_HOST) {
            transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT) || 587,
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
        } else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.GMAIL_USER,
                    pass: process.env.GMAIL_APP_PASSWORD,
                },
            });
        } else {
            // Use test account for development
            logger.warn('No email config found. Emails will be logged but not sent.');
            transporter = {
                sendMail: async (options) => {
                    logger.info(`[DEV EMAIL] To: ${options.to} | Subject: ${options.subject}`);
                    return { messageId: `dev-${Date.now()}`, accepted: [options.to] };
                },
            };
        }

        logger.info('Email transporter configured');
        return transporter;
    } catch (error) {
        logger.error(`Email config failed: ${error.message}`);
        return null;
    }
};

const getTransporter = () => {
    if (!transporter) createTransporter();
    return transporter;
};

// Inject tracking pixel into HTML body
const injectTrackingPixel = (html, trackingId, baseUrl) => {
    const pixelUrl = `${baseUrl}/api/emails/track/${trackingId}/open`;
    const pixel = `<img src="${pixelUrl}" width="1" height="1" style="display:none" alt="" />`;
    if (html.includes('</body>')) {
        return html.replace('</body>', `${pixel}</body>`);
    }
    return html + pixel;
};

// Replace tracking links in HTML
const injectClickTracking = (html, trackingId, baseUrl) => {
    const linkRegex = /href="(https?:\/\/[^"]+)"/g;
    return html.replace(linkRegex, (match, url) => {
        const trackUrl = `${baseUrl}/api/emails/track/${trackingId}/click?url=${encodeURIComponent(url)}`;
        return `href="${trackUrl}"`;
    });
};

// Substitute template variables
const substituteVariables = (text, variables = {}) => {
    return text.replace(/\{\{(\w+\.?\w*)\}\}/g, (match, key) => {
        const keys = key.split('.');
        let value = variables;
        for (const k of keys) {
            value = value?.[k];
            if (value === undefined) return match;
        }
        return value || match;
    });
};

module.exports = {
    createTransporter,
    getTransporter,
    injectTrackingPixel,
    injectClickTracking,
    substituteVariables,
};
