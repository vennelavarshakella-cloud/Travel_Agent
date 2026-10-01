import React from 'react';
import { Plane, Compass, ArrowRight, ShieldCheck, Sparkles, MapPin } from 'lucide-react';

interface HeroSectionProps {
  onPlanClick: () => void;
  onExploreClick: () => void;
  onOpenChat: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onPlanClick, onExploreClick, onOpenChat }) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-stone-800/80">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          
          {/* Subtle kicker */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-900 border border-stone-800 text-stone-300 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>n8n Workflow Automation · Form & Chatbot Live</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold font-serif text-stone-100 tracking-tight leading-[1.08] text-balance">
            Your Tailored Journey, <br className="hidden sm:inline" />
            <span className="text-amber-400 italic font-normal">Calculated</span> in Seconds.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-stone-300 max-w-2xl mx-auto leading-relaxed">
            Enter your journey details to get verified transport options, optimized travel dates, and an estimated total trip cost — or consult with Nathan, our live n8n AI chatbot.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={onPlanClick}
              className="px-6 py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-stone-950 font-semibold text-sm rounded-xl transition-all shadow-lg shadow-amber-950/40 flex items-center gap-2"
            >
              <span>Configure Your Trip Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenChat}
              className="px-6 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium text-sm rounded-xl transition-colors flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Ask Nathan (AI Chatbot)</span>
            </button>
            <button
              onClick={onExploreClick}
              className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 font-medium text-sm rounded-xl transition-colors"
            >
              Browse Curated Corridors
            </button>
          </div>

          {/* Unboxed Metadata Stats with · separator (Anti-Slop rule compliant) */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-stone-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="text-amber-400">⚡</span>
              <span>Sub-second n8n Execution</span>
            </div>
            <span aria-hidden="true" className="text-stone-600">·</span>
            <div className="flex items-center gap-2">
              <span className="text-amber-400">✈️</span>
              <span>Multi-Modal Routing</span>
            </div>
            <span aria-hidden="true" className="text-stone-600">·</span>
            <div className="flex items-center gap-2">
              <span className="text-amber-400">📊</span>
              <span>Dynamic Budget Split</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
