const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    industry: { type: String, default: '' },
    size: { type: String, enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+', ''], default: '' },
    revenue: { type: String, default: '' },
    website: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    address: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        country: { type: String, default: '' },
        zip: { type: String, default: '' },
    },
    healthScore: { type: Number, default: 50, min: 0, max: 100 },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    tags: [{ type: String }],
    notes: { type: String, default: '' },
    customFields: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

companySchema.index({ organizationId: 1, name: 1 });
companySchema.index({ organizationId: 1, ownerId: 1 });

module.exports = mongoose.model('Company', companySchema);
