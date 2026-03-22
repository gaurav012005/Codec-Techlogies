const Contact = require('../models/Contact');
const Activity = require('../models/Activity');

exports.getContacts = async (req, res, next) => {
    try {
        const { organizationId } = req;
        const { companyId, search, sortBy = 'createdAt', order = 'desc', page = 1, limit = 20 } = req.query;
        const filter = { organizationId };

        if (req.user.role === 'sales_executive') filter.ownerId = req.user.id;
        if (companyId) filter.companyId = companyId;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [contacts, total] = await Promise.all([
            Contact.find(filter).populate('companyId', 'name').populate('ownerId', 'name email avatar').sort({ [sortBy]: order === 'asc' ? 1 : -1 }).skip(skip).limit(parseInt(limit)),
            Contact.countDocuments(filter),
        ]);

        res.json({ success: true, data: { contacts, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } } });
    } catch (error) { next(error); }
};

exports.getContact = async (req, res, next) => {
    try {
        const contact = await Contact.findOne({ _id: req.params.id, organizationId: req.organizationId })
            .populate('companyId', 'name industry website')
            .populate('ownerId', 'name email avatar');
        if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });

        const activities = await Activity.find({ relatedTo: contact._id, relatedModel: 'Contact' })
            .populate('userId', 'name avatar').sort({ createdAt: -1 }).limit(20);

        res.json({ success: true, data: { contact, activities } });
    } catch (error) { next(error); }
};

exports.createContact = async (req, res, next) => {
    try {
        const contact = await Contact.create({ ...req.body, ownerId: req.user.id, organizationId: req.organizationId });
        await Activity.create({ type: 'note', title: `Contact "${contact.name}" created`, relatedTo: contact._id, relatedModel: 'Contact', userId: req.user.id, organizationId: req.organizationId });
        res.status(201).json({ success: true, data: contact });
    } catch (error) { next(error); }
};

exports.updateContact = async (req, res, next) => {
    try {
        const filter = { _id: req.params.id, organizationId: req.organizationId };
        if (req.user.role === 'sales_executive') filter.ownerId = req.user.id;
        const contact = await Contact.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
        if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });
        res.json({ success: true, data: contact });
    } catch (error) { next(error); }
};

exports.deleteContact = async (req, res, next) => {
    try {
        const contact = await Contact.findOneAndDelete({ _id: req.params.id, organizationId: req.organizationId });
        if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });
        res.json({ success: true, message: 'Contact deleted' });
    } catch (error) { next(error); }
};
