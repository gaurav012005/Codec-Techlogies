const Joi = require('joi');

const registerSchema = Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Name must be at least 2 characters',
        'any.required': 'Name is required',
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email',
        'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).max(128).required().messages({
        'string.min': 'Password must be at least 6 characters',
        'any.required': 'Password is required',
    }),
    companyName: Joi.string().min(2).max(200).required().messages({
        'string.min': 'Company name must be at least 2 characters',
        'any.required': 'Company name is required',
    }),
    industry: Joi.string().max(100).optional(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email',
        'any.required': 'Email is required',
    }),
    password: Joi.string().required().messages({
        'any.required': 'Password is required',
    }),
});

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        const messages = error.details.map((d) => d.message);
        return res.status(400).json({ success: false, message: 'Validation Error', errors: messages });
    }
    next();
};

module.exports = { registerSchema, loginSchema, validate };
