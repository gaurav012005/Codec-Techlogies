const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    industry: { type: String, default: '' },
    logo: { type: String, default: '' },
    plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    settings: {
        branding: {
            primaryColor: { type: String, default: '#6366f1' },
            logo: { type: String, default: '' },
        },
        defaults: {
            currency: { type: String, default: 'USD' },
            timezone: { type: String, default: 'UTC' },
        },
    },
    usageLimits: {
        maxUsers: { type: Number, default: 5 },
        maxLeads: { type: Number, default: 500 },
        maxDeals: { type: Number, default: 200 },
    },
}, { timestamps: true });

organizationSchema.index({ slug: 1 }, { unique: true });

module.exports = mongoose.model('Organization', organizationSchema);
