import React from 'react';
import { Plane, Calendar, ArrowRight, Train, Sparkles, MapPin } from 'lucide-react';
import { CURATED_DESTINATIONS } from '../data/destinations.ts';
import { CuratedDestination, TravelFormData } from '../types/travel.ts';

interface DestinationsSectionProps {
  onSelectDestination: (dest: CuratedDestination) => void;
}

export const DestinationsSection: React.FC<DestinationsSectionProps> = ({ onSelectDestination }) => {
  return (
    <section id="destinations-section" className="scroll-mt-20 py-16 bg-stone-950/60 border-t border-b border-stone-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">
              Curated Corridors
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-stone-100 tracking-tight">
              Pre-Calibrated Travel Itineraries
            </h2>
            <p className="text-sm text-stone-400 max-w-xl">
              Select any pre-configured global journey to instantly load optimized transport parameters, realistic budgets, and travel dates into the configurator.
            </p>
          </div>
          <span className="text-xs font-mono text-stone-500 self-start sm:self-end">
            6 Featured Routes · Verified Rates
          </span>
        </div>

        {/* Destination Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CURATED_DESTINATIONS.map((dest) => (
            <div
              key={dest.id}
              className="group bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-lg hover:border-amber-500/50 transition-all duration-300 flex flex-col"
            >
              {/* Image banner with overlay */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={dest.imageUrl}
                  alt={dest.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
                
                <div className="absolute top-3 right-3 bg-stone-950/80 backdrop-blur border border-stone-800 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium text-amber-300">
                  {dest.durationDays} Days / {dest.durationDays - 1} Nights
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <div className="text-xs font-mono text-amber-400/90 flex items-center gap-1 mb-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{dest.origin} ➔ {dest.destination.split(',')[0]}</span>
                  </div>
                  <h3 className="text-base font-bold text-stone-100 font-serif leading-snug">
                    {dest.title}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                  {dest.tagline}
                </p>

                <div className="space-y-2 border-t border-stone-800/80 pt-3 text-xs font-mono">
                  <div className="flex items-center justify-between text-stone-300">
                    <span className="text-stone-500">Key Transit:</span>
                    <span className="text-stone-300 truncate max-w-[190px]">{dest.highlightTransport}</span>
                  </div>
                  <div className="flex items-center justify-between text-stone-300">
                    <span className="text-stone-500">Est. Budget:</span>
                    <span className="text-amber-400 font-bold font-sans">${dest.recommendedBudget.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-stone-300">
                    <span className="text-stone-500">Best Season:</span>
                    <span className="text-stone-400">{dest.bestSeason}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectDestination(dest)}
                  className="w-full py-2.5 px-4 bg-stone-800 hover:bg-amber-600 hover:text-stone-950 text-stone-200 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 group-hover:bg-amber-600 group-hover:text-stone-950"
                >
                  <span>Select Route & Configure</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
