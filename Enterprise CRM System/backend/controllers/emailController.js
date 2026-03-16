const Email = require('../models/Email');
const EmailTemplate = require('../models/EmailTemplate');
const Contact = require('../models/Contact');
const Activity = require('../models/Activity');
const { getTransporter, injectTrackingPixel, injectClickTracking, substituteVariables } = require('../config/email');
const logger = require('../utils/logger');
const crypto = require('crypto');

// ─── Send Email ─────────────────────────────────────
exports.sendEmail = async (req, res, next) => {
    try {
        const { to, subject, body, bodyHtml, contactId, dealId, templateId } = req.body;
        if (!to || !subject || !body) {
            return res.status(400).json({ success: false, message: 'to, subject, and body are required' });
        }

        const trackingId = crypto.randomUUID();
        const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

        let html = bodyHtml || `<div style="font-family:sans-serif">${body.replace(/\n/g, '<br>')}</div>`;
        html = injectTrackingPixel(html, trackingId, baseUrl);
        html = injectClickTracking(html, trackingId, baseUrl);

        const transporter = getTransporter();
        const result = await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.GMAIL_USER || `"CRM" <noreply@crm.com>`,
            to,
            subject,
            text: body,
            html,
        });

        const email = await Email.create({
            from: process.env.SMTP_FROM || process.env.GMAIL_USER || 'noreply@crm.com',
            to, subject, body, bodyHtml: html,
            contactId, dealId, templateId,
            trackingId,
            status: 'sent',
            sentAt: new Date(),
            userId: req.user.id,
            organizationId: req.organizationId,
            threadId: contactId ? `thread-${contactId}` : '',
        });

        // Log activity
        if (contactId) {
            await Activity.create({
                type: 'email', title: `Email sent: "${subject}"`,
                relatedTo: contactId, relatedModel: 'Contact',
                userId: req.user.id, organizationId: req.organizationId,
                metadata: { emailId: email._id, to, subject },
            });
        }

        // Increment template usage
        if (templateId) {
            await EmailTemplate.findByIdAndUpdate(templateId, { $inc: { usageCount: 1 } });
        }

        logger.info(`Email sent to ${to}: ${subject}`);
        res.status(201).json({ success: true, data: email });
    } catch (error) { next(error); }
};

// ─── Schedule Email ─────────────────────────────────────
exports.scheduleEmail = async (req, res, next) => {
    try {
        const { to, subject, body, bodyHtml, contactId, dealId, templateId, scheduledAt } = req.body;
        if (!to || !subject || !body || !scheduledAt) {
            return res.status(400).json({ success: false, message: 'to, subject, body, and scheduledAt are required' });
        }

        const trackingId = crypto.randomUUID();
        const email = await Email.create({
            from: process.env.SMTP_FROM || 'noreply@crm.com',
            to, subject, body, bodyHtml: bodyHtml || '',
            contactId, dealId, templateId,
            trackingId,
            status: 'scheduled',
            scheduledAt: new Date(scheduledAt),
            userId: req.user.id,
            organizationId: req.organizationId,
            threadId: contactId ? `thread-${contactId}` : '',
        });

        res.status(201).json({ success: true, data: email, message: `Scheduled for ${scheduledAt}` });
    } catch (error) { next(error); }
};

// ─── Get Email Threads ─────────────────────────────────────
exports.getThreads = async (req, res, next) => {
    try {
        const { contactId } = req.params;
        const emails = await Email.find({
            organizationId: req.organizationId,
            contactId,
        })
            .sort({ createdAt: -1 })
            .populate('userId', 'name avatar')
            .limit(50);

        res.json({ success: true, data: emails });
    } catch (error) { next(error); }
};

// ─── Get All Emails ─────────────────────────────────────
exports.getEmails = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const filter = { organizationId: req.organizationId, userId: req.user.id };
        if (status) filter.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [emails, total] = await Promise.all([
            Email.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit))
                .populate('contactId', 'name email'),
            Email.countDocuments(filter),
        ]);

        res.json({ success: true, data: { emails, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } } });
    } catch (error) { next(error); }
};

// ─── Template CRUD ─────────────────────────────────────
exports.getTemplates = async (req, res, next) => {
    try {
        const { category } = req.query;
        const filter = { organizationId: req.organizationId };
        if (category) filter.category = category;

        const templates = await EmailTemplate.find(filter).sort({ usageCount: -1 });
        res.json({ success: true, data: templates });
    } catch (error) { next(error); }
};

exports.createTemplate = async (req, res, next) => {
    try {
        const { name, subject, body, bodyHtml, category, variables } = req.body;
        if (!name || !subject || !body) {
            return res.status(400).json({ success: false, message: 'name, subject, and body are required' });
        }

        const template = await EmailTemplate.create({
            name, subject, body, bodyHtml, category, variables,
            createdBy: req.user.id,
            organizationId: req.organizationId,
        });

        res.status(201).json({ success: true, data: template });
    } catch (error) { next(error); }
};

exports.updateTemplate = async (req, res, next) => {
    try {
        const template = await EmailTemplate.findOneAndUpdate(
            { _id: req.params.id, organizationId: req.organizationId },
            req.body,
            { new: true, runValidators: true }
        );
        if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
        res.json({ success: true, data: template });
    } catch (error) { next(error); }
};

exports.deleteTemplate = async (req, res, next) => {
    try {
        const template = await EmailTemplate.findOneAndDelete({ _id: req.params.id, organizationId: req.organizationId });
        if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
        res.json({ success: true, message: 'Template deleted' });
    } catch (error) { next(error); }
};

// ─── Tracking Endpoints ─────────────────────────────────────
exports.trackOpen = async (req, res, next) => {
    try {
        const email = await Email.findOneAndUpdate(
            { trackingId: req.params.trackingId },
            { $set: { openedAt: new Date() }, $inc: { openCount: 1 } }
        );
        // Return 1x1 transparent pixel
        const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
        res.set({ 'Content-Type': 'image/gif', 'Cache-Control': 'no-cache' });
        res.end(pixel);
    } catch (error) {
        res.status(200).end();
    }
};

exports.trackClick = async (req, res, next) => {
    try {
        await Email.findOneAndUpdate(
            { trackingId: req.params.trackingId },
            { $set: { clickedAt: new Date() }, $inc: { clickCount: 1 } }
        );
        const { url } = req.query;
        if (url) return res.redirect(url);
        res.status(200).json({ success: true });
    } catch (error) {
        const { url } = req.query;
        if (url) return res.redirect(url);
        res.status(200).end();
    }
};
