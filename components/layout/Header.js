'use client';

import React from 'react';
import {
  ArrowLeft,
  ClipboardList,
  HelpCircle,
  Bell,
  Sparkles,
  Menu,
} from 'lucide-react';

export function Header({ onBack, title = 'Exams', onDemoClick, onMobileMenuToggle }) {
  return (
    <header className="h-14 border-b border-gray-100 bg-white/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between flex-shrink-0 z-20">
      {/* Left: Hamburger (Mobile) + Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Hamburger Menu */}
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {onBack && (
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-800">
          <ClipboardList className="w-4 h-4 text-gray-400" />
          <span className="truncate max-w-[140px] sm:max-w-none">{title}</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Help */}
        <button
          className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
          title="Help & Documentation"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <button
          className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF5722] rounded-full ring-2 ring-white" />
        </button>

        {/* AI Sparkle */}
        <button
          onClick={onDemoClick}
          className="w-8 h-8 rounded-full hover:bg-orange-50 flex items-center justify-center text-gray-400 hover:text-[#FF5722] transition-colors"
          title="Demo Mode"
        >
          <Sparkles className="w-4 h-4 text-[#FF5722]" />
        </button>

        <div className="h-4 w-px bg-gray-200 hidden sm:block" />

        {/* Profile Avatar */}
        <div className="flex items-center pl-1 cursor-pointer" title="Profile">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-[#FF5722] p-0.5 shadow-xs hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
              <span className="text-xs font-bold text-[#FF5722]">👤</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
