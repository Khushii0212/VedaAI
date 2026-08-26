'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function ProcessingScreen() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white min-h-[500px]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center text-center"
      >
        {/* Animated 3-Star Sparkle Icon Matching Figma */}
        <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
          {/* Main Large Star */}
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              rotate: [0, 8, -8, 0],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-12 h-12 text-[#FF5722]"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full drop-shadow-md">
              <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
            </svg>
          </motion.div>

          {/* Top-Left Small Star */}
          <motion.div
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              delay: 0.3,
            }}
            className="absolute top-1 left-2 w-5 h-5 text-[#FF7A50]"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
            </svg>
          </motion.div>

          {/* Bottom-Right Medium Star */}
          <motion.div
            animate={{
              scale: [1.1, 0.8, 1.1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0.6,
            }}
            className="absolute bottom-2 right-2 w-6 h-6 text-[#FF5722]"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
            </svg>
          </motion.div>
        </div>

        {/* Text matching Figma */}
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
          Extracting...
        </h2>
        <p className="text-xs sm:text-sm text-gray-400 font-medium mt-1">
          This may take a while
        </p>
      </motion.div>
    </div>
  );
}
