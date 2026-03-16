const mongoose = require('mongoose');

const customFieldSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    fieldType: {
        type: String,
        enum: ['text', 'number', 'date', 'dropdown', 'checkbox', 'url', 'email', 'textarea'],
        required: true,
    },
    entity: {
        type: String,
        enum: ['Lead', 'Contact', 'Company', 'Deal'],
        required: true,
    },
    options: [{ type: String }],
    defaultValue: { type: mongoose.Schema.Types.Mixed },
    isRequired: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    visibleToRoles: [{
        type: String,
        enum: ['super_admin', 'sales_manager', 'sales_executive', 'support', 'analyst'],
    }],
    order: { type: Number, default: 0 },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

customFieldSchema.index({ organizationId: 1, entity: 1 });
customFieldSchema.index({ organizationId: 1, isActive: 1 });

module.exports = mongoose.model('CustomField', customFieldSchema);
