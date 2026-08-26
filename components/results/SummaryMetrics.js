'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, HelpCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

function MetricCard({ icon: Icon, value, label, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3"
    >
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', `bg-${color}-50`)}>
        <Icon className={cn('w-5 h-5', `text-${color}-600`)} />
      </div>
      <div>
        <div className={cn('text-2xl font-bold', `text-${color}-700`)}>{value}</div>
        <div className="text-xs text-gray-500 font-medium">{label}</div>
      </div>
    </motion.div>
  );
}

export function SummaryMetrics({ summary }) {
  const { totalQuestions, answered, unanswered, uncertain, unmatched, coveragePercent } = summary;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900">Assessment Overview</h2>
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-bold text-indigo-700">{coveragePercent}% Coverage</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard
          icon={CheckCircle2}
          value={answered}
          label="Answered"
          color="green"
          delay={0.05}
        />
        <MetricCard
          icon={XCircle}
          value={unanswered}
          label="Unanswered"
          color="red"
          delay={0.1}
        />
        {uncertain > 0 && (
          <MetricCard
            icon={AlertCircle}
            value={uncertain}
            label="Needs Review"
            color="amber"
            delay={0.15}
          />
        )}
        {unmatched > 0 && (
          <MetricCard
            icon={HelpCircle}
            value={unmatched}
            label="Unmatched"
            color="purple"
            delay={0.2}
          />
        )}
        <MetricCard
          icon={CheckCircle2}
          value={totalQuestions}
          label="Total Questions"
          color="indigo"
          delay={0.25}
        />
      </div>

      {/* Coverage bar */}
      <div className="mt-4 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex justify-between text-xs font-medium text-gray-700 mb-2">
          <span>Answer Coverage</span>
          <span>{answered}/{totalQuestions} answered</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${coveragePercent}%` }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className={cn(
              'h-full rounded-full',
              coveragePercent >= 80 ? 'bg-green-500' :
              coveragePercent >= 50 ? 'bg-amber-500' :
              'bg-red-500'
            )}
          />
        </div>
      </div>
    </div>
  );
}
