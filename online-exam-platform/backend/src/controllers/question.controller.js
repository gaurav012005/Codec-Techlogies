// ============================================
// Question Controller — Feature 4: Question Bank
// CRUD for Questions and Options
// ============================================

const prisma = require('../config/db');
const { AppError } = require('../middleware/error.middleware');

// ===== GET ALL QUESTIONS (with filters + pagination) =====
exports.getQuestions = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            subject,
            type,
            difficulty,
            status,
            search,
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build where clause
        const where = {};
        if (subject) where.subject = { contains: subject, mode: 'insensitive' };
        if (type) where.questionType = type;
        if (difficulty) where.difficultyLevel = difficulty;
        if (status) where.status = status;
        if (search) {
            where.questionText = { contains: search, mode: 'insensitive' };
        }

        // Role-based filter: Examiner sees only their own, Admin sees all
        if (req.user.role === 'EXAMINER') {
            where.createdById = req.user.id;
        }

        const [questions, total] = await Promise.all([
            prisma.question.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    options: { orderBy: { sortOrder: 'asc' } },
                    createdBy: { select: { id: true, name: true, email: true } },
                    _count: { select: { examQuestions: true } },
                },
            }),
            prisma.question.count({ where }),
        ]);

        res.json({
            success: true,
            data: questions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        next(error);
    }
};

// ===== GET SINGLE QUESTION =====
exports.getQuestion = async (req, res, next) => {
    try {
        const { id } = req.params;

        const question = await prisma.question.findUnique({
            where: { id },
            include: {
                options: { orderBy: { sortOrder: 'asc' } },
                createdBy: { select: { id: true, name: true, email: true } },
            },
        });

        if (!question) {
            throw new AppError('Question not found.', 404);
        }

        // Examiners can only view their own
        if (req.user.role === 'EXAMINER' && question.createdById !== req.user.id) {
            throw new AppError('Access denied.', 403);
        }

        res.json({ success: true, data: question });
    } catch (error) {
        next(error);
    }
};

// ===== CREATE QUESTION =====
exports.createQuestion = async (req, res, next) => {
    try {
        const {
            questionText,
            questionType,
            difficultyLevel,
            subject,
            category,
            marks,
            negativeMarks,
            explanation,
            imageUrl,
            correctAnswer,
            options = [],
        } = req.body;

        // Validate options for MCQ types
        if (['MCQ_SINGLE', 'MCQ_MULTIPLE', 'TRUE_FALSE'].includes(questionType)) {
            if (options.length < 2) {
                throw new AppError('MCQ questions require at least 2 options.', 400);
            }
            const hasCorrect = options.some(o => o.isCorrect);
            if (!hasCorrect) {
                throw new AppError('At least one option must be marked as correct.', 400);
            }
        }

        const question = await prisma.question.create({
            data: {
                questionText,
                questionType,
                difficultyLevel,
                subject,
                category,
                marks: parseInt(marks),
                negativeMarks: parseFloat(negativeMarks || 0),
                explanation,
                imageUrl,
                correctAnswer,
                createdById: req.user.id,
                options: {
                    create: options.map((opt, idx) => ({
                        optionText: opt.optionText,
                        isCorrect: Boolean(opt.isCorrect),
                        sortOrder: idx,
                    })),
                },
            },
            include: {
                options: { orderBy: { sortOrder: 'asc' } },
                createdBy: { select: { id: true, name: true } },
            },
        });

        res.status(201).json({
            success: true,
            message: 'Question created successfully.',
            data: question,
        });
    } catch (error) {
        next(error);
    }
};

