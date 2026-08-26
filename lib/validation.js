// ============================================================
// VedaAI — Zod Validation Schemas (JavaScript)
// ============================================================

import { z } from 'zod';

// ── Question ─────────────────────────────────────────────────

export const QuestionSchema = z.object({
  id: z.string(),
  number: z.string(),
  text: z.string(),
  page: z.number().int().min(1),
  type: z.enum(['main', 'subpart']),
  marks: z.number().optional(),
});

export const QuestionExtractionResponseSchema = z.object({
  questions: z.array(QuestionSchema),
  totalPages: z.number().int().min(1),
  notes: z.string().optional(),
});

// ── Answer ───────────────────────────────────────────────────

export const BoundingBoxSchema = z.object({
  x: z.number().min(0).max(1000),
  y: z.number().min(0).max(1000),
  width: z.number().min(0).max(1000),
  height: z.number().min(0).max(1000),
});

export const AnswerRegionSchema = z.object({
  page: z.number().int().min(1),
  boundingBox: BoundingBoxSchema,
});

export const ExtractedAnswerSchema = z.object({
  id: z.string(),
  detectedQuestionNumber: z.string().nullable(),
  answerText: z.string(),
  regions: z.array(AnswerRegionSchema).min(1),
  confidence: z.number().min(0).max(1),
});

export const AnswerExtractionResponseSchema = z.object({
  answers: z.array(ExtractedAnswerSchema),
  notes: z.string().optional(),
});

// ── Mapping ───────────────────────────────────────────────────

export const MappingResultSchema = z.object({
  questionId: z.string(),
  answerId: z.string().nullable(),
  status: z.enum(['answered', 'unanswered', 'unmatched', 'uncertain']),
  confidence: z.number().min(0).max(1),
  matchMethod: z.enum(['number', 'semantic', 'positional']).nullable(),
  reasoning: z.string().optional(),
  score: z.number().optional(),
  maxMarks: z.number().optional(),
  feedback: z.string().optional(),
  evaluation: z.enum(['correct', 'partial', 'incorrect', 'unattempted']).optional(),
});

export const UnmatchedAnswerSchema = z.object({
  answerId: z.string(),
  detectedQuestionNumber: z.string(),
  answerText: z.string(),
  regions: z.array(AnswerRegionSchema).default([]),
});

export const MappingResponseSchema = z.object({
  mappings: z.array(MappingResultSchema),
  unmatchedAnswers: z.array(UnmatchedAnswerSchema).default([]),
  notes: z.string().optional(),
});

// ── Helpers ───────────────────────────────────────────────────

/**
 * Strip markdown code fences from AI output and parse JSON.
 */
export function safeParseJSON(raw) {
  // Remove ```json ... ``` or ``` ... ``` wrappers
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();

  // Try to find JSON object if wrapped in extra text
  const jsonMatch = cleaned.match(/(\{[\s\S]*\})/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1]);
  }
  return JSON.parse(cleaned);
}

export function validateQuestionExtraction(raw) {
  const result = QuestionExtractionResponseSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Question extraction validation failed: ${result.error.message}`);
  }
  return result.data;
}

export function validateAnswerExtraction(raw) {
  const result = AnswerExtractionResponseSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Answer extraction validation failed: ${result.error.message}`);
  }
  return result.data;
}

export function validateMapping(raw) {
  const result = MappingResponseSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Mapping validation failed: ${result.error.message}`);
  }
  return result.data;
}
