'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

export function ErrorScreen({ error, onRetry, onReset }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl border border-red-100 shadow-lg p-8 max-w-md w-full text-center"
      >
        <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Processing Failed</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">{error}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Start Over
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-5">
          If the problem persists, check your Gemini API key and try with a smaller file.
        </p>
      </motion.div>
    </div>
  );
}
