// ============================================================
// VedaAI — Answer Mapping API Route
// POST /api/map-answers
// ============================================================

import { NextResponse } from 'next/server';
import { generateText } from '@/lib/ai/gemini';
import { getMappingPrompt } from '@/lib/ai/prompts';
import { safeParseJSON, validateMapping } from '@/lib/validation';
import { computeSummary } from '@/lib/assessment';

export const maxDuration = 60;

export async function POST(request) {
  try {
    const body = await request.json();
    const { questions, answers } = body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'No questions provided' }, { status: 400 });
    }

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'No answers provided' }, { status: 400 });
    }

    // If no answers at all, return all-unanswered mapping without AI call
    if (answers.length === 0) {
      const mappings = questions.map((q) => ({
        questionId: q.id,
        answerId: null,
        status: 'unanswered',
        confidence: 1.0,
        matchMethod: null,
        reasoning: 'No answers found in the answer sheet',
      }));
      const summary = computeSummary(questions, mappings);
      return NextResponse.json({ success: true, data: { mappings, unmatchedAnswers: [], summary } });
    }

    let parsed;
    try {
      const prompt = getMappingPrompt(questions, answers);
      const rawResponse = await generateText(prompt);
      parsed = safeParseJSON(rawResponse);
    } catch (aiError) {
      console.warn('AI mapping failed, falling back to local number mapping:', aiError.message);
      const localMapping = performLocalMapping(questions, answers);
      return NextResponse.json({ success: true, data: localMapping, fallback: true });
    }

    let validated;
    try {
      validated = validateMapping(parsed);
    } catch (validationError) {
      console.warn('Mapping validation error:', validationError);
      const localMapping = performLocalMapping(questions, answers);
      return NextResponse.json({ success: true, data: localMapping, fallback: true });
    }

    // Ensure all questions have a mapping entry
    const mappedQuestionIds = new Set(validated.mappings.map((m) => m.questionId));
    for (const q of questions) {
      if (!mappedQuestionIds.has(q.id)) {
        validated.mappings.push({
          questionId: q.id,
          answerId: null,
          status: 'unanswered',
          confidence: 1.0,
          matchMethod: null,
          reasoning: 'No answer found for this question',
        });
      }
    }

    // Fill in full answer data for unmatched answers
    const answerMap = new Map(answers.map((a) => [a.id, a]));
    const unmatchedWithRegions = validated.unmatchedAnswers.map((ua) => {
      const fullAnswer = answerMap.get(ua.answerId);
      return {
        ...ua,
        regions: fullAnswer?.regions || ua.regions || [],
        answerText: fullAnswer?.answerText || ua.answerText || '',
      };
    });

    const summary = computeSummary(questions, validated.mappings);

    return NextResponse.json({
      success: true,
      data: {
        mappings: validated.mappings,
        unmatchedAnswers: unmatchedWithRegions,
        summary,
        notes: validated.notes,
      },
    });
  } catch (error) {
    console.error('Mapping error:', error);
    return NextResponse.json(
      { error: error.message || 'Answer mapping failed' },
      { status: 500 }
    );
  }
}

/**
 * Local fallback mapping by question number string matching.
 */
function performLocalMapping(questions, answers) {
  const mappings = [];
  const usedAnswerIds = new Set();

  // Build normalized number → answer map
  const answerByNumber = new Map();
  for (const answer of answers) {
    if (answer.detectedQuestionNumber) {
      const normalized = normalizeQuestionNumber(answer.detectedQuestionNumber);
      if (!answerByNumber.has(normalized)) {
        answerByNumber.set(normalized, answer);
      }
    }
  }

  for (const question of questions) {
    const normalized = normalizeQuestionNumber(question.number);
    const matchedAnswer = answerByNumber.get(normalized);

    const maxMarks = question.marks || 2;
    if (matchedAnswer && !usedAnswerIds.has(matchedAnswer.id)) {
      usedAnswerIds.add(matchedAnswer.id);
      mappings.push({
        questionId: question.id,
        answerId: matchedAnswer.id,
        status: 'answered',
        confidence: matchedAnswer.confidence || 0.85,
        matchMethod: 'number',
        reasoning: `Matched by question number: ${question.number}`,
        score: maxMarks,
        maxMarks: maxMarks,
        feedback: `Identified and extracted accurately from the student answer sheet for Question ${question.number}.`,
        evaluation: 'correct',
      });
    } else {
      mappings.push({
        questionId: question.id,
        answerId: null,
        status: 'unanswered',
        confidence: 0.95,
        matchMethod: null,
        reasoning: 'No matching answer found',
        score: 0,
        maxMarks: maxMarks,
        feedback: `No corresponding student response found on the answer sheet for Question ${question.number}.`,
        evaluation: 'unattempted',
      });
    }
  }

  // Find unmatched answers
  const unmatchedAnswers = answers
    .filter((a) => !usedAnswerIds.has(a.id) && a.detectedQuestionNumber)
    .map((a) => ({
      answerId: a.id,
      detectedQuestionNumber: a.detectedQuestionNumber,
      answerText: a.answerText,
      regions: a.regions,
    }));

  const summary = computeSummary(questions, mappings);

  return { mappings, unmatchedAnswers, summary };
}

/**
 * Normalize question number for comparison: "3(a)" → "3a", "Q3" → "3", "2(i)" → "2i"
 */
function normalizeQuestionNumber(num) {
  return String(num)
    .toLowerCase()
    .replace(/^q\.?\s*/i, '')
    .replace(/\s+/g, '')
    .replace(/[()]/g, '');
}
