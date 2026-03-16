const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    role: { type: String, default: '' },
    department: { type: String, default: '' },
    contactType: {
        type: String,
        enum: ['decision_maker', 'influencer', 'champion', 'end_user', 'gatekeeper', 'other'],
        default: 'other',
    },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    leadScore: { type: Number, default: 0, min: 0, max: 100 },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    tags: [{ type: String }],
    notes: { type: String, default: '' },
    preferences: {
        preferredChannel: { type: String, enum: ['email', 'phone', 'linkedin', 'other'], default: 'email' },
        timezone: { type: String, default: '' },
    },
    customFields: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

contactSchema.index({ organizationId: 1, companyId: 1 });
contactSchema.index({ organizationId: 1, ownerId: 1 });
contactSchema.index({ organizationId: 1, email: 1 });

module.exports = mongoose.model('Contact', contactSchema);
