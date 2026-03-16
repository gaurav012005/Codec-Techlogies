// ============================================
// Attempt Controller — Feature 6
// ============================================

const prisma = require('../config/db');
const { AppError } = require('../middleware/error.middleware');
const { calculateRiskScore } = require('../services/riskScore.service');

// ─── GET /api/exams/assigned ─────────────────────────────────────────────────
// Returns all published exams assigned to the logged-in student
const getAssignedExams = async (req, res, next) => {
    try {
        const studentId = req.user.id;

        // Get exam IDs assigned to this student
        const assignments = await prisma.examAssignment.findMany({
            where: { studentId },
            select: { examId: true },
        });

        const examIds = assignments.map((a) => a.examId);

        // Also include all PUBLISHED exams (open to everyone)
        const exams = await prisma.exam.findMany({
            where: {
                status: { in: ['PUBLISHED', 'ACTIVE'] },
            },
            include: {
                createdBy: { select: { name: true } },
                _count: { select: { examQuestions: true } },
                examAttempts: {
                    where: { studentId },
                    select: { id: true, status: true, totalScore: true, percentage: true, startedAt: true, submittedAt: true },
                    orderBy: { startedAt: 'desc' },
                    take: 1,
                },
            },
            orderBy: { startDatetime: 'asc' },
        });

        const now = new Date();
        const enriched = exams.map((exam) => {
            const attempt = exam.examAttempts[0] || null;
            let examState = 'upcoming';
            if (now >= new Date(exam.startDatetime) && now <= new Date(exam.endDatetime)) examState = 'active';
            if (now > new Date(exam.endDatetime)) examState = 'ended';

            return {
                ...exam,
                examAttempts: undefined,
                questionCount: exam._count.examQuestions,
                _count: undefined,
                examState,
                myAttempt: attempt,
            };
        });

        res.json({ success: true, data: enriched });
    } catch (err) {
        next(err);
    }
};

