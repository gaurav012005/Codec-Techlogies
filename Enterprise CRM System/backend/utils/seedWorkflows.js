const Workflow = require('../models/Workflow');
const logger = require('./logger');

/**
 * Seed example workflows for a new organization
 */
const seedWorkflows = async (organizationId, createdBy) => {
    try {
        const existing = await Workflow.countDocuments({ organizationId });
        if (existing > 0) return; // Already has workflows

        const workflows = [
            {
                name: 'New Lead Nurture Sequence',
                description: 'Automatically nurture new leads with follow-up tasks',
                isActive: false,
                trigger: {
                    type: 'lead_created',
                    conditions: [],
                },
                steps: [
                    {
                        type: 'delay',
                        actionType: '',
                        config: {},
                        delay: { amount: 1, unit: 'days' },
                        order: 0,
                    },
                    {
                        type: 'action',
                        actionType: 'send_email',
                        config: { subject: 'Welcome! Let us help you get started', to: '{{lead.email}}' },
                        delay: { amount: 0, unit: '' },
                        order: 1,
                    },
                    {
                        type: 'delay',
                        actionType: '',
                        config: {},
                        delay: { amount: 3, unit: 'days' },
                        order: 2,
                    },
                    {
                        type: 'action',
                        actionType: 'create_task',
                        config: { title: 'Follow up with new lead', priority: 'medium', dueDays: 1 },
                        delay: { amount: 0, unit: '' },
                        order: 3,
                    },
                ],
                createdBy,
                organizationId,
            },
            {
                name: 'Hot Lead Alert',
                description: 'Notify manager and auto-assign when lead score exceeds 80',
                isActive: false,
                trigger: {
                    type: 'score_threshold',
                    conditions: [{ field: 'leadScore', operator: 'greater_than', value: 80 }],
                },
                steps: [
                    {
                        type: 'action',
                        actionType: 'create_notification',
                        config: { title: 'Hot Lead Detected!', message: 'A lead has reached a score above 80 — needs immediate attention' },
                        delay: { amount: 0, unit: '' },
                        order: 0,
                    },
                    {
                        type: 'action',
                        actionType: 'add_tag',
                        config: { tag: 'hot-lead' },
                        delay: { amount: 0, unit: '' },
                        order: 1,
                    },
                ],
                createdBy,
                organizationId,
            },
            {
                name: 'Deal Stale Alert',
                description: 'Create urgent task when a deal stays in the same stage too long',
                isActive: false,
                trigger: {
                    type: 'deal_stage_changed',
                    conditions: [],
                },
                steps: [
                    {
                        type: 'delay',
                        actionType: '',
                        config: {},
                        delay: { amount: 14, unit: 'days' },
                        order: 0,
                    },
                    {
                        type: 'action',
                        actionType: 'create_task',
                        config: { title: 'Deal stale — needs attention!', priority: 'urgent', dueDays: 1 },
                        delay: { amount: 0, unit: '' },
                        order: 1,
                    },
                    {
                        type: 'action',
                        actionType: 'create_notification',
                        config: { title: 'Stale Deal Warning', message: 'A deal has been in the same stage for 14+ days' },
                        delay: { amount: 0, unit: '' },
                        order: 2,
                    },
                ],
                createdBy,
                organizationId,
            },
            {
                name: 'Win Celebration',
                description: 'Celebrate when a deal is won — notify the team!',
                isActive: false,
                trigger: {
                    type: 'deal_won',
                    conditions: [],
                },
                steps: [
                    {
                        type: 'action',
                        actionType: 'create_notification',
                        config: { title: 'Deal Won!', message: 'Congratulations! A deal has been closed successfully.' },
                        delay: { amount: 0, unit: '' },
                        order: 0,
                    },
                    {
                        type: 'action',
                        actionType: 'send_email',
                        config: { subject: 'We won the deal!', to: 'team' },
                        delay: { amount: 0, unit: '' },
                        order: 1,
                    },
                ],
                createdBy,
                organizationId,
            },
        ];

        await Workflow.insertMany(workflows);
        logger.info(`Seeded ${workflows.length} example workflows for org ${organizationId}`);
    } catch (error) {
        logger.error('Seed workflows error:', error.message);
    }
};

module.exports = { seedWorkflows };
