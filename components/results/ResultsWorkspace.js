'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { QuestionSidebar } from '@/components/results/QuestionSidebar';
import { AnswerSheetViewer } from '@/components/results/AnswerSheetViewer';
import { cn } from '@/lib/utils';

export function ResultsWorkspace({ result, onReset }) {
  const [selectedQuestionId, setSelectedQuestionId] = useState(
    result?.questions?.[0]?.id || null
  );
  const [mobileTab, setMobileTab] = useState('questions'); // 'questions' | 'viewer'

  const { questions = [], answers = [], mappings = [], answerSheet = {} } = result || {};

  // Build lookup maps
  const mappingByQuestionId = useMemo(() => {
    const map = new Map();
    for (const m of mappings) map.set(m.questionId, m);
    return map;
  }, [mappings]);

  const answerById = useMemo(() => {
    const map = new Map();
    for (const a of answers) map.set(a.id, a);
    return map;
  }, [answers]);

  const selectedQuestion = useMemo(
    () => questions.find((q) => q.id === selectedQuestionId) || questions[0] || null,
    [questions, selectedQuestionId]
  );

  const selectedMapping = useMemo(
    () => (selectedQuestion ? mappingByQuestionId.get(selectedQuestion.id) || null : null),
    [selectedQuestion, mappingByQuestionId]
  );

  const selectedAnswer = useMemo(() => {
    if (!selectedMapping?.answerId) return null;
    return answerById.get(selectedMapping.answerId) || null;
  }, [selectedMapping, answerById]);

  const highlightRegions = useMemo(
    () => selectedAnswer?.regions || [],
    [selectedAnswer]
  );

  const targetPage = useMemo(() => {
    if (!highlightRegions || highlightRegions.length === 0) return 1;
    return highlightRegions[0].page;
  }, [highlightRegions]);

  const handleSelectQuestion = useCallback((questionId) => {
    setSelectedQuestionId(questionId);
    if (window.innerWidth < 1024) {
      setMobileTab('viewer');
    }
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F4F5F7]">
      {/* Mobile Tab Switcher matching Figma */}
      <div className="lg:hidden flex items-center justify-center p-3 bg-white border-b border-gray-100 flex-shrink-0">
        <div className="flex bg-[#1E2022] p-1 rounded-full w-full max-w-xs shadow-xs">
          <button
            onClick={() => setMobileTab('questions')}
            className={cn(
              'flex-1 py-1.5 text-xs font-semibold rounded-full transition-all text-center',
              mobileTab === 'questions'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-400 hover:text-white'
            )}
          >
            Questions
          </button>
          <button
            onClick={() => setMobileTab('viewer')}
            className={cn(
              'flex-1 py-1.5 text-xs font-semibold rounded-full transition-all text-center',
              mobileTab === 'viewer'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-400 hover:text-white'
            )}
          >
            Answer Sheet
          </button>
        </div>
      </div>

      {/* Main Workspace: Desktop 2-Column Split Matching Figma */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden bg-white m-3 sm:m-4 rounded-3xl border border-gray-100 shadow-xs">
        {/* Left Column: Questions List */}
        <div
          className={cn(
            'flex flex-col h-full overflow-hidden',
            mobileTab !== 'questions' ? 'hidden lg:flex' : 'flex'
          )}
        >
          <QuestionSidebar
            questions={questions}
            mappings={mappings}
            selectedQuestionId={selectedQuestionId}
            onSelectQuestion={handleSelectQuestion}
            answers={answers}
          />
        </div>

        {/* Right Column: Answer Sheet Viewer */}
        <div
          className={cn(
            'flex flex-col h-full overflow-hidden',
            mobileTab !== 'viewer' ? 'hidden lg:flex' : 'flex'
          )}
        >
          <AnswerSheetViewer
            pages={answerSheet?.pages || []}
            highlightRegions={highlightRegions}
            targetPage={targetPage}
            activeQuestionNumber={selectedQuestion?.number || '1'}
          />
        </div>
      </div>
    </div>
  );
}
