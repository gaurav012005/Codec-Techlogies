// ============================================
// Adaptive Question Difficulty Engine — Feature 11
// ============================================

const prisma = require('../config/db');
const { AppError } = require('../middleware/error.middleware');

// Difficulty progression map
const DIFFICULTY_LEVELS = ['EASY', 'MEDIUM', 'HARD'];

/**
 * Adjust difficulty based on correctness.
 *   correct   → move UP   (+1)
 *   incorrect → move DOWN (−1)
 */
function getNextDifficulty(current, wasCorrect) {
    const idx = DIFFICULTY_LEVELS.indexOf(current);
    if (wasCorrect) {
        return DIFFICULTY_LEVELS[Math.min(idx + 1, DIFFICULTY_LEVELS.length - 1)];
    }
    return DIFFICULTY_LEVELS[Math.max(idx - 1, 0)];
}

/**
 * Pick the best available question at or near the target difficulty.
 * Priority: exact match → one level easier → one level harder → any remaining
 */
function selectQuestion(availableQuestions, targetDifficulty) {
    // Try exact difficulty first
    let pool = availableQuestions.filter((q) => q.difficultyLevel === targetDifficulty);
    if (pool.length > 0) return pool[Math.floor(Math.random() * pool.length)];

    // Try fallback difficulties (closest first)
    const idx = DIFFICULTY_LEVELS.indexOf(targetDifficulty);
    const fallbackOrder = [];
    for (let offset = 1; offset < DIFFICULTY_LEVELS.length; offset++) {
        if (idx - offset >= 0) fallbackOrder.push(DIFFICULTY_LEVELS[idx - offset]);
        if (idx + offset < DIFFICULTY_LEVELS.length) fallbackOrder.push(DIFFICULTY_LEVELS[idx + offset]);
    }

    for (const level of fallbackOrder) {
        pool = availableQuestions.filter((q) => q.difficultyLevel === level);
        if (pool.length > 0) return pool[Math.floor(Math.random() * pool.length)];
    }

    // Absolute fallback — any remaining question
    if (availableQuestions.length > 0) {
        return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    }

    return null;
}

// ─── POST /api/attempts/:attemptId/adaptive/next ─────────────────────────────
// Returns the next question based on adaptive difficulty logic
const getNextAdaptiveQuestion = async (req, res, next) => {
    try {
        const { attemptId } = req.params;
        const { previousQuestionId, wasCorrect } = req.body;
        const studentId = req.user.id;

        // 1. Verify attempt
        const attempt = await prisma.examAttempt.findFirst({
            where: { id: attemptId, studentId, status: 'IN_PROGRESS' },
            include: {
                exam: {
                    include: {
                        examQuestions: {
                            include: {
                                question: {
                                    include: { options: { orderBy: { sortOrder: 'asc' } } },
                                },
                            },
                        },
                    },
                },
                studentAnswers: { select: { questionId: true } },
            },
        });

        if (!attempt) throw new AppError('Attempt not found or already submitted', 404);
        if (!attempt.exam.adaptiveMode) throw new AppError('This exam is not in adaptive mode', 400);

        // 2. Parse current adaptive state
        let adaptiveState = attempt.adaptiveState || {
            currentDifficulty: 'MEDIUM',
            questionHistory: [],
            answeredQuestionIds: [],
        };

        // 3. If previous question provided, grade it and adjust difficulty
        if (previousQuestionId !== undefined && wasCorrect !== undefined) {
            adaptiveState.currentDifficulty = getNextDifficulty(
                adaptiveState.currentDifficulty,
                wasCorrect
            );
            if (!adaptiveState.answeredQuestionIds.includes(previousQuestionId)) {
                adaptiveState.answeredQuestionIds.push(previousQuestionId);
            }
            adaptiveState.questionHistory.push({
                questionId: previousQuestionId,
                wasCorrect,
                difficultyAtTime: adaptiveState.currentDifficulty,
                timestamp: new Date().toISOString(),
            });
        }

        // 4. Get all exam question IDs and filter out already answered
        const allExamQuestions = attempt.exam.examQuestions.map((eq) => eq.question);
        const answeredIds = new Set([
            ...adaptiveState.answeredQuestionIds,
            ...attempt.studentAnswers.map((sa) => sa.questionId),
        ]);

        const availableQuestions = allExamQuestions.filter((q) => !answeredIds.has(q.id));

        // 5. Check if exam is complete (no more questions)
        if (availableQuestions.length === 0) {
            // Update adaptive state before returning
            await prisma.examAttempt.update({
                where: { id: attemptId },
                data: { adaptiveState },
            });

            return res.json({
                success: true,
                data: {
                    completed: true,
                    message: 'All questions have been answered',
                    totalAnswered: answeredIds.size,
                    totalQuestions: allExamQuestions.length,
                },
            });
        }

        // 6. Select next question using adaptive difficulty
        const nextQuestion = selectQuestion(availableQuestions, adaptiveState.currentDifficulty);

        // 7. Update adaptive state in DB
        await prisma.examAttempt.update({
            where: { id: attemptId },
            data: { adaptiveState },
        });

        // 8. Format question for response (strip correct answer info)
        const formattedQuestion = {
            id: nextQuestion.id,
            questionText: nextQuestion.questionText,
            questionType: nextQuestion.questionType,
            difficultyLevel: nextQuestion.difficultyLevel,
            marks: nextQuestion.marks,
            imageUrl: nextQuestion.imageUrl,
            options: nextQuestion.options.map((o) => ({
                id: o.id,
                optionText: o.optionText,
            })),
        };

        res.json({
            success: true,
            data: {
                completed: false,
                question: formattedQuestion,
                currentDifficulty: adaptiveState.currentDifficulty,
                questionsAnswered: answeredIds.size,
                totalQuestions: allExamQuestions.length,
                questionsRemaining: availableQuestions.length,
            },
        });
    } catch (err) {
        next(err);
    }
};

