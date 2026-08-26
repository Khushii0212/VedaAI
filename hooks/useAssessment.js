'use client';

// ============================================================
// VedaAI — Assessment State Hook
// Central state manager for the entire assessment workflow.
// ============================================================

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { validateFile, getErrorMessage } from '@/lib/errors';
import { computeSummary, generateId } from '@/lib/assessment';
import { saveToHistory } from '@/lib/history';

const INITIAL_PROCESSING_STATE = {
  stage: 'idle',
  progress: 0,
  message: '',
  error: null,
};

const STAGE_WEIGHTS = {
  'rendering-question-paper': 10,
  'extracting-questions': 30,
  'rendering-answer-sheet': 20,
  'extracting-answers': 30,
  'mapping-answers': 8,
  'preparing-results': 2,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Convert a file to base64 data URLs and extract structured multi-line text with positions.
 */
async function fileToPages(file, onProgress) {
  const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  if (!isPDF) {
    const dataUrl = await fileToDataUrl(file);
    onProgress && onProgress(1, 1);
    return { pages: [dataUrl], text: '', pageItems: [] };
  }

  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
  if (typeof window !== 'undefined' && !GlobalWorkerOptions.workerSrc) {
    GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;
  const pages = [];
  let fullText = '';
  const pageItems = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.0 });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport }).promise;

    pages.push(canvas.toDataURL('image/jpeg', 0.8));

    try {
      const textContent = await page.getTextContent();
      const lineMap = new Map();
      const itemsForThisPage = [];

      for (const item of textContent.items) {
        if (!item.str || !item.str.trim()) continue;
        const normX = Math.round((item.transform[4] / viewport.width) * 1000);
        const normY = Math.round(((viewport.height - item.transform[5]) / viewport.height) * 1000);
        
        itemsForThisPage.push({
          str: item.str,
          x: normX,
          y: normY,
          page: i,
        });

        const bucketY = Math.round(normY / 15) * 15;
        if (!lineMap.has(bucketY)) lineMap.set(bucketY, []);
        lineMap.get(bucketY).push({ str: item.str, x: normX, y: normY });
      }

      pageItems.push({ page: i, items: itemsForThisPage });

      const sortedY = Array.from(lineMap.keys()).sort((a, b) => a - b);
      const pageLines = sortedY.map((y) => {
        const lineItems = lineMap.get(y).sort((a, b) => a.x - b.x);
        return lineItems.map((it) => it.str).join(' ');
      });

      if (pageLines.length > 0) {
        fullText += `--- Page ${i} ---\n` + pageLines.join('\n') + '\n\n';
      }
    } catch (e) {
      console.warn('PDF text extraction error for page', i, e);
    }

    onProgress && onProgress(i, pdf.numPages);
  }

  return { pages, text: fullText, pageItems };
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Build page info objects from rendered page data URLs.
 */
async function buildPageInfo(pages, fileName, fileSize) {
  const processed = pages.map((dataUrl, i) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          pageNumber: i + 1,
          dataUrl,
          dimensions: { width: img.naturalWidth, height: img.naturalHeight },
        });
      };
      img.onerror = () => {
        resolve({
          pageNumber: i + 1,
          dataUrl,
          dimensions: { width: 800, height: 1100 },
        });
      };
      img.src = dataUrl;
    });
  });
  return {
    fileName,
    fileSize,
    pageCount: pages.length,
    pages: await Promise.all(processed),
  };
}

