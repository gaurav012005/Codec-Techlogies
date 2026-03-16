// ============================================
// Exam Controller — Feature 5: Exam Configuration & Builder
// ============================================

const prisma = require('../config/db');
const { AppError } = require('../middleware/error.middleware');

// ===== GET ALL EXAMS (with pagination + filters) =====
exports.getExams = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status, search } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (status) where.status = status;
        if (search) where.title = { contains: search, mode: 'insensitive' };

        // Examiners see only their own exams
        if (req.user.role === 'EXAMINER') where.createdById = req.user.id;

        const [exams, total] = await Promise.all([
            prisma.exam.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    createdBy: { select: { id: true, name: true, email: true } },
                    _count: {
                        select: {
                            examQuestions: true,
                            examAttempts: true,
                            assignments: true,
                        },
                    },
                },
            }),
            prisma.exam.count({ where }),
        ]);

        res.json({
            success: true,
            data: exams,
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

// ===== GET SINGLE EXAM (with questions) =====
exports.getExam = async (req, res, next) => {
    try {
        const { id } = req.params;

        const exam = await prisma.exam.findUnique({
            where: { id },
            include: {
                createdBy: { select: { id: true, name: true, email: true } },
                examQuestions: {
                    orderBy: { sortOrder: 'asc' },
                    include: {
                        question: {
                            include: {
                                options: { orderBy: { sortOrder: 'asc' } },
                            },
                        },
                    },
                },
                _count: { select: { examAttempts: true, assignments: true } },
            },
        });

        if (!exam) throw new AppError('Exam not found.', 404);

        if (req.user.role === 'EXAMINER' && exam.createdById !== req.user.id) {
            throw new AppError('Access denied.', 403);
        }

        res.json({ success: true, data: exam });
    } catch (error) {
        next(error);
    }
};

// ===== CREATE EXAM (Step 1: Exam Details & Constraints) =====
exports.createExam = async (req, res, next) => {
    try {
        const {
            title,
            description,
            subjectCategory,
            durationMinutes,
            passingPercentage,
            negativeMarking,
            negativeMarkValue,
            startDatetime,
            endDatetime,
            maxAttempts,
            examPassword,
            shuffleQuestions,
            shuffleOptions,
            showResultImmediately,
            allowReview,
            adaptiveMode,
            proctoringEnabled,
            fullscreenRequired,
            proctorConfig,
        } = req.body;

        if (!title || !subjectCategory || !durationMinutes || !startDatetime || !endDatetime) {
            throw new AppError('Title, subject, duration, start and end datetime are required.', 400);
        }

        if (new Date(startDatetime) >= new Date(endDatetime)) {
            throw new AppError('Start datetime must be before end datetime.', 400);
        }

        const exam = await prisma.exam.create({
            data: {
                title,
                description,
                subjectCategory,
                durationMinutes: parseInt(durationMinutes),
                passingPercentage: parseFloat(passingPercentage || 40),
                negativeMarking: Boolean(negativeMarking),
                negativeMarkValue: parseFloat(negativeMarkValue || 0),
                startDatetime: new Date(startDatetime),
                endDatetime: new Date(endDatetime),
                maxAttempts: parseInt(maxAttempts || 1),
                examPassword,
                shuffleQuestions: Boolean(shuffleQuestions),
                shuffleOptions: Boolean(shuffleOptions),
                showResultImmediately: showResultImmediately !== false,
                allowReview: Boolean(allowReview),
                adaptiveMode: Boolean(adaptiveMode),
                proctoringEnabled: Boolean(proctoringEnabled),
                fullscreenRequired: Boolean(fullscreenRequired),
                proctorConfig: proctorConfig || null,
                createdById: req.user.id,
                status: 'DRAFT',
            },
            include: {
                createdBy: { select: { id: true, name: true } },
            },
        });

        res.status(201).json({
            success: true,
            message: 'Exam created as draft. Now add questions.',
            data: exam,
        });
    } catch (error) {
        next(error);
    }
};

// ===== UPDATE EXAM DETAILS =====
exports.updateExam = async (req, res, next) => {
    try {
        const { id } = req.params;

        const existing = await prisma.exam.findUnique({ where: { id } });
        if (!existing) throw new AppError('Exam not found.', 404);

        if (req.user.role === 'EXAMINER' && existing.createdById !== req.user.id) {
            throw new AppError('Access denied.', 403);
        }

        // Cannot edit exams that are ACTIVE or CLOSED
        if (['ACTIVE', 'CLOSED', 'ARCHIVED'].includes(existing.status)) {
            throw new AppError(`Cannot edit an exam with status: ${existing.status}.`, 400);
        }

        const {
            title, description, subjectCategory, durationMinutes,
            passingPercentage, negativeMarking, negativeMarkValue,
            startDatetime, endDatetime, maxAttempts, examPassword,
            shuffleQuestions, shuffleOptions, showResultImmediately,
            allowReview, adaptiveMode, proctoringEnabled, fullscreenRequired,
            proctorConfig,
        } = req.body;

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (subjectCategory !== undefined) updateData.subjectCategory = subjectCategory;
        if (durationMinutes !== undefined) updateData.durationMinutes = parseInt(durationMinutes);
        if (passingPercentage !== undefined) updateData.passingPercentage = parseFloat(passingPercentage);
        if (negativeMarking !== undefined) updateData.negativeMarking = Boolean(negativeMarking);
        if (negativeMarkValue !== undefined) updateData.negativeMarkValue = parseFloat(negativeMarkValue);
        if (startDatetime !== undefined) updateData.startDatetime = new Date(startDatetime);
        if (endDatetime !== undefined) updateData.endDatetime = new Date(endDatetime);
        if (maxAttempts !== undefined) updateData.maxAttempts = parseInt(maxAttempts);
        if (examPassword !== undefined) updateData.examPassword = examPassword;
        if (shuffleQuestions !== undefined) updateData.shuffleQuestions = Boolean(shuffleQuestions);
        if (shuffleOptions !== undefined) updateData.shuffleOptions = Boolean(shuffleOptions);
        if (showResultImmediately !== undefined) updateData.showResultImmediately = Boolean(showResultImmediately);
        if (allowReview !== undefined) updateData.allowReview = Boolean(allowReview);
        if (adaptiveMode !== undefined) updateData.adaptiveMode = Boolean(adaptiveMode);
        if (proctoringEnabled !== undefined) updateData.proctoringEnabled = Boolean(proctoringEnabled);
        if (fullscreenRequired !== undefined) updateData.fullscreenRequired = Boolean(fullscreenRequired);
        if (proctorConfig !== undefined) updateData.proctorConfig = proctorConfig;

        const exam = await prisma.exam.update({
            where: { id },
            data: updateData,
            include: { createdBy: { select: { id: true, name: true } } },
        });

        res.json({ success: true, message: 'Exam updated successfully.', data: exam });
    } catch (error) {
        next(error);
    }
};

// ===== ADD / REPLACE QUESTIONS IN EXAM =====
exports.setExamQuestions = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { questionIds } = req.body; // array of question IDs in desired order

        if (!questionIds || !Array.isArray(questionIds)) {
            throw new AppError('questionIds array is required.', 400);
        }

        const exam = await prisma.exam.findUnique({ where: { id } });
        if (!exam) throw new AppError('Exam not found.', 404);

        if (req.user.role === 'EXAMINER' && exam.createdById !== req.user.id) {
            throw new AppError('Access denied.', 403);
        }

        if (['ACTIVE', 'CLOSED'].includes(exam.status)) {
            throw new AppError('Cannot modify questions in an active or closed exam.', 400);
        }

        // Verify all question IDs exist and are published
        const questions = await prisma.question.findMany({
            where: { id: { in: questionIds }, status: 'PUBLISHED' },
            select: { id: true, marks: true },
        });

        if (questions.length !== questionIds.length) {
            throw new AppError('Some question IDs are invalid or not published.', 400);
        }

        // Calculate total marks
        const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

        // Replace all questions in a transaction
        await prisma.$transaction(async (tx) => {
            await tx.examQuestion.deleteMany({ where: { examId: id } });
            await tx.examQuestion.createMany({
                data: questionIds.map((qId, idx) => ({
                    examId: id,
                    questionId: qId,
                    sortOrder: idx,
                    sectionNumber: 1,
                })),
            });
            await tx.exam.update({
                where: { id },
                data: { totalMarks },
            });
        });

        res.json({
            success: true,
            message: `${questionIds.length} questions assigned. Total marks: ${totalMarks}.`,
            totalMarks,
            questionCount: questionIds.length,
        });
    } catch (error) {
        next(error);
    }
};

