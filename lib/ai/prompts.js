// ============================================================
// VedaAI — AI Prompts
// ============================================================

/**
 * Prompt for extracting questions from a question paper.
 * @param {number} totalPages
 * @param {string} [extractedText]
 */
export function getQuestionExtractionPrompt(totalPages, extractedText = '') {
  let prompt = `You are an expert academic document analyst. Extract ALL questions from this question paper (${totalPages} page(s)).

CRITICAL RULES:
1. Extract EVERY question from the document.
2. Treat labeled subparts as SEPARATE questions (e.g. "1(a)", "1(b)", "3(a)", "2(i)" must be separate entries).
3. Preserve the EXACT original numbering and question text.
4. Extract marks for each question if available.
5. Record the page number where each question appears.

Return ONLY valid JSON matching this schema:
{
  "questions": [
    {
      "id": "q_1a",
      "number": "1(a)",
      "text": "Question text here",
      "page": 1,
      "type": "subpart",
      "marks": 2
    }
  ],
  "totalPages": ${totalPages},
  "notes": ""
}

CRITICAL: Return ONLY the JSON object. No markdown fences.`;

  if (extractedText && extractedText.trim().length > 10) {
    prompt += `\n\nDOCUMENT TEXT CONTENT:\n${extractedText.substring(0, 4000)}`;
  }

  return prompt;
}

/**
 * Prompt for extracting handwritten/typed answers from an answer sheet.
 * @param {number} totalPages
 * @param {string} [extractedText]
 */
export function getAnswerExtractionPrompt(totalPages, extractedText = '') {
  let prompt = `You are an expert at analyzing student exam answer sheets.
Analyze this answer sheet (${totalPages} page(s)) and extract ALL student answer sections.

CRITICAL RULES:
1. Detect the question number the student wrote for each answer (e.g., "1(a)", "3(a)", "4", "5", "Ans 2").
2. Extract the student's answer text.
3. Provide bounding boxes using a 0-1000 coordinate system (x, y, width, height where 0,0 is top-left, 1000,1000 is bottom-right).
4. Make bounding boxes cover the student's answer block generously.
5. Support out-of-order answers and answers across pages.

Return ONLY valid JSON matching this schema:
{
  "answers": [
    {
      "id": "ans_1",
      "detectedQuestionNumber": "3(a)",
      "answerText": "Student answer text here",
      "regions": [
        {
          "page": 1,
          "boundingBox": { "x": 50, "y": 200, "width": 900, "height": 180 }
        }
      ],
      "confidence": 0.95
    }
  ],
  "notes": ""
}

CRITICAL: Return ONLY the JSON object. No markdown fences.`;

  if (extractedText && extractedText.trim().length > 10) {
    prompt += `\n\nANSWER SHEET TEXT CONTENT:\n${extractedText.substring(0, 4000)}`;
  }

  return prompt;
}

/**
 * Prompt for mapping extracted answers to questions.
 * @param {Array} questions
 * @param {Array} answers
 */
export function getMappingPrompt(questions, answers) {
  const questionsJson = JSON.stringify(
    questions.map((q) => ({ id: q.id, number: q.number, text: q.text.substring(0, 300), marks: q.marks })),
    null,
    2
  );

  const answersJson = JSON.stringify(
    answers.map((a) => ({
      id: a.id,
      detectedQuestionNumber: a.detectedQuestionNumber,
      answerText: a.answerText.substring(0, 300),
      confidence: a.confidence,
    })),
    null,
    2
  );

  return `You are an expert at mapping student answers to exam questions and evaluating them.

QUESTIONS FROM QUESTION PAPER:
${questionsJson}

STUDENT ANSWERS:
${answersJson}

RULES:
1. Match answers to questions primarily by question number (e.g., "3(a)" matches "3(a)", "4" matches "4").
2. If student answers are out of order, match them correctly to their respective question.
3. If a question was not answered by the student, mark it status: "unanswered", score: 0.
4. For each question, provide score awarded (out of maxMarks), encouraging AI feedback, and evaluation ("correct" | "partial" | "incorrect" | "unattempted").

Return ONLY valid JSON matching this schema:
{
  "mappings": [
    {
      "questionId": "q_1",
      "answerId": "ans_1",
      "status": "answered",
      "confidence": 0.95,
      "matchMethod": "number",
      "reasoning": "Direct match for question 1",
      "score": 2,
      "maxMarks": 2,
      "feedback": "Clear and accurate response with key terminology.",
      "evaluation": "correct"
    },
    {
      "questionId": "q_2",
      "answerId": null,
      "status": "unanswered",
      "confidence": 1.0,
      "matchMethod": null,
      "reasoning": "No answer written for question 2",
      "score": 0,
      "maxMarks": 5,
      "feedback": "No corresponding student response found on the answer sheet.",
      "evaluation": "unattempted"
    }
  ],
  "unmatchedAnswers": [],
  "notes": ""
}

CRITICAL: Return ONLY the JSON object. No markdown fences.`;
}