export function useAssessment() {
  const [questionFile, setQuestionFile] = useState(null);
  const [answerFile, setAnswerFile] = useState(null);
  const [processing, setProcessing] = useState(INITIAL_PROCESSING_STATE);
  const [result, setResult] = useState(null);
  const abortRef = useRef(false);

  const updateProcessing = useCallback((update) => {
    setProcessing((prev) => ({ ...prev, ...update }));
  }, []);

  const setStage = useCallback((stage, progressOverride, message) => {
    const baseProgress = Object.entries(STAGE_WEIGHTS).reduce((acc, [s, w]) => {
      const stages = Object.keys(STAGE_WEIGHTS);
      const idx = stages.indexOf(stage);
      const currentIdx = stages.indexOf(s);
      return currentIdx < idx ? acc + w : acc;
    }, 0);

    setProcessing({
      stage,
      progress: progressOverride ?? baseProgress,
      message: message || stage,
      error: null,
    });
  }, []);

  const selectQuestionFile = useCallback((file) => {
    if (!file) { setQuestionFile(null); return; }
    try {
      validateFile(file);
      setQuestionFile(file);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }, []);

  const selectAnswerFile = useCallback((file) => {
    if (!file) { setAnswerFile(null); return; }
    try {
      validateFile(file);
      setAnswerFile(file);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current = true;
    setQuestionFile(null);
    setAnswerFile(null);
    setProcessing(INITIAL_PROCESSING_STATE);
    setResult(null);
    setTimeout(() => { abortRef.current = false; }, 100);
  }, []);

  const processAssessment = useCallback(async (qFile, aFile) => {
    abortRef.current = false;

    try {
      // ── Stage 1: Render Question Paper ──────────────────
      setStage('rendering-question-paper', 5, 'Rendering question paper pages...');

      const { pages: questionPages, text: questionText } = await fileToPages(qFile, (current, total) => {
        updateProcessing({
          progress: 5 + (current / total) * 5,
          message: `Rendering question paper page ${current} of ${total}...`,
        });
      });

      if (abortRef.current) return;

      // ── Stage 2: Extract Questions ───────────────────────
      setStage('extracting-questions', 10, 'Extracting questions from paper...');

      const qAbort = new AbortController();
      const qTimeout = setTimeout(() => qAbort.abort(), 120_000);
      let questionRes;
      try {
        questionRes = await fetch('/api/extract-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pages: questionPages,
            text: questionText,
            mimeType: 'image/jpeg',
          }),
          signal: qAbort.signal,
        });
      } finally {
        clearTimeout(qTimeout);
      }

      if (!questionRes.ok) {
        const err = await questionRes.json().catch(() => ({ error: 'Question extraction failed' }));
        throw new Error(err.error || 'Question extraction failed');
      }

      const { data: questionData } = await questionRes.json();
      const questions = questionData.questions;

      updateProcessing({ progress: 40, message: `Extracted ${questions.length} questions.` });

      if (abortRef.current) return;



      // ── Stage 3: Render Answer Sheet ─────────────────────
      setStage('rendering-answer-sheet', 42, 'Rendering answer sheet pages...');

      const { pages: answerPages, text: answerText, pageItems: answerPageItems } = await fileToPages(aFile, (current, total) => {
        updateProcessing({
          progress: 42 + (current / total) * 8,
          message: `Rendering answer sheet page ${current} of ${total}...`,
        });
      });

      if (abortRef.current) return;

      // ── Stage 4: Extract Answers ─────────────────────────
      setStage('extracting-answers', 50, 'Extracting student answers...');

      const aAbort = new AbortController();
      const aTimeout = setTimeout(() => aAbort.abort(), 120_000);
      let answerRes;
      try {
        answerRes = await fetch('/api/extract-answers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pages: answerPages,
            text: answerText,
            pageItems: answerPageItems,
            mimeType: 'image/jpeg',
          }),
          signal: aAbort.signal,
        });
      } finally {
        clearTimeout(aTimeout);
      }

      if (!answerRes.ok) {
        const err = await answerRes.json().catch(() => ({ error: 'Answer extraction failed' }));
        throw new Error(err.error || 'Answer extraction failed');
      }

      const { data: answerData } = await answerRes.json();
      const answers = answerData.answers;

      updateProcessing({ progress: 80, message: `Found ${answers.length} answer sections.` });

      if (abortRef.current) return;



      // ── Stage 5: Map Answers ──────────────────────────────
      setStage('mapping-answers', 82, 'Mapping answers to questions...');

      const mAbort = new AbortController();
      const mTimeout = setTimeout(() => mAbort.abort(), 60_000);
      let mappingRes;
      try {
        mappingRes = await fetch('/api/map-answers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questions, answers }),
          signal: mAbort.signal,
        });
      } finally {
        clearTimeout(mTimeout);
      }

      if (!mappingRes.ok) {
        const err = await mappingRes.json().catch(() => ({ error: 'Answer mapping failed' }));
        throw new Error(err.error || 'Answer mapping failed');
      }

      const { data: mappingData } = await mappingRes.json();

      updateProcessing({ progress: 92, message: 'Preparing visual highlights...' });

      if (abortRef.current) return;

      // ── Stage 6: Prepare Result ───────────────────────────
      setStage('preparing-results', 95, 'Preparing assessment results...');

      const [qPaperInfo, aSheetInfo] = await Promise.all([
        buildPageInfo(questionPages, qFile.name, qFile.size),
        buildPageInfo(answerPages, aFile.name, aFile.size),
      ]);

      const assessmentResult = {
        id: generateId('assessment'),
        createdAt: new Date().toISOString(),
        questionPaper: qPaperInfo,
        answerSheet: aSheetInfo,
        questions,
        answers,
        mappings: mappingData.mappings,
        unmatchedAnswers: mappingData.unmatchedAnswers || [],
        summary: mappingData.summary || computeSummary(questions, mappingData.mappings),
      };

      setResult(assessmentResult);
      saveToHistory(assessmentResult);
      setProcessing({ stage: 'complete', progress: 100, message: 'Assessment complete!', error: null });
      toast.success(`Assessment complete — ${questions.length} questions processed`);

    } catch (error) {
      if (abortRef.current) return;
      console.error('Processing error:', error);
      const message = getErrorMessage(error);
      setProcessing({
        stage: 'error',
        progress: 0,
        message,
        error: message,
      });
      toast.error(message);
    }
  }, [setStage, updateProcessing]);

  const startProcessing = useCallback(() => {
    if (!questionFile || !answerFile) {
      toast.error('Please upload both files before processing.');
      return;
    }
    processAssessment(questionFile, answerFile);
  }, [questionFile, answerFile, processAssessment]);

  return {
    questionFile,
    answerFile,
    processing,
    result,
    selectQuestionFile,
    selectAnswerFile,
    startProcessing,
    reset,
    isReady: !!questionFile && !!answerFile,
    isProcessing: !['idle', 'complete', 'error'].includes(processing.stage),
  };
}
