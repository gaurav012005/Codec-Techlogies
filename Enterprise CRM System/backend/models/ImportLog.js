const mongoose = require('mongoose');

const importLogSchema = new mongoose.Schema({
    fileName: { type: String, required: true },
    entity: {
        type: String,
        enum: ['Lead', 'Contact', 'Company', 'Deal'],
        required: true,
    },
    totalRecords: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    failureCount: { type: Number, default: 0 },
    duplicateCount: { type: Number, default: 0 },
    errors: [{
        row: Number,
        field: String,
        message: String,
        data: mongoose.Schema.Types.Mixed,
    }],
    columnMapping: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: {
        type: String,
        enum: ['queued', 'processing', 'completed', 'failed', 'cancelled'],
        default: 'queued',
    },
    importedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    completedAt: { type: Date },
}, { timestamps: true });

importLogSchema.index({ organizationId: 1, createdAt: -1 });
importLogSchema.index({ organizationId: 1, status: 1 });

module.exports = mongoose.model('ImportLog', importLogSchema);
