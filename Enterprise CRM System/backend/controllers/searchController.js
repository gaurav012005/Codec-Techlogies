const Lead = require('../models/Lead');
const Contact = require('../models/Contact');
const Company = require('../models/Company');
const Deal = require('../models/Deal');
const Task = require('../models/Task');
const logger = require('../utils/logger');

// GET /api/search?q=term — Global search across all entities
exports.globalSearch = async (req, res, next) => {
    try {
        const { q, limit = 5 } = req.query;
        if (!q || q.trim().length < 2) {
            return res.json({ success: true, data: { results: [], query: q } });
        }

        const searchRegex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        const orgFilter = { organizationId: req.organizationId };
        const maxPerCategory = parseInt(limit);

        const [leads, contacts, companies, deals, tasks] = await Promise.all([
            Lead.find({
                ...orgFilter,
                $or: [
                    { name: searchRegex },
                    { email: searchRegex },
                    { company: searchRegex },
                    { phone: searchRegex },
                ],
            }).select('name email company status leadScore').limit(maxPerCategory),

            Contact.find({
                ...orgFilter,
                $or: [
                    { name: searchRegex },
                    { email: searchRegex },
                    { phone: searchRegex },
                    { role: searchRegex },
                ],
            }).select('name email role contactType').limit(maxPerCategory),

            Company.find({
                ...orgFilter,
                $or: [
                    { name: searchRegex },
                    { industry: searchRegex },
                    { email: searchRegex },
                ],
            }).select('name industry healthScore').limit(maxPerCategory),

            Deal.find({
                ...orgFilter,
                $or: [
                    { title: searchRegex },
                    { notes: searchRegex },
                ],
            }).select('title value stage status probability').limit(maxPerCategory),

            Task.find({
                ...orgFilter,
                $or: [
                    { title: searchRegex },
                    { description: searchRegex },
                ],
            }).select('title status priority dueDate').limit(maxPerCategory),
        ]);

        const results = [
            ...leads.map(l => ({ id: l._id, type: 'lead', title: l.name, subtitle: l.email || l.company, meta: l.status, url: '/leads' })),
            ...contacts.map(c => ({ id: c._id, type: 'contact', title: c.name, subtitle: c.email || c.role, meta: c.contactType, url: '/contacts' })),
            ...companies.map(c => ({ id: c._id, type: 'company', title: c.name, subtitle: c.industry, meta: `Health: ${c.healthScore}%`, url: '/companies' })),
            ...deals.map(d => ({ id: d._id, type: 'deal', title: d.title, subtitle: `$${d.value}`, meta: d.stage, url: '/deals' })),
            ...tasks.map(t => ({ id: t._id, type: 'task', title: t.title, subtitle: t.priority, meta: t.status, url: '/tasks' })),
        ];

        // Quick actions
        const quickActions = [
            { id: 'new-lead', type: 'action', title: 'Create new lead', url: '/leads', icon: 'plus' },
            { id: 'new-deal', type: 'action', title: 'Create new deal', url: '/deals', icon: 'plus' },
            { id: 'pipeline', type: 'action', title: 'Open pipeline', url: '/pipeline', icon: 'layers' },
            { id: 'reports', type: 'action', title: 'View reports', url: '/reports', icon: 'bar-chart' },
            { id: 'tasks', type: 'action', title: 'My tasks', url: '/tasks', icon: 'check-square' },
        ].filter(a => a.title.toLowerCase().includes(q.toLowerCase()));

        res.json({
            success: true,
            data: {
                results,
                quickActions,
                query: q,
                counts: {
                    leads: leads.length,
                    contacts: contacts.length,
                    companies: companies.length,
                    deals: deals.length,
                    tasks: tasks.length,
                },
            },
        });
    } catch (error) { next(error); }
};