// ===== PUBLISH EXAM =====
exports.publishExam = async (req, res, next) => {
    try {
        const { id } = req.params;

        const exam = await prisma.exam.findUnique({
            where: { id },
            include: { _count: { select: { examQuestions: true } } },
        });
        if (!exam) throw new AppError('Exam not found.', 404);

        if (req.user.role === 'EXAMINER' && exam.createdById !== req.user.id) {
            throw new AppError('Access denied.', 403);
        }

        if (exam.status !== 'DRAFT') {
            throw new AppError(`Exam is already ${exam.status}.`, 400);
        }

        if (exam._count.examQuestions === 0) {
            throw new AppError('Cannot publish an exam with no questions.', 400);
        }

        const updated = await prisma.exam.update({
            where: { id },
            data: { status: 'PUBLISHED' },
        });

        res.json({
            success: true,
            message: 'Exam published successfully.',
            data: updated,
        });
    } catch (error) {
        next(error);
    }
};

// ===== ASSIGN EXAM TO STUDENTS =====
exports.assignExam = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { studentIds } = req.body;

        if (!studentIds || !studentIds.length) {
            throw new AppError('No student IDs provided.', 400);
        }

        const exam = await prisma.exam.findUnique({ where: { id } });
        if (!exam) throw new AppError('Exam not found.', 404);

        if (!['PUBLISHED', 'ACTIVE'].includes(exam.status)) {
            throw new AppError('Exam must be published before assigning.', 400);
        }

        // Verify all are students
        const students = await prisma.user.findMany({
            where: { id: { in: studentIds }, role: 'STUDENT', isActive: true },
            select: { id: true },
        });

        // Upsert assignments (skip duplicates)
        const assignments = await prisma.examAssignment.createMany({
            data: students.map(s => ({ examId: id, studentId: s.id })),
            skipDuplicates: true,
        });

        res.json({
            success: true,
            message: `Exam assigned to ${assignments.count} student(s).`,
            assigned: assignments.count,
        });
    } catch (error) {
        next(error);
    }
};

// ===== DELETE EXAM =====
exports.deleteExam = async (req, res, next) => {
    try {
        const { id } = req.params;

        const exam = await prisma.exam.findUnique({ where: { id } });
        if (!exam) throw new AppError('Exam not found.', 404);

        if (req.user.role === 'EXAMINER' && exam.createdById !== req.user.id) {
            throw new AppError('Access denied.', 403);
        }

        if (['ACTIVE', 'CLOSED'].includes(exam.status)) {
            throw new AppError('Cannot delete an active or closed exam.', 400);
        }

        await prisma.exam.delete({ where: { id } });

        res.json({ success: true, message: 'Exam deleted successfully.' });
    } catch (error) {
        next(error);
    }
};
