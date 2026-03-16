const { sendEmail } = require('../services/emailService');

// POST /api/emails/send
const sendEmailController = async (req, res) => {
    try {
        const { to, subject, body, from } = req.body;

        if (!to || !subject || !body) {
            return res.status(400).json({ message: 'to, subject, and body are required.' });
        }

        const result = await sendEmail({ to, subject, body, from });

        res.json({
            success: true,
            messageId: result.messageId,
            previewUrl: result.previewUrl, // only set in dev/test mode
            accepted: result.accepted,
        });
    } catch (error) {
        console.error('Send email error:', error);
        res.status(500).json({ message: 'Failed to send email. ' + error.message });
    }
};

// POST /api/emails/send-template
const sendTemplateEmail = async (req, res) => {
    try {
        const { to, template, candidateName } = req.body;

        const templates = {
            'Interview Confirmation': {
                subject: 'Interview Confirmation — HireAI',
                body: `Dear ${candidateName || 'Candidate'},\n\nWe are pleased to confirm your upcoming interview. Please check your calendar for the scheduled time and join the meeting link provided.\n\nBest regards,\nHireAI Recruitment Team`,
            },
            'Offer Letter': {
                subject: 'Job Offer — HireAI',
                body: `Dear ${candidateName || 'Candidate'},\n\nWe are delighted to offer you the position with our team. Please review the attached offer details.\n\nBest regards,\nHireAI Recruitment Team`,
            },
            'Rejection (Kind)': {
                subject: 'Thank You for Applying — HireAI',
                body: `Dear ${candidateName || 'Candidate'},\n\nThank you for taking the time to interview with us. After careful consideration, we have decided to move forward with another candidate at this time.\n\nWe appreciate your interest and encourage you to apply for future openings.\n\nBest regards,\nHireAI Recruitment Team`,
            },
            'Follow-Up': {
                subject: 'Following Up On Your Application — HireAI',
                body: `Dear ${candidateName || 'Candidate'},\n\nWe wanted to follow up regarding your recent application. We are still reviewing candidates and will be in touch shortly.\n\nThank you for your patience!\n\nBest regards,\nHireAI Recruitment Team`,
            },
            'Onboarding Welcome': {
                subject: 'Welcome to the Team! — HireAI',
                body: `Dear ${candidateName || 'Candidate'},\n\nCongratulations and welcome! We are thrilled to have you join our team and look forward to working with you.\n\nYour onboarding details will be sent separately.\n\nBest regards,\nHireAI Recruitment Team`,
            },
        };

        const tmpl = templates[template];
        if (!tmpl) return res.status(400).json({ message: `Template "${template}" not found.` });

        const result = await sendEmail({ to, subject: tmpl.subject, body: tmpl.body });

        res.json({
            success: true,
            messageId: result.messageId,
            previewUrl: result.previewUrl,
        });
    } catch (error) {
        console.error('Template email error:', error);
        res.status(500).json({ message: 'Failed to send template email.' });
    }
};

module.exports = { sendEmailController, sendTemplateEmail };