// ─── POST /api/attempts/start ────────────────────────────────────────────────
// Creates a new attempt or resumes an in-progress one
const startAttempt = async (req, res, next) => {
    try {
        const { examId } = req.body;
        const studentId = req.user.id;

        if (!examId) throw new AppError('examId is required', 400);

        const exam = await prisma.exam.findUnique({
            where: { id: examId },
            include: {
                examQuestions: {
                    include: {
                        question: {
                            include: { options: { orderBy: { sortOrder: 'asc' } } },
                        },
                    },
                    orderBy: { sortOrder: 'asc' },
                },
            },
        });

        if (!exam) throw new AppError('Exam not found', 404);
        if (!['PUBLISHED', 'ACTIVE'].includes(exam.status)) throw new AppError('Exam is not available', 400);

        const now = new Date();
        if (now < new Date(exam.startDatetime)) throw new AppError('Exam has not started yet', 400);
        if (now > new Date(exam.endDatetime)) throw new AppError('Exam has ended', 400);

        // Check for existing in-progress attempt (resume)
        let attempt = await prisma.examAttempt.findFirst({
            where: { examId, studentId, status: 'IN_PROGRESS' },
            include: {
                studentAnswers: {
                    select: { questionId: true, selectedOptionId: true, studentAnswer: true },
                },
            },
        });

        if (!attempt) {
            // Check attempt limit
            const attemptCount = await prisma.examAttempt.count({ where: { examId, studentId } });
            if (attemptCount >= exam.maxAttempts) {
                throw new AppError(`Maximum attempts (${exam.maxAttempts}) reached`, 400);
            }

            attempt = await prisma.examAttempt.create({
                data: {
                    examId,
                    studentId,
                    attemptNumber: attemptCount + 1,
                    status: 'IN_PROGRESS',
                    ipAddress: req.ip,
                },
                include: { studentAnswers: true },
            });
        }

        // ── Feature 11: Adaptive Mode ───────────────────────────────────
        if (exam.adaptiveMode) {
            // Initialize adaptive state if new attempt
            if (!attempt.adaptiveState) {
                const adaptiveState = {
                    currentDifficulty: 'MEDIUM',
                    questionHistory: [],
                    answeredQuestionIds: attempt.studentAnswers.map((sa) => sa.questionId),
                };
                await prisma.examAttempt.update({
                    where: { id: attempt.id },
                    data: { adaptiveState },
                });
            }

            // For adaptive mode, pick first question (MEDIUM difficulty preferred)
            const answeredIds = new Set(attempt.studentAnswers.map((sa) => sa.questionId));
            const allQuestions = exam.examQuestions.map((eq) => eq.question);
            const available = allQuestions.filter((q) => !answeredIds.has(q.id));

            // Pick a MEDIUM difficulty question first, or fallback
            let firstQuestion = available.find((q) => q.difficultyLevel === 'MEDIUM')
                || available.find((q) => q.difficultyLevel === 'EASY')
                || available[0];

            const endTime = new Date(exam.endDatetime);
            const startedAt = new Date(attempt.startedAt);
            const examDurationMs = exam.durationMinutes * 60 * 1000;
            const attemptDeadline = new Date(Math.min(startedAt.getTime() + examDurationMs, endTime.getTime()));
            const timeRemainingSeconds = Math.max(0, Math.floor((attemptDeadline - now) / 1000));

            return res.json({
                success: true,
                data: {
                    attemptId: attempt.id,
                    examId: exam.id,
                    examTitle: exam.title,
                    durationMinutes: exam.durationMinutes,
                    timeRemainingSeconds,
                    adaptiveMode: true,
                    totalQuestions: allQuestions.length,
                    questionsAnswered: answeredIds.size,
                    currentDifficulty: attempt.adaptiveState?.currentDifficulty || 'MEDIUM',
                    negativeMarking: exam.negativeMarking,
                    negativeMarkValue: exam.negativeMarkValue,
                    showResultImmediately: exam.showResultImmediately,
                    question: firstQuestion ? {
                        id: firstQuestion.id,
                        questionText: firstQuestion.questionText,
                        questionType: firstQuestion.questionType,
                        difficultyLevel: firstQuestion.difficultyLevel,
                        marks: firstQuestion.marks,
                        imageUrl: firstQuestion.imageUrl,
                        options: firstQuestion.options.map((o) => ({
                            id: o.id,
                            optionText: o.optionText,
                        })),
                    } : null,
                    savedAnswers: attempt.studentAnswers,
                },
            });
        }

        // ── Standard (non-adaptive) mode ─────────────────────────────────
        // Build questions list (shuffle if enabled)
        let questions = exam.examQuestions.map((eq) => ({
            id: eq.question.id,
            questionText: eq.question.questionText,
            questionType: eq.question.questionType,
            marks: eq.question.marks,
            imageUrl: eq.question.imageUrl,
            options: eq.question.options.map((o) => ({
                id: o.id,
                optionText: o.optionText,
            })),
        }));

        if (exam.shuffleQuestions) {
            questions = questions.sort(() => Math.random() - 0.5);
        }

        // Calculate time remaining
        const endTime = new Date(exam.endDatetime);
        const startedAt = new Date(attempt.startedAt);
        const examDurationMs = exam.durationMinutes * 60 * 1000;
        const attemptDeadline = new Date(Math.min(startedAt.getTime() + examDurationMs, endTime.getTime()));
        const timeRemainingSeconds = Math.max(0, Math.floor((attemptDeadline - now) / 1000));

        res.json({
            success: true,
            data: {
                attemptId: attempt.id,
                examId: exam.id,
                examTitle: exam.title,
                durationMinutes: exam.durationMinutes,
                timeRemainingSeconds,
                adaptiveMode: false,
                shuffleOptions: exam.shuffleOptions,
                negativeMarking: exam.negativeMarking,
                negativeMarkValue: exam.negativeMarkValue,
                showResultImmediately: exam.showResultImmediately,
                questions,
                savedAnswers: attempt.studentAnswers,
            },
        });
    } catch (err) {
        next(err);
    }
};

// ─── POST /api/attempts/:attemptId/answer ────────────────────────────────────
// Auto-save a single answer (upsert)
const saveAnswer = async (req, res, next) => {
    try {
        const { attemptId } = req.params;
        const { questionId, selectedOptionId, studentAnswer } = req.body;
        const studentId = req.user.id;

        if (!questionId) throw new AppError('questionId is required', 400);

        // Verify attempt belongs to student and is still in progress
        const attempt = await prisma.examAttempt.findFirst({
            where: { id: attemptId, studentId, status: 'IN_PROGRESS' },
        });
        if (!attempt) throw new AppError('Attempt not found or already submitted', 404);

        const saved = await prisma.studentAnswer.upsert({
            where: { attemptId_questionId: { attemptId, questionId } },
            update: {
                selectedOptionId: selectedOptionId || null,
                studentAnswer: studentAnswer || null,
                answeredAt: new Date(),
            },
            create: {
                attemptId,
                questionId,
                selectedOptionId: selectedOptionId || null,
                studentAnswer: studentAnswer || null,
            },
        });

        res.json({ success: true, data: saved });
    } catch (err) {
        next(err);
    }
};

