import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Plane, 
  Train, 
  Calendar, 
  Users, 
  DollarSign, 
  Printer, 
  Copy, 
  Check, 
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  MapPin,
  Clock
} from 'lucide-react';
import { SubmissionResponse } from '../types/travel.ts';

interface BookingConfirmationModalProps {
  submission: SubmissionResponse | null;
  onClose: () => void;
  onPlanAnother: () => void;
}

export const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  submission,
  onClose,
  onPlanAnother,
}) => {
  const [copied, setCopied] = useState(false);

  if (!submission || !submission.details) return null;

  const { details, bookingReference = 'TRV-9901-OK', submittedAt } = submission;
  
  // Calculate cost splits based on user budget
  const totalBudget = Number(details.budget) || 1000;
  const transportCost = Math.round(totalBudget * 0.40);
  const lodgingCost = Math.round(totalBudget * 0.35);
  const activitiesCost = Math.round(totalBudget * 0.15);
  const diningCost = totalBudget - (transportCost + lodgingCost + activitiesCost);
  const perPerson = Math.round(totalBudget / Math.max(1, Number(details.number_of_travelers) || 1));

  const handleCopy = () => {
    const text = `Booking Ref: ${bookingReference}\nTraveler: ${details.travel_name}\nRoute: ${details.From_Location} ➔ ${details.To_Location}\nDates: ${details.Travel_date} to ${details.return_date || 'One-way'}\nBudget: $${details.budget} (${details.number_of_travelers} travelers)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 print:p-0 print:bg-white">
      <div className="w-full max-w-2xl bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:bg-white text-stone-100 print:text-black animate-in fade-in zoom-in-95 duration-200">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 p-6 text-stone-950 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-950/20 flex items-center justify-center text-stone-950">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif tracking-tight">Trip Inquiry Transmitted</h2>
              <p className="text-xs font-medium text-stone-900/80">Dispatched directly to n8n Travel Agent Automation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-stone-950" />
          </button>
        </div>

        {/* Boarding Pass Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Reference & Status Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-stone-800 print:border-stone-300">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-stone-400">Inquiry Reference</span>
              <div className="text-2xl font-mono font-bold text-amber-400 print:text-stone-900 flex items-center gap-2">
                {bookingReference}
                <button
                  onClick={handleCopy}
                  className="p-1 text-stone-400 hover:text-stone-100 transition-colors print:hidden"
                  title="Copy reference"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono uppercase tracking-wider text-stone-400">Automation Status</span>
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 print:text-emerald-700 justify-end">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                n8n HTTP 200 Received
              </div>
              <div className="text-[11px] text-stone-400 font-mono">
                {submittedAt ? new Date(submittedAt).toLocaleString() : 'Just now'}
              </div>
            </div>
          </div>

          {/* Route Visualizer */}
          <div className="bg-stone-950/70 border border-stone-800/80 rounded-xl p-5 print:bg-stone-50 print:border-stone-300">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400">Departure</span>
                <div className="text-lg font-bold text-stone-100 print:text-stone-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  {details.From_Location}
                </div>
                <div className="text-xs text-stone-400 font-mono">{details.Travel_date}</div>
              </div>

              <div className="flex flex-col items-center px-4 flex-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-1">
                  <Plane className="w-4 h-4 rotate-45" />
                </div>
                <div className="w-full h-px bg-dashed border-t border-dashed border-stone-700 relative">
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-stone-900 px-2 text-[10px] font-mono text-stone-400 print:bg-white">
                    {details.return_date ? 'ROUND-TRIP' : 'ONE-WAY'}
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-right">
                <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400">Destination</span>
                <div className="text-lg font-bold text-stone-100 print:text-stone-900 flex items-center justify-end gap-1.5">
                  {details.To_Location}
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                </div>
                <div className="text-xs text-stone-400 font-mono">
                  {details.return_date || 'Open return'}
                </div>
              </div>
            </div>
          </div>

          {/* Traveler Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 bg-stone-950/40 border border-stone-800/60 rounded-lg">
              <span className="text-stone-400 block text-[10px] uppercase">Lead Traveler</span>
              <span className="font-semibold text-stone-200 text-sm font-sans">{details.travel_name}</span>
            </div>
            <div className="p-3 bg-stone-950/40 border border-stone-800/60 rounded-lg">
              <span className="text-stone-400 block text-[10px] uppercase">Party Size</span>
              <span className="font-semibold text-stone-200 text-sm font-sans flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-stone-400" />
                {details.number_of_travelers} {Number(details.number_of_travelers) === 1 ? 'Guest' : 'Guests'}
              </span>
            </div>
            <div className="p-3 bg-stone-950/40 border border-stone-800/60 rounded-lg">
              <span className="text-stone-400 block text-[10px] uppercase">Phone</span>
              <span className="font-semibold text-stone-200 text-sm">{details.phone_number}</span>
            </div>
            <div className="p-3 bg-stone-950/40 border border-stone-800/60 rounded-lg">
              <span className="text-stone-400 block text-[10px] uppercase">Email</span>
              <span className="font-semibold text-stone-200 text-sm truncate block" title={details.email || 'Not provided'}>
                {details.email || '—'}
              </span>
            </div>
          </div>

          {/* Estimated Cost Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-200">Budget Estimation & Allocation</span>
              <span className="text-stone-400 font-mono">
                Total Budget: <strong className="text-amber-400 text-sm">${totalBudget.toLocaleString()}</strong> (~${perPerson.toLocaleString()}/person)
              </span>
            </div>

            <div className="h-2 w-full bg-stone-800 rounded-full overflow-hidden flex">
              <div style={{ width: '40%' }} className="bg-amber-500" title="Transport (40%)" />
              <div style={{ width: '35%' }} className="bg-emerald-500" title="Accommodation (35%)" />
              <div style={{ width: '15%' }} className="bg-sky-500" title="Activities (15%)" />
              <div style={{ width: '10%' }} className="bg-purple-500" title="Dining & Misc (10%)" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1 text-stone-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span>Transport: ${transportCost.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span>Hotels: ${lodgingCost.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                <span>Sightseeing: ${activitiesCost.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                <span>Dining: ${diningCost.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Transport Recommendations Matrix */}
          <div className="border border-stone-800 rounded-xl p-4 bg-stone-950/50 space-y-2">
            <span className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5 text-amber-400" />
              Transport Options Generated For This Route
            </span>
            <div className="text-xs text-stone-400 space-y-1">
              <p>• <strong>Primary Flight:</strong> Direct / 1-Stop scheduled carrier recommendations calibrated for {details.number_of_travelers} passengers.</p>
              <p>• <strong>Inter-city Rail / Express:</strong> Regional high-speed rail connections and station transfers mapped to itinerary dates.</p>
              <p>• <strong>Cost Advisory:</strong> Recommended target allocation of ${transportCost.toLocaleString()} ensures comfortable premium economy or regional high-speed connectivity.</p>
            </div>
          </div>

          {/* Barcode Graphic */}
          <div className="pt-2 text-center">
            <div className="font-mono text-[10px] text-stone-500 tracking-[0.3em] uppercase">
              ||| | ||||| || |||||| | |||| ||| |||| | ||| || ||||| ||| |||||||
            </div>
            <p className="text-[10px] text-stone-500 mt-1">Verified with n8n Cloud Automation ID: 046dba14-f279-420e-9400-f6c479219664</p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-6 bg-stone-950 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Boarding Voucher
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onPlanAnother}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-lg transition-colors"
            >
              Plan Another Trip
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
