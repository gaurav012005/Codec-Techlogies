// ============================================
// Plagiarism Detection Controller — Feature 13
// Cosine Similarity & Jaccard Index
// ============================================

const prisma = require('../config/db');
const { AppError } = require('../middleware/error.middleware');

// ─── NLP Utilities ───────────────────────────────────────────────────────────

/**
 * Tokenize text: lowercase, remove punctuation, split into words
 */
function tokenize(text) {
    if (!text) return [];
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 1); // remove single chars
}

/**
 * Build term frequency vector from tokens
 */
function termFrequency(tokens) {
    const tf = {};
    tokens.forEach((t) => {
        tf[t] = (tf[t] || 0) + 1;
    });
    return tf;
}

/**
 * Cosine Similarity between two term-frequency vectors
 * Range: 0 (completely different) to 1 (identical)
 */
function cosineSimilarity(tf1, tf2) {
    const allTerms = new Set([...Object.keys(tf1), ...Object.keys(tf2)]);
    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;

    allTerms.forEach((term) => {
        const a = tf1[term] || 0;
        const b = tf2[term] || 0;
        dotProduct += a * b;
        mag1 += a * a;
        mag2 += b * b;
    });

    if (mag1 === 0 || mag2 === 0) return 0;
    return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
}

/**
 * Jaccard Index between two token sets
 * Range: 0 (no overlap) to 1 (identical)
 */
function jaccardIndex(tokens1, tokens2) {
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);
    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    if (union.size === 0) return 0;
    return intersection.size / union.size;
}

/**
 * Compare two answers and return similarity metrics
 */
function compareAnswers(text1, text2) {
    const tokens1 = tokenize(text1);
    const tokens2 = tokenize(text2);

    if (tokens1.length < 3 || tokens2.length < 3) {
        // Too short to be meaningful — skip
        return null;
    }

    const tf1 = termFrequency(tokens1);
    const tf2 = termFrequency(tokens2);

    const cosine = cosineSimilarity(tf1, tf2);
    const jaccard = jaccardIndex(tokens1, tokens2);
    const avg = (cosine + jaccard) / 2;

    return {
        cosineSimilarity: parseFloat(cosine.toFixed(4)),
        jaccardIndex: parseFloat(jaccard.toFixed(4)),
        avgSimilarity: parseFloat(avg.toFixed(4)),
    };
}

