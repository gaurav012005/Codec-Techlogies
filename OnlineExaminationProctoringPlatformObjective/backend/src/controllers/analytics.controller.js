// ============================================
// Analytics Controller — Feature 12
// Admin & Examiner Evaluation Dashboards
// ============================================

const prisma = require('../config/db');
const { AppError } = require('../middleware/error.middleware');

// ─── GET /api/analytics/dashboard ────────────────────────────────────────────
// Aggregate dashboard statistics
const getDashboardAnalytics = async (req, res, next) => {
    try {
        // Total counts
        const [totalStudents, totalExaminers, totalExams, totalQuestions, totalAttempts] =
            await Promise.all([
                prisma.user.count({ where: { role: 'STUDENT', isActive: true } }),
                prisma.user.count({ where: { role: 'EXAMINER', isActive: true } }),
                prisma.exam.count(),
                prisma.question.count(),
                prisma.examAttempt.count({ where: { status: { in: ['SUBMITTED', 'AUTO_SUBMITTED'] } } }),
            ]);

        // Pass/Fail stats
        const passCount = await prisma.examAttempt.count({
            where: { status: { in: ['SUBMITTED', 'AUTO_SUBMITTED'] }, result: 'PASS' },
        });
        const failCount = await prisma.examAttempt.count({
            where: { status: { in: ['SUBMITTED', 'AUTO_SUBMITTED'] }, result: 'FAIL' },
        });

        // Average score across all attempts
        const scoreAgg = await prisma.examAttempt.aggregate({
            where: { status: { in: ['SUBMITTED', 'AUTO_SUBMITTED'] } },
            _avg: { percentage: true, totalScore: true },
            _max: { percentage: true },
            _min: { percentage: true },
        });

        // Recent exams with attempt counts
        const recentExams = await prisma.exam.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                createdBy: { select: { name: true } },
                _count: { select: { examAttempts: true, examQuestions: true } },
            },
        });

        // Subject-wise performance
        const examsBySubject = await prisma.exam.groupBy({
            by: ['subjectCategory'],
            _count: { id: true },
        });

        // Score distribution (for histogram)
        const allPercentages = await prisma.examAttempt.findMany({
            where: { status: { in: ['SUBMITTED', 'AUTO_SUBMITTED'] }, percentage: { not: null } },
            select: { percentage: true },
        });

        const distribution = [
            { range: '0-20%', count: 0 },
            { range: '21-40%', count: 0 },
            { range: '41-60%', count: 0 },
            { range: '61-80%', count: 0 },
            { range: '81-100%', count: 0 },
        ];

        allPercentages.forEach(({ percentage }) => {
            if (percentage <= 20) distribution[0].count++;
            else if (percentage <= 40) distribution[1].count++;
            else if (percentage <= 60) distribution[2].count++;
            else if (percentage <= 80) distribution[3].count++;
            else distribution[4].count++;
        });

        // Pending grading count
        const pendingGrading = await prisma.studentAnswer.count({
            where: {
                isCorrect: null,
                question: {
                    questionType: { in: ['SHORT_ANSWER', 'FILL_IN_THE_BLANK', 'MCQ_MULTIPLE'] },
                },
                attempt: { status: { in: ['SUBMITTED', 'AUTO_SUBMITTED'] } },
            },
        });

        res.json({
            success: true,
            data: {
                overview: {
                    totalStudents,
                    totalExaminers,
                    totalExams,
                    totalQuestions,
                    totalAttempts,
                    passCount,
                    failCount,
                    passRate: totalAttempts > 0 ? parseFloat(((passCount / totalAttempts) * 100).toFixed(2)) : 0,
                    avgPercentage: parseFloat((scoreAgg._avg.percentage || 0).toFixed(2)),
                    avgScore: parseFloat((scoreAgg._avg.totalScore || 0).toFixed(2)),
                    highestPercentage: scoreAgg._max.percentage || 0,
                    lowestPercentage: scoreAgg._min.percentage || 0,
                    pendingGrading,
                },
                scoreDistribution: distribution,
                recentExams: recentExams.map((e) => ({
                    id: e.id,
                    title: e.title,
                    subject: e.subjectCategory,
                    status: e.status,
                    createdBy: e.createdBy.name,
                    attemptCount: e._count.examAttempts,
                    questionCount: e._count.examQuestions,
                    createdAt: e.createdAt,
                })),
                examsBySubject: examsBySubject.map((s) => ({
                    subject: s.subjectCategory,
                    examCount: s._count.id,
                })),
            },
        });
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/analytics/exam/:examId ─────────────────────────────────────────
// Detailed analytics for a single exam
const getExamAnalytics = async (req, res, next) => {
    try {
        const { examId } = req.params;

        const exam = await prisma.exam.findUnique({
            where: { id: examId },
            include: {
                createdBy: { select: { name: true } },
                examQuestions: {
                    include: {
                        question: {
                            include: { options: true },
                        },
                    },
                    orderBy: { sortOrder: 'asc' },
                },
            },
        });

        if (!exam) throw new AppError('Exam not found', 404);

        // Get all submitted attempts
        const attempts = await prisma.examAttempt.findMany({
            where: { examId, status: { in: ['SUBMITTED', 'AUTO_SUBMITTED'] } },
            include: {
                student: { select: { id: true, name: true, email: true } },
                studentAnswers: {
                    include: { question: { select: { questionType: true, marks: true } } },
                },
            },
            orderBy: { totalScore: 'desc' },
        });

        // Toppers list (top 10)
        const toppers = attempts.slice(0, 10).map((a, idx) => ({
            rank: idx + 1,
            studentId: a.student.id,
            studentName: a.student.name,
            studentEmail: a.student.email,
            score: a.totalScore,
            percentage: a.percentage,
            result: a.result,
            timeTaken: a.submittedAt
                ? Math.round((new Date(a.submittedAt) - new Date(a.startedAt)) / 60000)
                : null,
        }));

        // Per-question accuracy
        const questionAccuracy = [];
        for (const eq of exam.examQuestions) {
            const q = eq.question;
            const answersForQ = [];
            for (const attempt of attempts) {
                const ans = attempt.studentAnswers.find((sa) => sa.questionId === q.id);
                if (ans) answersForQ.push(ans);
            }

            const total = answersForQ.length;
            const correct = answersForQ.filter((a) => a.isCorrect === true).length;
            const wrong = answersForQ.filter((a) => a.isCorrect === false).length;
            const pending = answersForQ.filter((a) => a.isCorrect === null).length;
            const skipped = attempts.length - total;

            questionAccuracy.push({
                questionId: q.id,
                questionText: q.questionText.substring(0, 100) + (q.questionText.length > 100 ? '...' : ''),
                questionType: q.questionType,
                difficultyLevel: q.difficultyLevel,
                marks: q.marks,
                totalResponses: total,
                correct,
                wrong,
                pending,
                skipped,
                accuracyRate: total > 0 ? parseFloat(((correct / total) * 100).toFixed(2)) : 0,
            });
        }

        // Score distribution for this specific exam
        const distribution = [
            { range: '0-20%', count: 0 },
            { range: '21-40%', count: 0 },
            { range: '41-60%', count: 0 },
            { range: '61-80%', count: 0 },
            { range: '81-100%', count: 0 },
        ];

        attempts.forEach(({ percentage }) => {
            if (!percentage) return;
            if (percentage <= 20) distribution[0].count++;
            else if (percentage <= 40) distribution[1].count++;
            else if (percentage <= 60) distribution[2].count++;
            else if (percentage <= 80) distribution[3].count++;
            else distribution[4].count++;
        });

        // Average stats
        const scores = attempts.map((a) => a.totalScore || 0);
        const percentages = attempts.map((a) => a.percentage || 0);
        const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

        res.json({
            success: true,
            data: {
                exam: {
                    id: exam.id,
                    title: exam.title,
                    subject: exam.subjectCategory,
                    totalMarks: exam.totalMarks,
                    passingPercentage: exam.passingPercentage,
                    durationMinutes: exam.durationMinutes,
                    questionCount: exam.examQuestions.length,
                    createdBy: exam.createdBy.name,
                    adaptiveMode: exam.adaptiveMode,
                },
                stats: {
                    totalAttempts: attempts.length,
                    avgScore: parseFloat(avg(scores).toFixed(2)),
                    avgPercentage: parseFloat(avg(percentages).toFixed(2)),
                    maxScore: scores.length ? Math.max(...scores) : 0,
                    minScore: scores.length ? Math.min(...scores) : 0,
                    passCount: attempts.filter((a) => a.result === 'PASS').length,
                    failCount: attempts.filter((a) => a.result === 'FAIL').length,
                    passRate: attempts.length > 0
                        ? parseFloat(
                            ((attempts.filter((a) => a.result === 'PASS').length / attempts.length) * 100).toFixed(2)
                        )
                        : 0,
                },
                scoreDistribution: distribution,
                toppers,
                questionAccuracy,
            },
        });
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/analytics/grading-queue ────────────────────────────────────────
// Returns short-answer / essay answers pending manual grading
const getGradingQueue = async (req, res, next) => {
    try {
        const { examId, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {
            isCorrect: null,
            question: {
                questionType: { in: ['SHORT_ANSWER', 'FILL_IN_THE_BLANK', 'MCQ_MULTIPLE'] },
            },
            attempt: {
                status: { in: ['SUBMITTED', 'AUTO_SUBMITTED'] },
                ...(examId ? { examId } : {}),
            },
        };

        const [answers, total] = await Promise.all([
            prisma.studentAnswer.findMany({
                where,
                include: {
                    question: {
                        select: {
                            id: true,
                            questionText: true,
                            questionType: true,
                            marks: true,
                            correctAnswer: true,
                            difficultyLevel: true,
                        },
                    },
                    attempt: {
                        select: {
                            id: true,
                            examId: true,
                            student: { select: { id: true, name: true, email: true } },
                            exam: { select: { id: true, title: true } },
                        },
                    },
                },
                orderBy: { answeredAt: 'asc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.studentAnswer.count({ where }),
        ]);

        res.json({
            success: true,
            data: {
                answers: answers.map((a) => ({
                    answerId: a.id,
                    attemptId: a.attempt.id,
                    examId: a.attempt.examId,
                    examTitle: a.attempt.exam.title,
                    studentName: a.attempt.student.name,
                    studentEmail: a.attempt.student.email,
                    questionId: a.question.id,
                    questionText: a.question.questionText,
                    questionType: a.question.questionType,
                    maxMarks: a.question.marks,
                    correctAnswer: a.question.correctAnswer,
                    difficultyLevel: a.question.difficultyLevel,
                    studentAnswer: a.studentAnswer,
                    selectedOptionId: a.selectedOptionId,
                    examinerFeedback: a.examinerFeedback,
                    marksAwarded: a.marksAwarded,
                    answeredAt: a.answeredAt,
                })),
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (err) {
        next(err);
    }
};

// ─── PUT /api/analytics/grade/:answerId ──────────────────────────────────────
// Manually grade a single answer
const gradeAnswer = async (req, res, next) => {
    try {
        const { answerId } = req.params;
        const { marksAwarded, examinerFeedback } = req.body;

        if (marksAwarded === undefined || marksAwarded === null) {
            throw new AppError('marksAwarded is required', 400);
        }

        const answer = await prisma.studentAnswer.findUnique({
            where: { id: answerId },
            include: {
                question: { select: { marks: true } },
                attempt: { select: { id: true, examId: true } },
            },
        });

        if (!answer) throw new AppError('Answer not found', 404);

        if (marksAwarded < 0 || marksAwarded > answer.question.marks) {
            throw new AppError(`Marks must be between 0 and ${answer.question.marks}`, 400);
        }

        const isCorrect = marksAwarded > 0;

        // Update the answer
        const updated = await prisma.studentAnswer.update({
            where: { id: answerId },
            data: {
                marksAwarded: parseFloat(marksAwarded),
                isCorrect,
                examinerFeedback: examinerFeedback || null,
            },
        });

        // Recalculate attempt total score
        const attempt = await prisma.examAttempt.findUnique({
            where: { id: answer.attempt.id },
            include: {
                studentAnswers: { select: { marksAwarded: true } },
                exam: { select: { passingPercentage: true, totalMarks: true } },
            },
        });

        const totalScore = attempt.studentAnswers.reduce(
            (sum, sa) => sum + (sa.marksAwarded || 0),
            0
        );
        const examTotalMarks = attempt.exam.totalMarks || 1;
        const percentage = (totalScore / examTotalMarks) * 100;
        const result = percentage >= attempt.exam.passingPercentage ? 'PASS' : 'FAIL';

        await prisma.examAttempt.update({
            where: { id: answer.attempt.id },
            data: {
                totalScore,
                percentage: parseFloat(percentage.toFixed(2)),
                result,
            },
        });

        res.json({
            success: true,
            data: {
                answerId: updated.id,
                marksAwarded: updated.marksAwarded,
                isCorrect: updated.isCorrect,
                examinerFeedback: updated.examinerFeedback,
                updatedAttempt: {
                    totalScore,
                    percentage: parseFloat(percentage.toFixed(2)),
                    result,
                },
            },
        });
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/analytics/exams-list ───────────────────────────────────────────
// Get list of all exams for the analytics dropdown selector
const getExamsList = async (req, res, next) => {
    try {
        const exams = await prisma.exam.findMany({
            select: {
                id: true,
                title: true,
                subjectCategory: true,
                status: true,
                _count: { select: { examAttempts: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({
            success: true,
            data: exams.map((e) => ({
                id: e.id,
                title: e.title,
                subject: e.subjectCategory,
                status: e.status,
                attemptCount: e._count.examAttempts,
            })),
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getDashboardAnalytics,
    getExamAnalytics,
    getGradingQueue,
    gradeAnswer,
    getExamsList,
};
