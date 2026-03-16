const Company = require('../models/Company');
const Contact = require('../models/Contact');
const Activity = require('../models/Activity');

exports.getCompanies = async (req, res, next) => {
    try {
        const { organizationId } = req;
        const { search, sortBy = 'createdAt', order = 'desc', page = 1, limit = 20 } = req.query;
        const filter = { organizationId };

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { industry: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [companies, total] = await Promise.all([
            Company.find(filter).populate('ownerId', 'name email avatar').sort({ [sortBy]: order === 'asc' ? 1 : -1 }).skip(skip).limit(parseInt(limit)),
            Company.countDocuments(filter),
        ]);

        res.json({ success: true, data: { companies, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } } });
    } catch (error) { next(error); }
};

exports.getCompany = async (req, res, next) => {
    try {
        const company = await Company.findOne({ _id: req.params.id, organizationId: req.organizationId })
            .populate('ownerId', 'name email avatar');
        if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

        const contacts = await Contact.find({ companyId: company._id, organizationId: req.organizationId })
            .select('name email phone role contactType');

        const activities = await Activity.find({ relatedTo: company._id, relatedModel: 'Company' })
            .populate('userId', 'name avatar').sort({ createdAt: -1 }).limit(20);

        res.json({ success: true, data: { company, contacts, activities } });
    } catch (error) { next(error); }
};

exports.createCompany = async (req, res, next) => {
    try {
        const company = await Company.create({ ...req.body, ownerId: req.user.id, organizationId: req.organizationId });
        await Activity.create({ type: 'note', title: `Company "${company.name}" created`, relatedTo: company._id, relatedModel: 'Company', userId: req.user.id, organizationId: req.organizationId });
        res.status(201).json({ success: true, data: company });
    } catch (error) { next(error); }
};

exports.updateCompany = async (req, res, next) => {
    try {
        const company = await Company.findOneAndUpdate({ _id: req.params.id, organizationId: req.organizationId }, req.body, { new: true, runValidators: true });
        if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
        res.json({ success: true, data: company });
    } catch (error) { next(error); }
};

exports.deleteCompany = async (req, res, next) => {
    try {
        const company = await Company.findOneAndDelete({ _id: req.params.id, organizationId: req.organizationId });
        if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
        res.json({ success: true, message: 'Company deleted' });
    } catch (error) { next(error); }
};