// ─── POST /api/plagiarism/run/:examId ────────────────────────────────────────
// Run plagiarism detection across all short-answer submissions for an exam
const runPlagiarismCheck = async (req, res, next) => {
    try {
        const { examId } = req.params;
        const { threshold = 0.7 } = req.body;

        // Verify exam exists
        const exam = await prisma.exam.findUnique({ where: { id: examId } });
        if (!exam) throw new AppError('Exam not found', 404);

        // Get all submitted attempts with short-answer/text answers
        const attempts = await prisma.examAttempt.findMany({
            where: {
                examId,
                status: { in: ['SUBMITTED', 'AUTO_SUBMITTED'] },
            },
            include: {
                student: { select: { id: true, name: true } },
                studentAnswers: {
                    where: {
                        studentAnswer: { not: null },
                        question: {
                            questionType: { in: ['SHORT_ANSWER', 'FILL_IN_THE_BLANK'] },
                        },
                    },
                    include: {
                        question: {
                            select: { id: true, questionText: true, questionType: true },
                        },
                    },
                },
            },
        });

        // Group answers by questionId
        const answersByQuestion = {};
        attempts.forEach((attempt) => {
            attempt.studentAnswers.forEach((sa) => {
                if (!sa.studentAnswer || sa.studentAnswer.trim().length < 10) return; // skip very short
                if (!answersByQuestion[sa.questionId]) {
                    answersByQuestion[sa.questionId] = [];
                }
                answersByQuestion[sa.questionId].push({
                    studentId: attempt.student.id,
                    studentName: attempt.student.name,
                    questionId: sa.questionId,
                    questionText: sa.question.questionText,
                    answer: sa.studentAnswer,
                });
            });
        });

        // Compare all pairs per question
        const flaggedPairs = [];
        let totalPairsChecked = 0;

        for (const questionId of Object.keys(answersByQuestion)) {
            const answers = answersByQuestion[questionId];
            for (let i = 0; i < answers.length; i++) {
                for (let j = i + 1; j < answers.length; j++) {
                    totalPairsChecked++;
                    const result = compareAnswers(answers[i].answer, answers[j].answer);
                    if (!result) continue;

                    if (result.avgSimilarity >= threshold) {
                        flaggedPairs.push({
                            questionId,
                            studentAId: answers[i].studentId,
                            studentBId: answers[j].studentId,
                            answerAText: answers[i].answer,
                            answerBText: answers[j].answer,
                            cosineSimilarity: result.cosineSimilarity,
                            jaccardIndex: result.jaccardIndex,
                            avgSimilarity: result.avgSimilarity,
                        });
                    }
                }
            }
        }

        // Store report in DB
        const report = await prisma.plagiarismReport.create({
            data: {
                examId,
                totalPairs: totalPairsChecked,
                flaggedPairs: flaggedPairs.length,
                threshold: parseFloat(threshold),
                status: 'COMPLETED',
                flags: {
                    create: flaggedPairs.map((f) => ({
                        questionId: f.questionId,
                        studentAId: f.studentAId,
                        studentBId: f.studentBId,
                        answerAText: f.answerAText,
                        answerBText: f.answerBText,
                        cosineSimilarity: f.cosineSimilarity,
                        jaccardIndex: f.jaccardIndex,
                        avgSimilarity: f.avgSimilarity,
                    })),
                },
            },
            include: { flags: true },
        });

        res.json({
            success: true,
            data: {
                reportId: report.id,
                examId,
                totalPairsChecked,
                flaggedCount: flaggedPairs.length,
                threshold,
                status: 'COMPLETED',
                runAt: report.runAt,
            },
        });
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/plagiarism/report/:examId ──────────────────────────────────────
// Get the latest plagiarism report for an exam
const getPlagiarismReport = async (req, res, next) => {
    try {
        const { examId } = req.params;

        const report = await prisma.plagiarismReport.findFirst({
            where: { examId },
            orderBy: { runAt: 'desc' },
            include: {
                flags: {
                    orderBy: { avgSimilarity: 'desc' },
                },
            },
        });

        if (!report) {
            return res.json({
                success: true,
                data: null,
                message: 'No plagiarism report found for this exam. Run a check first.',
            });
        }

        // Enrich with student names
        const studentIds = new Set();
        report.flags.forEach((f) => {
            studentIds.add(f.studentAId);
            studentIds.add(f.studentBId);
        });

        const students = await prisma.user.findMany({
            where: { id: { in: Array.from(studentIds) } },
            select: { id: true, name: true, email: true },
        });

        const studentMap = {};
        students.forEach((s) => { studentMap[s.id] = s; });

        // Enrich with question texts
        const questionIds = new Set(report.flags.map((f) => f.questionId));
        const questions = await prisma.question.findMany({
            where: { id: { in: Array.from(questionIds) } },
            select: { id: true, questionText: true },
        });
        const questionMap = {};
        questions.forEach((q) => { questionMap[q.id] = q.questionText; });

        res.json({
            success: true,
            data: {
                reportId: report.id,
                examId: report.examId,
                totalPairs: report.totalPairs,
                flaggedPairs: report.flaggedPairs,
                threshold: report.threshold,
                status: report.status,
                runAt: report.runAt,
                flags: report.flags.map((f) => ({
                    id: f.id,
                    questionId: f.questionId,
                    questionText: questionMap[f.questionId] || '',
                    studentA: {
                        id: f.studentAId,
                        name: studentMap[f.studentAId]?.name || 'Unknown',
                        email: studentMap[f.studentAId]?.email || '',
                    },
                    studentB: {
                        id: f.studentBId,
                        name: studentMap[f.studentBId]?.name || 'Unknown',
                        email: studentMap[f.studentBId]?.email || '',
                    },
                    answerA: f.answerAText,
                    answerB: f.answerBText,
                    cosineSimilarity: f.cosineSimilarity,
                    jaccardIndex: f.jaccardIndex,
                    avgSimilarity: f.avgSimilarity,
                    verdict: f.verdict,
                    adminNotes: f.adminNotes,
                    reviewedAt: f.reviewedAt,
                })),
            },
        });
    } catch (err) {
        next(err);
    }
};

// ─── PUT /api/plagiarism/verdict/:flagId ─────────────────────────────────────
// Admin sets verdict for a flagged pair
const setVerdict = async (req, res, next) => {
    try {
        const { flagId } = req.params;
        const { verdict, adminNotes } = req.body;

        if (!['CLEARED', 'CONFIRMED_CHEATING'].includes(verdict)) {
            throw new AppError('Invalid verdict. Must be CLEARED or CONFIRMED_CHEATING', 400);
        }

        const flag = await prisma.plagiarismFlag.findUnique({ where: { id: flagId } });
        if (!flag) throw new AppError('Flag not found', 404);

        const updated = await prisma.plagiarismFlag.update({
            where: { id: flagId },
            data: {
                verdict,
                adminNotes: adminNotes || null,
                reviewedAt: new Date(),
            },
        });

        res.json({
            success: true,
            data: {
                id: updated.id,
                verdict: updated.verdict,
                adminNotes: updated.adminNotes,
                reviewedAt: updated.reviewedAt,
            },
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { runPlagiarismCheck, getPlagiarismReport, setVerdict };
