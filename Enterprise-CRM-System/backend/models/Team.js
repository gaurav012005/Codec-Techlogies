const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    department: { type: String, default: '' },
    teamLead: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    targets: {
        monthly: { type: Number, default: 0 },
        quarterly: { type: Number, default: 0 },
    },
    color: { type: String, default: '#6366f1' },
    isActive: { type: Boolean, default: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
}, { timestamps: true });

teamSchema.index({ organizationId: 1, isActive: 1 });

module.exports = mongoose.model('Team', teamSchema);
