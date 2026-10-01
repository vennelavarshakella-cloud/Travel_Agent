import React from 'react';
import { Compass, ExternalLink, Sliders } from 'lucide-react';

interface FooterProps {
  onOpenWorkflowDrawer: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenWorkflowDrawer }) => {
  return (
    <footer className="bg-stone-950 border-t border-stone-800 text-stone-400 py-12 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-stone-800/80">
          
          <div className="space-y-2 max-w-md">
            <div className="flex items-center gap-2 text-stone-100 font-serif font-bold text-base">
              <Compass className="w-5 h-5 text-amber-400" />
              <span>Vennela Travel Concierge</span>
            </div>
            <p className="text-stone-400 leading-relaxed text-xs">
              Automated journey planning, transport options formulation, and comprehensive trip cost estimation powered by the n8n cloud workflow engine.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-mono text-[11px]">
            <a href="#planner-section" className="hover:text-amber-400 transition-colors">
              Trip Planner
            </a>
            <a href="#destinations-section" className="hover:text-amber-400 transition-colors">
              Curated Corridors
            </a>
            <a href="#transport-matrix" className="hover:text-amber-400 transition-colors">
              Transport Matrix
            </a>
            <button
              onClick={onOpenWorkflowDrawer}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              n8n Workflow Hub
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-500 font-mono text-[11px]">
          <div>
            © {new Date().getFullYear()} Vennela Travel Agent. Integrated with n8n instance <code className="text-stone-400">vennela0811.app.n8n.cloud</code>.
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://vennela0811.app.n8n.cloud/form/046dba14-f279-420e-9400-f6c479219664"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-stone-400 hover:text-amber-400 transition-colors"
            >
              Direct n8n Form <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
