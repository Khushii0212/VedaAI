'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function QuestionSidebar({
  questions,
  mappings,
  selectedQuestionId,
  onSelectQuestion,
  answers = [],
}) {
  const [expandAll, setExpandAll] = useState(false);

  // Map answers & mappings by questionId
  const mappingMap = new Map((mappings || []).map((m) => [m.questionId, m]));
  const answerMap = new Map((answers || []).map((a) => [a.id, a]));

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header matching Figma */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0 bg-white">
        <h3 className="text-xs sm:text-sm font-bold text-gray-900">
          Extracted Questions (from question paper)
        </h3>
        <button
          onClick={() => setExpandAll((prev) => !prev)}
          className="text-[11px] font-semibold text-gray-500 hover:text-gray-900 border border-gray-200 px-2.5 py-0.5 rounded-full hover:bg-gray-50 transition-colors"
        >
          {expandAll ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      {/* Question Accordion List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {questions && questions.length > 0 ? (
          questions.map((q) => {
            const mapping = mappingMap.get(q.id);
            const answer = mapping?.answerId ? answerMap.get(mapping.answerId) : null;
            const isSelected = selectedQuestionId === q.id;
            const isExpanded = expandAll || isSelected;

            const isAnswered = mapping?.status === 'answered';
            const isUnanswered = mapping?.status === 'unanswered';
            const maxMarks = mapping?.maxMarks || q.marks || 2;
            const score = mapping?.score !== undefined 
              ? mapping.score 
              : isAnswered 
              ? maxMarks 
              : 0;
            const scoreLabel = `${score}/${maxMarks}`;

            const badgeColorClass = score === 0
              ? 'bg-red-50 text-red-600'
              : score < maxMarks
              ? 'bg-amber-50 text-amber-700'
              : 'bg-emerald-50 text-emerald-700';

            return (
              <motion.div
                key={q.id}
                layout
                onClick={() => onSelectQuestion(q.id)}
                className={cn(
                  'rounded-2xl border transition-all duration-200 p-4 cursor-pointer select-none bg-white',
                  isSelected
                    ? 'border-[#FF5722] ring-1 ring-[#FF5722]/30 shadow-xs'
                    : 'border-gray-100 hover:border-gray-200 hover:shadow-2xs'
                )}
              >
                {/* Top Row: Badge, Question Text, Score, Chevron */}
                <div className="flex items-start gap-3">
                  {/* Number Badge */}
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5 shadow-2xs',
                      isSelected
                        ? 'bg-[#FF5722] text-white'
                        : 'bg-[#1E2022] text-white'
                    )}
                  >
                    {q.number || q.id}
                  </div>

                  {/* Question Text */}
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-xs sm:text-sm font-medium text-gray-800 leading-relaxed">
                      {q.text}
                    </p>
                  </div>

                  {/* Score Pill & Chevron */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={cn(
                        'text-[11px] font-bold px-2 py-0.5 rounded-full',
                        badgeColorClass
                      )}
                    >
                      {scoreLabel}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded AI Feedback Section (Matching Figma) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3 pt-3 border-t border-gray-100"
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#FF5722]" />
                        <span className="text-xs font-bold text-gray-900">
                          AI Feedback
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed pl-5">
                        {mapping?.feedback ||
                          mapping?.reasoning ||
                          (answer?.answerText
                            ? `Extracted Answer: "${answer.answerText}"`
                            : isUnanswered
                            ? 'No corresponding student response found on the answer sheet.'
                            : 'Identified and mapped accurately from the student answer sheet.')}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-12 text-gray-400 text-xs">
            No questions extracted
          </div>
        )}
      </div>
    </div>
  );
}
