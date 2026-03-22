const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
        type: String,
        enum: ['super_admin', 'sales_manager', 'sales_executive', 'support', 'analyst'],
        default: 'sales_executive',
    },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    department: { type: String, default: '' },
    avatar: { type: String, default: '' },
    phone: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    refreshToken: { type: String, select: false },
}, { timestamps: true });

userSchema.index({ email: 1, organizationId: 1 }, { unique: true });
userSchema.index({ organizationId: 1, role: 1 });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.refreshToken;
    return obj;
};

module.exports = mongoose.model('User', userSchema);
