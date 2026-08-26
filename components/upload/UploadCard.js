'use client';

import React, { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/assessment';
import { validateFile, getErrorMessage } from '@/lib/errors';

export function UploadCard({
  type = 'question', // 'question' | 'answer'
  label,
  file,
  onFile,
  onRemove,
  accept = '.pdf,.png,.jpg,.jpeg',
  disabled,
}) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = useCallback(
    (incoming) => {
      setError(null);
      try {
        validateFile(incoming);
        onFile(incoming);
      } catch (err) {
        setError(getErrorMessage(err));
      }
    },
    [onFile]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e) => {
      const selected = e.target.files?.[0];
      if (selected) handleFile(selected);
      e.target.value = '';
    },
    [handleFile]
  );

  const isQuestion = type === 'question';
  const displayLabel = isQuestion ? 'Question Paper' : 'Answer Sheet';

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />

      <div
        onClick={() => !disabled && !file && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={!disabled ? handleDrop : undefined}
        className={cn(
          'relative w-full h-[180px] sm:h-[190px] rounded-3xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center p-6 text-center select-none',
          isDragging
            ? 'border-[#FF5722] bg-orange-50/40 scale-[1.01]'
            : file
            ? 'border-gray-200 bg-white shadow-xs'
            : 'border-gray-200 bg-white/80 hover:border-gray-300 hover:bg-white hover:shadow-sm cursor-pointer'
        )}
      >
        {file ? (
          /* Filled State Matching Figma */
          <div className="w-full flex items-center justify-between bg-white border border-gray-100 rounded-2xl p-4 shadow-xs relative">
            <div className="flex items-center gap-3.5 min-w-0 pr-4">
              {/* Red PDF Icon badge */}
              <div className="w-9 h-10 rounded-lg bg-red-500 text-white flex flex-col items-center justify-center font-bold text-[9px] tracking-wider shadow-xs flex-shrink-0">
                <FileText className="w-4 h-4 text-white mb-0.5" />
                <span>PDF</span>
              </div>

              {/* File Info */}
              <div className="text-left min-w-0">
                <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate max-w-[170px] sm:max-w-[200px]">
                  {file.name}
                </div>
                <div className="text-[11px] text-gray-400 font-medium mt-0.5">
                  {formatFileSize(file.size)} • {file.name.endsWith('.pdf') ? 'Multi-page' : '1 Page'}
                </div>
              </div>
            </div>

            {/* Circular Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="w-6 h-6 rounded-full bg-[#1E2022] hover:bg-black text-white flex items-center justify-center transition-transform hover:scale-110 flex-shrink-0"
              title="Remove file"
              aria-label="Remove file"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Empty State Matching Figma */
          <div className="flex flex-col items-center justify-center">
            {/* Upload Icon Box */}
            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-3 text-gray-500 shadow-2xs">
              <Upload className="w-5 h-5 text-gray-600" />
            </div>

            {/* Upload text with orange accent */}
            <p className="text-sm font-bold text-gray-800 tracking-tight">
              Upload <span className="text-[#FF5722]">{displayLabel}</span>
            </p>
            <p className="text-[11px] text-gray-400 font-medium mt-1">Max 10MB</p>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-500 font-medium mt-2 absolute bottom-2">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
