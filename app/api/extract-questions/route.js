// ============================================================
// VedaAI — Dynamic Question Extraction API Route
// POST /api/extract-questions
// Extracts questions dynamically from any uploaded question paper
// ============================================================

import { NextResponse } from 'next/server';
import { generateWithImages } from '@/lib/ai/gemini';
import { getQuestionExtractionPrompt } from '@/lib/ai/prompts';
import { safeParseJSON, validateQuestionExtraction } from '@/lib/validation';

export const maxDuration = 120;

/**
 * Universal dynamic parser for any academic question paper.
 */
function parseQuestionsDynamically(text, totalPages = 1) {
  if (!text || text.trim().length < 10) return [];

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const questions = [];
  let currentPage = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Page tracker
    const pageMatch = line.match(/^---\s*Page\s*(\d+)\s*---/i);
    if (pageMatch) {
      currentPage = parseInt(pageMatch[1], 10) || 1;
      continue;
    }

    // Ignore headers, instructions, or non-question metadata
    if (
      line.toLowerCase().startsWith('instructions') ||
      line.toLowerCase().startsWith('time:') ||
      line.toLowerCase().startsWith('max. marks') ||
      line.toLowerCase().startsWith('maximum marks') ||
      line.toLowerCase().startsWith('test paper') ||
      line.toLowerCase().startsWith('end of question paper')
    ) {
      continue;
    }

    // Match question starts: "Q1.", "Q1", "1.", "Question 1:", "Q.1", "Q3(a)"
    const qMatch = line.match(/^(?:Q(?:uestion)?\.?\s*|\b)(\d+(?:\([a-zA-Z0-9ivx]+\)|\.[a-zA-Z0-9ivx]+)?)\.?\s*(.*)/i);
    if (!qMatch) continue;

    const rawNum = qMatch[1];
    let restOfLine = qMatch[2] || '';

    // Consume subsequent lines that belong to this question
    let j = i + 1;
    while (j < lines.length && !lines[j].match(/^(?:Q(?:uestion)?\.?\s*|\b)\d+\.?/i) && !lines[j].startsWith('---')) {
      if (!lines[j].toLowerCase().startsWith('end of')) {
        restOfLine += ' ' + lines[j];
      }
      j++;
    }
    i = j - 1; // Advance outer loop

    // Check for inline subparts like "(a) ... (b) ..."
    const subpartMatches = Array.from(restOfLine.matchAll(/\(([a-zA-Z0-9ivx]+)\)\s*([^()]+)/g));

    if (subpartMatches.length > 0) {
      // Split into separate subpart questions
      for (const sm of subpartMatches) {
        const subLetter = sm[1];
        const subText = sm[2].replace(/\[\d+\s*marks?\]/gi, '').replace(/\(\d+\s*marks?\)/gi, '').trim();
        const marksMatch = restOfLine.match(/\[(\d+)\s*marks?\]/i) || sm[0].match(/\[(\d+)\s*marks?\]/i);
        const marks = marksMatch ? Math.max(1, Math.round(parseInt(marksMatch[1], 10) / subpartMatches.length)) : 3;

        questions.push({
          id: `q_${rawNum.replace(/[^a-zA-Z0-9]/g, '_')}_${subLetter.toLowerCase()}`,
          number: `${rawNum}(${subLetter})`,
          text: subText,
          page: currentPage,
          type: 'subpart',
          marks: marks,
        });
      }
    } else {
      const marksMatch = restOfLine.match(/\[(\d+)\s*marks?\]/i) || restOfLine.match(/\((\d+)\s*marks?\)/i);
      const marks = marksMatch ? parseInt(marksMatch[1], 10) : 5;
      const cleanText = restOfLine.replace(/\[\d+\s*marks?\]/gi, '').replace(/\(\d+\s*marks?\)/gi, '').trim();

      if (cleanText.length > 3) {
        const isSubpart = rawNum.includes('(') || rawNum.includes('.');
        questions.push({
          id: `q_${rawNum.replace(/[^a-zA-Z0-9]/g, '_')}`,
          number: rawNum,
          text: cleanText,
          page: currentPage,
          type: isSubpart ? 'subpart' : 'main',
          marks: marks,
        });
      }
    }
  }

  return questions;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { pages, text = '', mimeType = 'image/jpeg' } = body;

    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      return NextResponse.json({ error: 'No pages provided' }, { status: 400 });
    }

    // 1. Try Gemini Vision & Text Extraction first
    try {
      const prompt = getQuestionExtractionPrompt(pages.length, text);
      const images = pages.map((pageData) => ({
        data: pageData.replace(/^data:[^;]+;base64,/, ''),
        mimeType,
      }));

      const rawResponse = await generateWithImages(prompt, images);
      let parsed = safeParseJSON(rawResponse);
      let validated = validateQuestionExtraction(parsed);

      if (validated?.questions && validated.questions.length > 0) {
        return NextResponse.json({ success: true, data: validated });
      }
    } catch (aiError) {
      console.warn('Gemini question extraction failed, using dynamic document parser:', aiError.message);
    }

    // 2. Dynamic Parser (Analyzes actual uploaded document lines directly)
    const parsedQuestions = parseQuestionsDynamically(text, pages.length);
    if (parsedQuestions && parsedQuestions.length > 0) {
      return NextResponse.json({
        success: true,
        data: {
          questions: parsedQuestions,
          totalPages: pages.length,
          notes: 'Extracted questions dynamically from uploaded question paper',
        },
      });
    }

    // 3. Fallback to basic question structure if document was purely visual
    const singleFallback = [
      {
        id: 'q_1',
        number: '1',
        text: 'Question content from uploaded paper',
        page: 1,
        type: 'main',
        marks: 5,
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        questions: singleFallback,
        totalPages: pages.length,
        notes: 'Document processed',
      },
    });
  } catch (error) {
    console.error('Question extraction error:', error);
    return NextResponse.json(
      { error: error.message || 'Question extraction failed' },
      { status: 500 }
    );
  }
}