// ===== UPDATE QUESTION =====
exports.updateQuestion = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            questionText,
            questionType,
            difficultyLevel,
            subject,
            category,
            marks,
            negativeMarks,
            explanation,
            imageUrl,
            correctAnswer,
            status,
            options,
        } = req.body;

        // Fetch existing
        const existing = await prisma.question.findUnique({ where: { id } });
        if (!existing) throw new AppError('Question not found.', 404);

        // Examiners can only edit their own
        if (req.user.role === 'EXAMINER' && existing.createdById !== req.user.id) {
            throw new AppError('Access denied.', 403);
        }

        // Prevent editing if already used in exams (optional guard)
        // const inUse = await prisma.examQuestion.count({ where: { questionId: id } });
        // if (inUse > 0 && status !== existing.status) {
        //     throw new AppError('Cannot modify a question already used in an exam.', 409);
        // }

        const updateData = {};
        if (questionText !== undefined) updateData.questionText = questionText;
        if (questionType !== undefined) updateData.questionType = questionType;
        if (difficultyLevel !== undefined) updateData.difficultyLevel = difficultyLevel;
        if (subject !== undefined) updateData.subject = subject;
        if (category !== undefined) updateData.category = category;
        if (marks !== undefined) updateData.marks = parseInt(marks);
        if (negativeMarks !== undefined) updateData.negativeMarks = parseFloat(negativeMarks);
        if (explanation !== undefined) updateData.explanation = explanation;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
        if (correctAnswer !== undefined) updateData.correctAnswer = correctAnswer;
        if (status !== undefined) updateData.status = status;

        // Update in transaction: delete existing options then recreate if provided
        const question = await prisma.$transaction(async (tx) => {
            if (options !== undefined) {
                await tx.option.deleteMany({ where: { questionId: id } });
                updateData.options = {
                    create: options.map((opt, idx) => ({
                        optionText: opt.optionText,
                        isCorrect: Boolean(opt.isCorrect),
                        sortOrder: idx,
                    })),
                };
            }

            return tx.question.update({
                where: { id },
                data: updateData,
                include: {
                    options: { orderBy: { sortOrder: 'asc' } },
                    createdBy: { select: { id: true, name: true } },
                },
            });
        });

        res.json({
            success: true,
            message: 'Question updated successfully.',
            data: question,
        });
    } catch (error) {
        next(error);
    }
};

// ===== DELETE QUESTION =====
exports.deleteQuestion = async (req, res, next) => {
    try {
        const { id } = req.params;

        const existing = await prisma.question.findUnique({ where: { id } });
        if (!existing) throw new AppError('Question not found.', 404);

        if (req.user.role === 'EXAMINER' && existing.createdById !== req.user.id) {
            throw new AppError('Access denied.', 403);
        }

        // Check if used in active/published exams
        const inActiveExam = await prisma.examQuestion.findFirst({
            where: {
                questionId: id,
                exam: { status: { in: ['PUBLISHED', 'ACTIVE'] } },
            },
        });
        if (inActiveExam) {
            throw new AppError('Cannot delete a question used in a published or active exam.', 409);
        }

        await prisma.question.delete({ where: { id } });

        res.json({ success: true, message: 'Question deleted successfully.' });
    } catch (error) {
        next(error);
    }
};

// ===== BULK PUBLISH/ARCHIVE =====
exports.bulkUpdateStatus = async (req, res, next) => {
    try {
        const { ids, status } = req.body;

        if (!ids || !ids.length) throw new AppError('No question IDs provided.', 400);
        if (!['PUBLISHED', 'ARCHIVED', 'DRAFT'].includes(status)) {
            throw new AppError('Invalid status value.', 400);
        }

        const where = { id: { in: ids } };
        if (req.user.role === 'EXAMINER') where.createdById = req.user.id;

        const result = await prisma.question.updateMany({ where, data: { status } });

        res.json({
            success: true,
            message: `Updated ${result.count} questions to status: ${status}.`,
            count: result.count,
        });
    } catch (error) {
        next(error);
    }
};

// ===== GET SUBJECTS LIST (distinct) =====
exports.getSubjects = async (req, res, next) => {
    try {
        const subjects = await prisma.question.findMany({
            distinct: ['subject'],
            select: { subject: true },
            orderBy: { subject: 'asc' },
        });
        res.json({ success: true, data: subjects.map(s => s.subject) });
    } catch (error) {
        next(error);
    }
};
