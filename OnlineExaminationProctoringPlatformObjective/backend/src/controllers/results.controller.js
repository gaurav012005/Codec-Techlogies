// ============================================
// Results Controller — Feature 7
// Auto-Grading & Results Engine
// ============================================

const prisma = require('../config/db');
const { AppError } = require('../middleware/error.middleware');

// ─── GET /api/results/my ──────────────────────────────────────────────────────
// Student: list all their completed attempts with results
const getMyResults = async (req, res, next) => {
    try {
        const studentId = req.user.id;

        const attempts = await prisma.examAttempt.findMany({
            where: {
                studentId,
                status: { in: ['SUBMITTED', 'AUTO_SUBMITTED'] },
            },
            include: {
                exam: {
                    select: {
                        id: true,
                        title: true,
                        subjectCategory: true,
                        totalMarks: true,
                        passingPercentage: true,
                        durationMinutes: true,
                    },
                },
            },
            orderBy: { submittedAt: 'desc' },
        });

        res.json({ success: true, data: attempts });
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/results/:attemptId ─────────────────────────────────────────────
// Get full result detail for one attempt — with per-question breakdown
const getResultDetail = async (req, res, next) => {
    try {
        const { attemptId } = req.params;
        const userId = req.user.id;

        const attempt = await prisma.examAttempt.findUnique({
            where: { id: attemptId },
            include: {
                exam: {
                    select: {
                        id: true,
                        title: true,
                        subjectCategory: true,
                        totalMarks: true,
                        passingPercentage: true,
                        durationMinutes: true,
                        showResultImmediately: true,
                        allowReview: true,
                        negativeMarking: true,
                        negativeMarkValue: true,
                    },
                },
                student: { select: { id: true, name: true, email: true } },
                studentAnswers: {
                    include: {
                        question: {
                            include: {
                                options: { orderBy: { sortOrder: 'asc' } },
                            },
                        },
                        selectedOption: { select: { id: true, optionText: true, isCorrect: true } },
                    },
                    orderBy: { answeredAt: 'asc' },
                },
            },
        });

        if (!attempt) throw new AppError('Attempt not found', 404);

        // Only owner or admin/examiner can view
        if (attempt.studentId !== userId && !['ADMIN', 'EXAMINER'].includes(req.user.role)) {
            throw new AppError('Access denied', 403);
        }

        // ── Compute stats ──────────────────────────────────────────────
        const answers = attempt.studentAnswers;
        const total = await prisma.examQuestion.count({ where: { examId: attempt.examId } });

        const answered = answers.length;
        const skipped = total - answered;
        const correct = answers.filter((a) => a.isCorrect === true).length;
        const wrong = answers.filter((a) => a.isCorrect === false).length;
        const pending = answers.filter((a) => a.isCorrect === null).length; // short answer / unauto-graded

        // Breakdown by question type
        const byType = {};
        for (const ans of answers) {
            const t = ans.question.questionType;
            if (!byType[t]) byType[t] = { correct: 0, wrong: 0, pending: 0 };
            if (ans.isCorrect === true) byType[t].correct++;
            else if (ans.isCorrect === false) byType[t].wrong++;
            else byType[t].pending++;
        }

        // Duration taken
        const durationTaken = attempt.submittedAt
            ? Math.round((new Date(attempt.submittedAt) - new Date(attempt.startedAt)) / 60000)
            : null;

        res.json({
            success: true,
            data: {
                attempt: {
                    id: attempt.id,
                    status: attempt.status,
                    result: attempt.result,
                    totalScore: attempt.totalScore,
                    percentage: attempt.percentage,
                    startedAt: attempt.startedAt,
                    submittedAt: attempt.submittedAt,
                    durationTakenMinutes: durationTaken,
                },
                exam: attempt.exam,
                student: attempt.student,
                stats: {
                    totalQuestions: total,
                    answered,
                    skipped,
                    correct,
                    wrong,
                    pending,
                    byType,
                },
                answers: attempt.exam.showResultImmediately || attempt.exam.allowReview
                    ? answers.map((a) => ({
                        questionId: a.questionId,
                        questionText: a.question.questionText,
                        questionType: a.question.questionType,
                        marks: a.question.marks,
                        marksAwarded: a.marksAwarded,
                        isCorrect: a.isCorrect,
                        studentAnswer: a.studentAnswer,
                        selectedOption: a.selectedOption,
                        correctOptions: a.question.options
                            .filter((o) => o.isCorrect)
                            .map((o) => ({ id: o.id, optionText: o.optionText })),
                        allOptions: a.question.options.map((o) => ({
                            id: o.id,
                            optionText: o.optionText,
                            isCorrect: o.isCorrect,
                        })),
                        explanation: a.question.explanation,
                    }))
                    : [],
            },
        });
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/results/exam/:examId/leaderboard ────────────────────────────────
// Admin/Examiner: top scorers for an exam
const getLeaderboard = async (req, res, next) => {
    try {
        const { examId } = req.params;

        const attempts = await prisma.examAttempt.findMany({
            where: {
                examId,
                status: { in: ['SUBMITTED', 'AUTO_SUBMITTED'] },
            },
            include: {
                student: { select: { id: true, name: true, email: true, avatarUrl: true } },
            },
            orderBy: { totalScore: 'desc' },
            take: 20,
        });

        const leaderboard = attempts.map((a, idx) => ({
            rank: idx + 1,
            studentName: a.student.name,
            studentEmail: a.student.email,
            score: a.totalScore,
            percentage: a.percentage,
            result: a.result,
            timeTaken: a.submittedAt
                ? Math.round((new Date(a.submittedAt) - new Date(a.startedAt)) / 60000)
                : null,
        }));

        res.json({ success: true, data: leaderboard });
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/results/exam/:examId/stats ─────────────────────────────────────
// Admin/Examiner: aggregate stats for an exam
const getExamStats = async (req, res, next) => {
    try {
        const { examId } = req.params;

        const attempts = await prisma.examAttempt.findMany({
            where: { examId, status: { in: ['SUBMITTED', 'AUTO_SUBMITTED'] } },
            select: { totalScore: true, percentage: true, result: true },
        });

        if (attempts.length === 0) {
            return res.json({
                success: true,
                data: { totalAttempts: 0, avgScore: 0, avgPercentage: 0, passCount: 0, failCount: 0, passRate: 0 },
            });
        }

        const scores = attempts.map((a) => a.totalScore || 0);
        const percentages = attempts.map((a) => a.percentage || 0);
        const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
        const passCount = attempts.filter((a) => a.result === 'PASS').length;

        res.json({
            success: true,
            data: {
                totalAttempts: attempts.length,
                avgScore: parseFloat(avg(scores).toFixed(2)),
                avgPercentage: parseFloat(avg(percentages).toFixed(2)),
                maxScore: Math.max(...scores),
                minScore: Math.min(...scores),
                passCount,
                failCount: attempts.length - passCount,
                passRate: parseFloat(((passCount / attempts.length) * 100).toFixed(2)),
            },
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { getMyResults, getResultDetail, getLeaderboard, getExamStats };
