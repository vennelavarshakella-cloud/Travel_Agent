import React from 'react';
import { Plane, Compass, Sliders, ExternalLink, ShieldCheck, Activity } from 'lucide-react';

interface HeaderProps {
  onOpenWorkflowDrawer: () => void;
  onScrollToPlanner: () => void;
  onOpenChat: () => void;
  n8nStatus: 'connected' | 'checking' | 'error';
}

export const Header: React.FC<HeaderProps> = ({
  onOpenWorkflowDrawer,
  onScrollToPlanner,
  onOpenChat,
  n8nStatus,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-stone-950/90 backdrop-blur-md border-b border-stone-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 shadow-md shadow-amber-950/20">
            <Compass className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-lg text-stone-100 tracking-tight">
                Vennela Travel Concierge
              </span>
            </div>
            <p className="text-[11px] text-stone-400 font-mono">
              Powered by n8n Travel Automation
            </p>
          </div>
        </div>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-stone-300">
          <a href="#chatbot-section" className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Nathan AI Chat
          </a>
          <a href="#planner-section" className="hover:text-amber-400 transition-colors">
            Trip Planner
          </a>
          <a href="#destinations-section" className="hover:text-amber-400 transition-colors">
            Curated Corridors
          </a>
          <a href="#transport-matrix" className="hover:text-amber-400 transition-colors">
            Transport Options
          </a>
          <a href="#faq-section" className="hover:text-amber-400 transition-colors">
            Workflow FAQ
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* n8n Status Trigger */}
          <button
            onClick={onOpenWorkflowDrawer}
            className="flex items-center gap-2 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-lg text-xs transition-colors"
            title="Inspect n8n Cloud Webhook"
          >
            <span className="relative flex h-2 w-2">
              {n8nStatus === 'connected' && (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </>
              )}
              {n8nStatus === 'checking' && (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 animate-spin"></span>
              )}
              {n8nStatus === 'error' && (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              )}
            </span>
            <span className="font-mono text-[11px] text-stone-300 hidden sm:inline">
              n8n Cloud
            </span>
            <Sliders className="w-3.5 h-3.5 text-stone-400" />
          </button>

          {/* Chat with Nathan Trigger */}
          <button
            onClick={onOpenChat}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-medium rounded-lg transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Chat AI</span>
          </button>

          {/* Primary Action */}
          <button
            onClick={onScrollToPlanner}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold text-xs rounded-lg transition-colors shadow-sm"
          >
            Plan Journey
          </button>
        </div>

      </div>
    </header>
  );
};
