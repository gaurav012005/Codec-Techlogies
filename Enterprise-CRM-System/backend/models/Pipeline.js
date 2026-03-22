const mongoose = require('mongoose');

const stageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    order: { type: Number, required: true },
    probability: { type: Number, default: 0, min: 0, max: 100 },
    color: { type: String, default: '#6366f1' },
}, { _id: true });

const pipelineSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    stages: [stageSchema],
    isDefault: { type: Boolean, default: false },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

pipelineSchema.index({ organizationId: 1 });

module.exports = mongoose.model('Pipeline', pipelineSchema);
