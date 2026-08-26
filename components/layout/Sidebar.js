'use client';

import React from 'react';
import {
  LayoutGrid,
  Users,
  FileText,
  ClipboardList,
  Library,
  Settings,
  Sparkles,
  ChevronRight,
  PanelLeftClose,
  ChevronsRight,
  GraduationCap,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const navItems = [
    { label: 'Home', icon: LayoutGrid, active: false },
    { label: 'My Classroom', icon: Users, active: false },
    { label: 'Assignments', icon: FileText, active: false },
    { label: 'Exams', icon: ClipboardList, active: true },
    { label: 'My Library', icon: Library, active: false },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container: Drawer on mobile, column on desktop */}
      <aside
        className={cn(
          'bg-white border-r border-gray-100 flex flex-col justify-between h-full flex-shrink-0 z-50 transition-all duration-300',
          // Mobile: slide-in drawer
          'fixed inset-y-0 left-0 lg:static',
          mobileOpen ? 'translate-x-0 shadow-2xl w-[260px]' : '-translate-x-full lg:translate-x-0',
          // Desktop collapsed vs expanded
          collapsed ? 'lg:w-[72px] lg:items-center lg:py-4' : 'lg:w-[240px] lg:p-4 p-4'
        )}
      >
        {/* Top Section */}
        <div className="flex flex-col gap-5 w-full">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-1 w-full">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center shadow-sm">
                <span className="text-white font-black text-lg tracking-tighter">V</span>
              </div>
              {(!collapsed || mobileOpen) && (
                <span className="font-bold text-gray-900 text-lg tracking-tight">VedaAI</span>
              )}
            </div>

            {/* Mobile close button */}
            <button
              onClick={onMobileClose}
              className="lg:hidden text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop collapse button */}
            {!collapsed && (
              <button
                onClick={onToggle}
                className="hidden lg:block text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* AI Teacher's Toolkit CTA */}
          {(!collapsed || mobileOpen) ? (
            <button className="w-full bg-[#1E2022] text-white py-2.5 px-3.5 rounded-full flex items-center justify-center gap-2 text-xs font-semibold shadow-md shadow-gray-900/10 hover:bg-black transition-all group">
              <Sparkles className="w-3.5 h-3.5 text-[#FF5722] animate-pulse" />
              <span>AI Teacher's Toolkit</span>
            </button>
          ) : (
            <button
              onClick={onToggle}
              className="w-10 h-10 rounded-full bg-[#1E2022] text-white flex items-center justify-center relative shadow-sm hover:scale-105 transition-transform"
              title="AI Teacher's Toolkit"
            >
              <Sparkles className="w-4 h-4 text-[#FF5722]" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#FF5722] rounded-full ring-2 ring-white" />
            </button>
          )}

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1 mt-1 w-full">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  className={cn(
                    'flex items-center gap-3 rounded-xl text-xs font-medium transition-all text-left w-full',
                    collapsed && !mobileOpen
                      ? 'w-10 h-10 justify-center p-0 mx-auto'
                      : 'px-3.5 py-2.5',
                    item.active
                      ? 'bg-gray-100 text-gray-900 font-semibold shadow-xs'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  )}
                  title={item.label}
                >
                  <Icon className={cn('w-4 h-4', item.active ? 'text-gray-900' : 'text-gray-400')} />
                  {(!collapsed || mobileOpen) && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col gap-4 pt-4 w-full">
          {/* Settings link */}
          <button
            className={cn(
              'flex items-center gap-3 rounded-xl text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all text-left w-full',
              collapsed && !mobileOpen ? 'w-10 h-10 justify-center p-0 mx-auto' : 'px-3.5 py-2'
            )}
          >
            <Settings className="w-4 h-4 text-gray-400" />
            {(!collapsed || mobileOpen) && <span>Settings</span>}
          </button>

          {/* School Badge Card */}
          {(!collapsed || mobileOpen) ? (
            <div className="bg-[#F8F9FA] border border-gray-100 rounded-2xl p-3 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white border border-emerald-100 shadow-xs flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-5 h-5 text-emerald-700" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-gray-900 truncate">Delhi Public School</div>
                <div className="text-[10px] text-gray-400 truncate">Bokaro Steel City</div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-9 h-9 rounded-lg border border-emerald-200 bg-emerald-50/50 flex items-center justify-center p-1" title="Delhi Public School">
                <GraduationCap className="w-5 h-5 text-emerald-700" />
              </div>
              <button
                onClick={onToggle}
                className="w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors"
                title="Expand Sidebar"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