// ─── POST /api/attempts/:attemptId/adaptive/answer ───────────────────────────
// Save answer AND auto-grade MCQ/TF instantly for adaptive feedback
const submitAdaptiveAnswer = async (req, res, next) => {
    try {
        const { attemptId } = req.params;
        const { questionId, selectedOptionId, studentAnswer } = req.body;
        const studentId = req.user.id;

        if (!questionId) throw new AppError('questionId is required', 400);

        // Verify attempt
        const attempt = await prisma.examAttempt.findFirst({
            where: { id: attemptId, studentId, status: 'IN_PROGRESS' },
            include: {
                exam: true,
            },
        });
        if (!attempt) throw new AppError('Attempt not found or already submitted', 404);

        // Get the question with correct answers
        const question = await prisma.question.findUnique({
            where: { id: questionId },
            include: { options: true },
        });
        if (!question) throw new AppError('Question not found', 404);

        // Auto-grade for MCQ/TRUE_FALSE
        let isCorrect = null;
        let marksAwarded = 0;

        if (['MCQ_SINGLE', 'TRUE_FALSE'].includes(question.questionType)) {
            if (selectedOptionId) {
                const selectedOption = question.options.find((o) => o.id === selectedOptionId);
                isCorrect = selectedOption?.isCorrect || false;
                if (isCorrect) {
                    marksAwarded = question.marks;
                } else if (attempt.exam.negativeMarking) {
                    marksAwarded = -attempt.exam.negativeMarkValue;
                }
            } else {
                isCorrect = false;
                marksAwarded = 0;
            }
        } else if (question.questionType === 'FILL_IN_THE_BLANK') {
            // Auto-grade fill-in-the-blank by comparing with correct answer
            if (question.correctAnswer && studentAnswer) {
                isCorrect = studentAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
                marksAwarded = isCorrect ? question.marks : 0;
            }
        }
        // SHORT_ANSWER stays null (needs manual grading)

        // Upsert answer
        const saved = await prisma.studentAnswer.upsert({
            where: { attemptId_questionId: { attemptId, questionId } },
            update: {
                selectedOptionId: selectedOptionId || null,
                studentAnswer: studentAnswer || null,
                isCorrect,
                marksAwarded,
                answeredAt: new Date(),
            },
            create: {
                attemptId,
                questionId,
                selectedOptionId: selectedOptionId || null,
                studentAnswer: studentAnswer || null,
                isCorrect,
                marksAwarded,
            },
        });

        res.json({
            success: true,
            data: {
                answerId: saved.id,
                isCorrect,
                marksAwarded,
                // Return correct answer info for adaptive UI feedback
                correctOptionId: ['MCQ_SINGLE', 'TRUE_FALSE'].includes(question.questionType)
                    ? question.options.find((o) => o.isCorrect)?.id
                    : null,
            },
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { getNextAdaptiveQuestion, submitAdaptiveAnswer };
