'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { normalizedToPixel, expandBoundingBox } from '@/lib/coordinates';

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.2;

function HighlightOverlay({ regions, pages, currentPage, zoom, containerDimensions, activeQuestionNumber }) {
  const pageRegions = regions.filter((r) => r.page === currentPage);
  if (pageRegions.length === 0) return null;

  const pageData = pages.find((p) => p.pageNumber === currentPage);
  if (!pageData || !containerDimensions) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 10 }}
      aria-hidden="true"
    >
      {pageRegions.map((region, idx) => {
        const expanded = expandBoundingBox(region.boundingBox, 8);
        const rect = normalizedToPixel(expanded, pageData.dimensions, zoom);

        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              left: rect.x,
              top: rect.y,
              width: rect.width,
              height: rect.height,
            }}
            className="rounded-xl"
          >
            {/* Green Highlight Box matching Figma */}
            <div className="absolute inset-0 rounded-xl bg-emerald-500/15 border-2 border-emerald-500 shadow-sm" />

            {/* Attached Green Question Tag on top-left */}
            <div className="absolute -top-3 -left-1 bg-emerald-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-md shadow-xs flex items-center justify-center">
              Q{activeQuestionNumber || '1'}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export function AnswerSheetViewer({ pages, highlightRegions, targetPage, activeQuestionNumber }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef(null);
  const [containerDimensions, setContainerDimensions] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (targetPage && targetPage !== currentPage) {
      setCurrentPage(targetPage);
    }
  }, [targetPage, currentPage]);

  const totalPages = pages?.length || 0;
  const currentPageData = pages?.find((p) => p.pageNumber === currentPage);

  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(z + ZOOM_STEP, MAX_ZOOM)), []);
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(z - ZOOM_STEP, MIN_ZOOM)), []);

  if (!pages || pages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 bg-white">
        <p className="text-xs font-medium">No pages to display</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-100">
      {/* Header Bar matching Figma */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0 bg-white">
        <h3 className="text-xs sm:text-sm font-bold text-gray-900">Answer Sheet</h3>

        {/* Toolbar with dark pills */}
        <div className="flex items-center gap-2">
          {/* Zoom Pill */}
          <div className="bg-[#1E2022] text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= MIN_ZOOM}
              className="hover:text-gray-300 disabled:opacity-30 p-0.5"
              aria-label="Zoom out"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="min-w-[2.5rem] text-center font-mono">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= MAX_ZOOM}
              className="hover:text-gray-300 disabled:opacity-30 p-0.5"
              aria-label="Zoom in"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Page Pill */}
          <div className="bg-[#1E2022] text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="hover:text-gray-300 disabled:opacity-30 p-0.5"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="hover:text-gray-300 disabled:opacity-30 p-0.5"
              aria-label="Next page"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Viewer Canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-[#F4F5F7] relative flex items-start justify-center p-4"
        style={{ minHeight: 0 }}
      >
        <AnimatePresence mode="wait">
          {currentPageData && (
            <motion.div
              key={currentPage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative shadow-md bg-white rounded-lg overflow-hidden flex-shrink-0"
              style={{
                width: currentPageData.dimensions.width * zoom,
                height: currentPageData.dimensions.height * zoom,
              }}
            >
              <img
                src={currentPageData.dataUrl}
                alt={`Answer sheet page ${currentPage}`}
                className="block w-full h-full object-contain select-none"
                draggable={false}
              />

              <AnimatePresence>
                {highlightRegions && highlightRegions.length > 0 && (
                  <HighlightOverlay
                    regions={highlightRegions}
                    pages={pages}
                    currentPage={currentPage}
                    zoom={zoom}
                    containerDimensions={containerDimensions}
                    activeQuestionNumber={activeQuestionNumber}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