// ─── POST /api/attempts/:attemptId/submit ────────────────────────────────────
// Submit the exam attempt (marks as SUBMITTED)
const submitAttempt = async (req, res, next) => {
    try {
        const { attemptId } = req.params;
        const studentId = req.user.id;

        const attempt = await prisma.examAttempt.findFirst({
            where: { id: attemptId, studentId, status: 'IN_PROGRESS' },
            include: {
                exam: {
                    include: {
                        examQuestions: {
                            include: { question: { include: { options: true } } },
                        },
                    },
                },
                studentAnswers: true,
            },
        });

        if (!attempt) throw new AppError('Attempt not found or already submitted', 404);

        // ── Auto-grade MCQ / TRUE_FALSE ────────────────────────────────────
        let totalScore = 0;
        const examTotalMarks = attempt.exam.examQuestions.reduce((sum, eq) => sum + eq.question.marks, 0);

        const gradedAnswers = [];
        for (const ans of attempt.studentAnswers) {
            const examQuestion = attempt.exam.examQuestions.find((eq) => eq.question.id === ans.questionId);
            if (!examQuestion) continue;
            const question = examQuestion.question;

            let isCorrect = null;
            let marksAwarded = 0;

            if (['MCQ_SINGLE', 'TRUE_FALSE'].includes(question.questionType)) {
                if (ans.selectedOptionId) {
                    const selectedOption = question.options.find((o) => o.id === ans.selectedOptionId);
                    isCorrect = selectedOption?.isCorrect || false;
                    if (isCorrect) {
                        marksAwarded = question.marks;
                        totalScore += marksAwarded;
                    } else if (attempt.exam.negativeMarking) {
                        marksAwarded = -attempt.exam.negativeMarkValue;
                        totalScore += marksAwarded;
                    }
                }
            } else if (question.questionType === 'MCQ_MULTIPLE') {
                // All correct options must be selected, none wrong
                const correctOptionIds = question.options.filter((o) => o.isCorrect).map((o) => o.id);
                // For simplicity, mark as pending manual grading if multi-select
                isCorrect = null;
                marksAwarded = 0;
            } else {
                // SHORT_ANSWER / FILL_IN_THE_BLANK — pending manual grading
                isCorrect = null;
                marksAwarded = 0;
            }

            gradedAnswers.push({
                id: ans.id,
                isCorrect,
                marksAwarded,
            });
        }

        // Batch update graded answers
        await Promise.all(
            gradedAnswers.map((ga) =>
                prisma.studentAnswer.update({
                    where: { id: ga.id },
                    data: { isCorrect: ga.isCorrect, marksAwarded: ga.marksAwarded },
                })
            )
        );

        // Calculate final percentage
        const percentage = examTotalMarks > 0 ? (totalScore / examTotalMarks) * 100 : 0;
        const result = percentage >= attempt.exam.passingPercentage ? 'PASS' : 'FAIL';

        // Update attempt as SUBMITTED
        const updatedAttempt = await prisma.examAttempt.update({
            where: { id: attemptId },
            data: {
                status: 'SUBMITTED',
                submittedAt: new Date(),
                totalScore,
                percentage,
                result,
            },
        });

        // Feature 9: Calculate risk score async (don't block response)
        calculateRiskScore(attemptId).catch((e) => console.error('[RiskScore]', e.message));

        res.json({
            success: true,
            data: {
                attemptId,
                totalScore,
                percentage: parseFloat(percentage.toFixed(2)),
                result,
                examTotalMarks,
                showResultImmediately: attempt.exam.showResultImmediately,
            },
        });
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/attempts/:attemptId ────────────────────────────────────────────
// Get attempt result details
const getAttemptResult = async (req, res, next) => {
    try {
        const { attemptId } = req.params;
        const studentId = req.user.id;

        const attempt = await prisma.examAttempt.findFirst({
            where: { id: attemptId, studentId },
            include: {
                exam: { select: { title: true, totalMarks: true, passingPercentage: true, showResultImmediately: true } },
                studentAnswers: {
                    include: {
                        question: { select: { questionText: true, questionType: true, marks: true, explanation: true } },
                        selectedOption: { select: { optionText: true, isCorrect: true } },
                    },
                },
            },
        });

        if (!attempt) throw new AppError('Attempt not found', 404);

        res.json({ success: true, data: attempt });
    } catch (err) {
        next(err);
    }
};

module.exports = { getAssignedExams, startAttempt, saveAnswer, submitAttempt, getAttemptResult };
