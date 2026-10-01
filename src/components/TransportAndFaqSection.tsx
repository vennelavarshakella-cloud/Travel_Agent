import React, { useState } from 'react';
import { Plane, Train, Car, Ship, ChevronDown, ChevronUp, Clock, ShieldCheck, DollarSign, Sparkles } from 'lucide-react';

export const TransportAndFaqSection: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How does the n8n Travel Agent calculate transport options and total trip cost?',
      answer:
        'When you submit your journey details, the automated n8n workflow receives your origin, destination, travel dates, passenger count, and target budget. It cross-references flight routes, rail passes, and local transport networks to formulate multi-modal travel options and allocate your budget across transport (~40%), accommodation (~35%), activities (~15%), and dining (~10%).',
    },
    {
      question: 'Can I provide customized dates or one-way routes?',
      answer:
        'Yes. While round-trip journeys calculate return logistics and duration nights automatically, you can toggle "One-Way" to plan open-ended or onward transit journeys. The return_date parameter is sent as an optional field to the n8n webhook.',
    },
    {
      question: 'What if my budget is limited or exceeds the standard presets?',
      answer:
        'You can type any specific dollar amount into the budget input (from $300 to $50,000+) or use the interactive slider. The agent recalibrates whether to prioritize budget carriers and rail passes versus premium suites and private transfers.',
    },
    {
      question: 'Is my data submitted securely to the specified n8n cloud instance?',
      answer:
        'Yes. Submissions are processed via secure multipart/form-data directly to your configured n8n cloud trigger (https://vennela0811.app.n8n.cloud/form/046dba14-f279-420e-9400-f6c479219664). No third-party data broker is involved.',
    },
  ];

  return (
    <div className="space-y-16 py-12">
      {/* Transport Matrix Section */}
      <section id="transport-matrix" className="scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <span className="text-xs font-mono tracking-widest uppercase text-amber-400 font-semibold">
            Multi-Modal Intelligence
          </span>
          <h2 className="text-3xl font-bold font-serif text-stone-100 tracking-tight">
            Comprehensive Transport Options
          </h2>
          <p className="text-sm text-stone-400">
            Compare how the agent assesses transit corridors based on speed, carbon footprint, and itinerary budget.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100 font-serif">Commercial & Direct Aviation</h3>
              <p className="text-xs text-stone-400 mt-1">Recommended for intercontinental & long-haul segments.</p>
            </div>
            <div className="space-y-2 pt-2 border-t border-stone-800 text-xs font-mono text-stone-300">
              <div className="flex justify-between">
                <span className="text-stone-500">Speed:</span>
                <span className="text-emerald-400">Fastest (800+ km/h)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Cost Share:</span>
                <span>35% - 45% of budget</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Flexibility:</span>
                <span>Fixed schedules</span>
              </div>
            </div>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100 font-serif">High-Speed & Panoramic Rail</h3>
              <p className="text-xs text-stone-400 mt-1">Unmatched for European, Japanese, and scenic regional routes.</p>
            </div>
            <div className="space-y-2 pt-2 border-t border-stone-800 text-xs font-mono text-stone-300">
              <div className="flex justify-between">
                <span className="text-stone-500">Speed:</span>
                <span className="text-sky-400">High (200-320 km/h)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Cost Share:</span>
                <span>15% - 25% of budget</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Eco-Impact:</span>
                <span className="text-emerald-400">Ultra-Low Carbon</span>
              </div>
            </div>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100 font-serif">Private Transfers & Rental</h3>
              <p className="text-xs text-stone-400 mt-1">Airport door-to-door and secluded villa or countryside exploration.</p>
            </div>
            <div className="space-y-2 pt-2 border-t border-stone-800 text-xs font-mono text-stone-300">
              <div className="flex justify-between">
                <span className="text-stone-500">Speed:</span>
                <span>Variable (60-120 km/h)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Cost Share:</span>
                <span>10% - 20% of budget</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Convenience:</span>
                <span className="text-purple-400">Maximum Autonomy</span>
              </div>
            </div>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
              <Ship className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100 font-serif">Coastal Ferries & Speedboats</h3>
              <p className="text-xs text-stone-400 mt-1">Archipelago hopping across Greek Isles, Amalfi, or Indonesian waters.</p>
            </div>
            <div className="space-y-2 pt-2 border-t border-stone-800 text-xs font-mono text-stone-300">
              <div className="flex justify-between">
                <span className="text-stone-500">Speed:</span>
                <span>Scenic (30-65 km/h)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Cost Share:</span>
                <span>5% - 15% of budget</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Experience:</span>
                <span className="text-teal-400">Panoramic Marine</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq-section" className="scroll-mt-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 space-y-2">
          <span className="text-xs font-mono tracking-widest uppercase text-amber-400 font-semibold">
            Frequently Asked Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-100 tracking-tight">
            How the Travel Automation Works
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-stone-900/80 border border-stone-800 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:text-amber-300 transition-colors"
                >
                  <span className="text-sm font-semibold text-stone-200">{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-500 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-stone-400 leading-relaxed border-t border-stone-800/60 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
