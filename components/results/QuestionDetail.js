'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, XCircle, AlertCircle, HelpCircle,
  FileText, MessageSquare, Sparkles, BookOpen, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStatusInfo, getConfidenceLabel } from '@/lib/assessment';
import { useState } from 'react';

const STATUS_CONFIGS = {
  answered: {
    icon: CheckCircle2,
    bg: 'bg-green-50',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-700',
    text: 'text-green-700',
    label: 'Answered',
  },
  unanswered: {
    icon: XCircle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
    text: 'text-red-700',
    label: 'Unanswered',
  },
  uncertain: {
    icon: AlertCircle,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    text: 'text-amber-700',
    label: 'Needs Review',
  },
  unmatched: {
    icon: HelpCircle,
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
    text: 'text-purple-700',
    label: 'Unmatched',
  },
};

const CONFIDENCE_COLORS = {
  high: 'text-green-600 bg-green-50',
  medium: 'text-amber-600 bg-amber-50',
  low: 'text-red-600 bg-red-50',
};

export function QuestionDetail({ question, mapping, answer }) {
  const [showFull, setShowFull] = useState(false);

  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <BookOpen className="w-10 h-10 text-gray-300 mb-3" />
        <p className="text-sm font-medium text-gray-500">Select a question</p>
        <p className="text-xs text-gray-400 mt-1">
          Click any question from the list to view details and highlight the answer.
        </p>
      </div>
    );
  }

  const status = mapping?.status || 'unanswered';
  const config = STATUS_CONFIGS[status] || STATUS_CONFIGS.unanswered;
  const StatusIcon = config.icon;
  const confidenceLevel = answer?.confidenceLevel || 'low';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="p-4 space-y-4 overflow-y-auto h-full"
      >
        {/* Question header */}
        <div className={cn('rounded-xl border p-4', config.bg, config.border)}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Question
                </span>
                {question.type === 'subpart' && (
                  <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-semibold">
                    SUBPART
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900">Q{question.number}</h3>
            </div>
            <span className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', config.badge)}>
              <StatusIcon className="w-3.5 h-3.5" />
              {config.label}
            </span>
          </div>

          <p className={cn(
            'text-sm text-gray-700 leading-relaxed',
            !showFull && question.text.length > 200 ? 'line-clamp-4' : ''
          )}>
            {question.text}
          </p>

          {question.text.length > 200 && (
            <button
              onClick={() => setShowFull(!showFull)}
              className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              {showFull ? 'Show less' : 'Show full question'}
              <ChevronDown className={cn('w-3 h-3 transition-transform', showFull ? 'rotate-180' : '')} />
            </button>
          )}

          {question.marks && (
            <div className="mt-3 text-xs text-gray-500">
              <span className="font-medium">{question.marks}</span> marks
            </div>
          )}
        </div>

        {/* Answer section */}
        {status === 'unanswered' ? (
          <div className="rounded-xl border border-red-100 bg-red-50/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-semibold text-red-700">Not Answered</span>
            </div>
            <p className="text-xs text-gray-500">
              No answer was found in the student's answer sheet for this question.
            </p>
          </div>
        ) : answer ? (
          <div className="space-y-3">
            {/* Answer text */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-semibold text-gray-900">Student Answer</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {answer.answerText || 'Answer text could not be extracted clearly.'}
              </p>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pages</div>
                <div className="text-sm font-semibold text-gray-700">
                  {[...new Set(answer.regions.map((r) => r.page))].join(', ')}
                </div>
              </div>
              <div className={cn('rounded-lg border p-3', CONFIDENCE_COLORS[confidenceLevel])}>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-70">Confidence</div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-sm font-semibold">{getConfidenceLabel(confidenceLevel)}</span>
                </div>
              </div>
            </div>

            {/* Match method */}
            {mapping?.matchMethod && (
              <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-3">
                <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Matched by</div>
                <div className="text-xs text-indigo-700 font-medium capitalize">
                  {mapping.matchMethod === 'number' ? '✓ Question number' :
                   mapping.matchMethod === 'semantic' ? '✓ Semantic analysis' :
                   '✓ Position'}
                </div>
                {mapping.reasoning && (
                  <p className="text-xs text-indigo-600 mt-1 opacity-80">{mapping.reasoning}</p>
                )}
              </div>
            )}
          </div>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}
