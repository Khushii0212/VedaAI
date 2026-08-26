'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, FileText, CheckCircle2, XCircle, Trash2,
  ChevronRight, RotateCcw, History, AlertCircle
} from 'lucide-react';
import { loadHistory, deleteFromHistory, formatHistoryDate } from '@/lib/history';
import { cn } from '@/lib/utils';

function StatusBadge({ answered, total }) {
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;
  const color = pct >= 80 ? 'text-green-700 bg-green-100' : pct >= 50 ? 'text-amber-700 bg-amber-100' : 'text-red-700 bg-red-100';
  return (
    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', color)}>
      {pct}% covered
    </span>
  );
}

export function RecentAssessments({ onReload }) {
  const [history, setHistory] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    setMounted(true);
    setHistory(loadHistory());
  }, []);

  // Re-read history when window gains focus (in case another tab updated it)
  useEffect(() => {
    const onFocus = () => setHistory(loadHistory());
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const handleDelete = (e, id) => {
    e.stopPropagation();
    setDeleting(id);
    setTimeout(() => {
      deleteFromHistory(id);
      setHistory(loadHistory());
      setDeleting(null);
    }, 300);
  };

  if (!mounted || history.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="mt-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-gray-800">Recent Assessments</h3>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
            {history.length}
          </span>
        </div>
        <p className="text-xs text-gray-400">Click to reopen instantly</p>
      </div>

      {/* History list */}
      <div className="space-y-2">
        <AnimatePresence>
          {history.map((entry, idx) => {
            const hasPages = entry.result?.answerSheet?.pages?.length > 0;
            const isDeleting = deleting === entry.id;

            return (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: isDeleting ? 0 : 1, x: 0, scale: isDeleting ? 0.97 : 1 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
                onClick={() => hasPages ? onReload(entry.result) : null}
                className={cn(
                  'group flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-150',
                  hasPages
                    ? 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-50 cursor-pointer'
                    : 'bg-gray-50 border-gray-100 cursor-not-allowed opacity-70'
                )}
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-indigo-500" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {entry.answerFileName}
                    </p>
                    {!hasPages && (
                      <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-medium flex-shrink-0">
                        Re-upload needed
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatHistoryDate(entry.savedAt)}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                      {entry.summary.answered} answered
                    </span>
                    {entry.summary.unanswered > 0 && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span className="flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-red-400" />
                          {entry.summary.unanswered} unanswered
                        </span>
                      </>
                    )}
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className="text-gray-400">
                      {entry.questionPageCount + entry.answerPageCount} pages
                    </span>
                  </div>
                </div>

                {/* Right: coverage + actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge
                    answered={entry.summary.answered}
                    total={entry.summary.totalQuestions}
                  />

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDelete(e, entry.id)}
                    className="w-7 h-7 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 text-gray-300 flex items-center justify-center transition-all"
                    aria-label="Delete from history"
                    title="Remove from history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {hasPages ? (
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                  ) : (
                    <RotateCcw className="w-4 h-4 text-gray-300" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Storage note */}
      <p className="text-[10px] text-gray-300 text-center mt-3">
        Saved in your browser · Up to 10 assessments
      </p>
    </motion.div>
  );
}
