'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { UploadCard } from '@/components/upload/UploadCard';
import { ProcessingScreen } from '@/components/processing/ProcessingScreen';
import { ErrorScreen } from '@/components/processing/ErrorScreen';
import { ResultsWorkspace } from '@/components/results/ResultsWorkspace';
import { useAssessment } from '@/hooks/useAssessment';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const {
    questionFile,
    answerFile,
    processing,
    result,
    selectQuestionFile,
    selectAnswerFile,
    startProcessing,
    reset,
    isReady,
    isProcessing,
  } = useAssessment();

  const [loadingDemo, setLoadingDemo] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-collapse sidebar during processing & results view on desktop
  const isResultsView = Boolean(result);
  const effectiveCollapsed = isResultsView || isProcessing || sidebarCollapsed;

  const handleStartDemo = useCallback(async () => {
    setLoadingDemo(true);
    try {
      const [qRes, aRes] = await Promise.all([
        fetch('/demo/question-paper.jpg'),
        fetch('/demo/answer-sheet.jpg'),
      ]);

      if (!qRes.ok || !aRes.ok) throw new Error('Demo files not found');

      const [qBlob, aBlob] = await Promise.all([qRes.blob(), aRes.blob()]);
      const qFile = new File([qBlob], 'Class_10_maths_unit_test.pdf', {
        type: 'application/pdf',
      });
      const aFile = new File([aBlob], 'student_1_answer_sheet.pdf', {
        type: 'application/pdf',
      });

      selectQuestionFile(qFile);
      selectAnswerFile(aFile);
      setTimeout(() => startProcessing(), 300);
    } catch (err) {
      console.error('Demo load error:', err);
      toast.error('Demo files not found. Please upload your own files.');
    } finally {
      setLoadingDemo(false);
    }
  }, [selectQuestionFile, selectAnswerFile, startProcessing]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F4F5F7]">
      {/* Left Sidebar: Collapsible on desktop, slide-out drawer on mobile */}
      <Sidebar
        collapsed={effectiveCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area: Takes full 100% width on mobile */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          onBack={isResultsView ? reset : undefined}
          title={isResultsView ? 'Assessment Results' : 'Exams'}
          onDemoClick={handleStartDemo}
          onMobileMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
        />

        {/* Dynamic View Body */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* 1. Results View */}
          {result ? (
            <ResultsWorkspace result={result} onReset={reset} />
          ) : isProcessing ? (
            /* 2. Loading State Matching Figma */
            <ProcessingScreen />
          ) : processing.stage === 'error' ? (
            /* 3. Error State */
            <ErrorScreen
              error={processing.error}
              onRetry={startProcessing}
              onReset={reset}
            />
          ) : (
            /* 4. Upload Screen (Responsive for Mobile & Desktop) */
            <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-3 sm:p-8">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="w-full max-w-4xl bg-white rounded-2xl sm:rounded-[36px] border border-gray-100 shadow-xs p-5 sm:p-12 flex flex-col items-center text-center my-auto"
              >
                {/* Header Title */}
                <h1 className="text-xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-1 sm:mb-2">
                  Upload{' '}
                  <span className="text-[#FF5722] underline decoration-orange-200 decoration-wavy underline-offset-4">
                    Question Paper & Answer Sheets
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 font-medium mb-5 sm:mb-8">
                  Upload both files to get started
                </p>

                {/* Center Teacher Illustration with Glowing Aura */}
                <div className="relative mb-6 sm:mb-10 flex items-center justify-center">
                  <div className="absolute w-24 sm:w-28 h-24 sm:h-28 rounded-full bg-orange-100/50 animate-pulse-slow -z-1" />
                  <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-amber-100 to-orange-200 ring-6 sm:ring-8 ring-orange-50/70 flex items-center justify-center shadow-xs overflow-hidden">
                    <span className="text-2xl sm:text-4xl select-none">👩‍🏫</span>
                  </div>
                  {/* Surrounding decorative dots */}
                  <div className="absolute -top-1 right-2 w-2 h-2 rounded-full bg-[#FF5722]" />
                  <div className="absolute bottom-2 -left-2 w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <div className="absolute top-4 -left-3 w-2 h-2 rounded-full bg-orange-300" />
                </div>

                {/* Upload Cards Grid: 1 column on mobile, 2 columns on tablet/desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 w-full max-w-2xl mb-6 sm:mb-8">
                  <UploadCard
                    type="question"
                    label="Question Paper"
                    file={questionFile}
                    onFile={selectQuestionFile}
                    onRemove={() => selectQuestionFile(null)}
                  />
                  <UploadCard
                    type="answer"
                    label="Answer Sheet"
                    file={answerFile}
                    onFile={selectAnswerFile}
                    onRemove={() => selectAnswerFile(null)}
                  />
                </div>

                {/* Start Mapping CTA Button */}
                <div className="flex flex-col items-center gap-2.5 sm:gap-3 w-full">
                  <button
                    onClick={startProcessing}
                    disabled={!isReady}
                    className={cn(
                      'w-full sm:w-auto px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 select-none shadow-sm',
                      isReady
                        ? 'bg-[#1E2022] hover:bg-black text-white shadow-md shadow-gray-900/10 hover:scale-102 cursor-pointer'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    )}
                  >
                    <span>Start Mapping</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className="text-[10px] sm:text-[11px] text-gray-400 max-w-xs leading-relaxed">
                    Once both files are uploaded, you'll able to map answers with questions
                  </p>

                  {/* One-Click Demo Option */}
                  <div className="mt-2 pt-3 border-t border-gray-100 w-full flex items-center justify-center gap-2">
                    <span className="text-[10px] sm:text-[11px] text-gray-400">Want a quick test?</span>
                    <button
                      onClick={handleStartDemo}
                      disabled={loadingDemo}
                      className="text-[10px] sm:text-[11px] font-bold text-[#FF5722] hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-[#FF5722]" />
                      {loadingDemo ? 'Loading demo...' : 'Try Demo Assessment'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
