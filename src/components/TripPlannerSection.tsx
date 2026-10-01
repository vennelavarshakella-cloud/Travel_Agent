import React, { useState } from 'react';
import { 
  Plane, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  ArrowLeftRight, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Train,
  Car,
  ShieldCheck,
  Clock,
  Compass,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { TravelFormData, SubmissionResponse } from '../types/travel.ts';

interface TripPlannerSectionProps {
  formData: TravelFormData;
  setFormData: React.Dispatch<React.SetStateAction<TravelFormData>>;
  onSubmissionSuccess: (response: SubmissionResponse) => void;
  customN8nUrl: string;
}

const POPULAR_CITIES = [
  'Tokyo, Japan',
  'Paris, France',
  'Rome, Italy',
  'London, UK',
  'Zurich, Switzerland',
  'Bali, Indonesia',
  'New York, USA',
  'Dubai, UAE',
  'Singapore',
  'Sydney, Australia',
];

const BUDGET_PRESETS = [
  { label: 'Smart Backpacker', value: 850, desc: 'Hostels, regional trains & budget carriers' },
  { label: 'Comfort Explorer', value: 1850, desc: 'Boutique hotels, direct flights & rail passes' },
  { label: 'Premium Wanderer', value: 3600, desc: '4-star resorts, express travel & private guides' },
  { label: 'Bespoke Luxury', value: 6800, desc: '5-star suites, chauffeur transfers & fine dining' },
];

export const TripPlannerSection: React.FC<TripPlannerSectionProps> = ({
  formData,
  setFormData,
  onSubmissionSuccess,
  customN8nUrl,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [submissionStep, setSubmissionStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRoundTrip, setIsRoundTrip] = useState<boolean>(Boolean(formData.return_date));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'number_of_travelers' || name === 'budget' ? Number(value) : value,
    }));
  };

  const handleSwapLocations = () => {
    setFormData((prev) => ({
      ...prev,
      From_Location: prev.To_Location,
      To_Location: prev.From_Location,
    }));
  };

  const handleTravelerCountChange = (delta: number) => {
    setFormData((prev) => ({
      ...prev,
      number_of_travelers: Math.max(1, Math.min(20, (prev.number_of_travelers || 1) + delta)),
    }));
  };

  const handleApplyBudgetPreset = (amount: number) => {
    setFormData((prev) => ({
      ...prev,
      budget: amount,
    }));
  };

  const handleToggleTripType = (roundTrip: boolean) => {
    setIsRoundTrip(roundTrip);
    if (!roundTrip) {
      setFormData((prev) => ({ ...prev, return_date: '' }));
    } else if (!formData.return_date && formData.Travel_date) {
      // Default to 7 days later
      const departure = new Date(formData.Travel_date);
      if (!isNaN(departure.getTime())) {
        departure.setDate(departure.getDate() + 7);
        setFormData((prev) => ({ ...prev, return_date: departure.toISOString().split('T')[0] }));
      }
    }
  };

  const calculateDays = () => {
    if (!formData.Travel_date || !formData.return_date) return null;
    const start = new Date(formData.Travel_date);
    const end = new Date(formData.return_date);
    const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    return diff > 0 ? diff : null;
  };

  const tripDays = calculateDays();
  const travelers = Math.max(1, formData.number_of_travelers || 1);
  const totalBudget = formData.budget || 1200;
  const perPersonBudget = Math.round(totalBudget / travelers);

  // Dynamic cost breakdown based on entered budget
  const transportCost = Math.round(totalBudget * 0.40);
  const lodgingCost = Math.round(totalBudget * 0.35);
  const activitiesCost = Math.round(totalBudget * 0.15);
  const diningCost = totalBudget - (transportCost + lodgingCost + activitiesCost);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic front validation
    if (!formData.travel_name.trim()) {
      setErrorMessage('Please enter your full name (Traveler Name).');
      return;
    }
    if (!formData.phone_number.trim()) {
      setErrorMessage('Please enter your phone number.');
      return;
    }
    if (!formData.From_Location.trim()) {
      setErrorMessage('Please enter your departure origin location.');
      return;
    }
    if (!formData.To_Location.trim()) {
      setErrorMessage('Please enter your destination location.');
      return;
    }
    if (!formData.Travel_date) {
      setErrorMessage('Please select a travel departure date.');
      return;
    }
    if (!formData.budget || formData.budget <= 0) {
      setErrorMessage('Please specify an estimated budget.');
      return;
    }

    setSubmitting(true);
    setSubmissionStep('Preparing itinerary payload...');

    try {
      setSubmissionStep('Transmitting to n8n Travel Agent Automation...');

      const response = await fetch('/api/submit-trip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          customN8nUrl: customN8nUrl || undefined,
        }),
      });

      const result = await response.json();

      if (response.ok && result.ok) {
        setSubmissionStep('Workflow triggered successfully!');
        setTimeout(() => {
          onSubmissionSuccess(result);
          setSubmitting(false);
        }, 600);
      } else {
        throw new Error(result.error || `n8n responded with error code ${response.status}`);
      }
    } catch (err: any) {
      console.error('Submission failed:', err);
      setErrorMessage(err.message || 'Failed to submit itinerary to n8n agent. Please check connection.');
      setSubmitting(false);
    }
  };

  return (
    <section id="planner-section" className="scroll-mt-20 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <span className="text-xs font-mono tracking-widest uppercase text-amber-400 font-semibold">
            n8n Automated Travel Configurator
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-stone-100 tracking-tight">
            Design Your Journey & Calculate Costs
          </h2>
          <p className="text-sm text-stone-400 leading-relaxed">
            Enter your journey details to get verified transport options, travel dates, and an estimated total trip cost calculated by the n8n travel agent automation.
          </p>
        </div>

        {/* Main Grid: Form (7 cols) + Real-time Preview (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Interactive Form */}
          <div className="lg:col-span-7 bg-stone-900/90 border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Trip Type Segmented Selector */}
              <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                <span className="text-xs font-mono uppercase tracking-wider text-stone-400">Journey Type</span>
                <div className="flex items-center p-1 bg-stone-950 rounded-lg border border-stone-800">
                  <button
                    type="button"
                    onClick={() => handleToggleTripType(true)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      isRoundTrip 
                        ? 'bg-amber-600 text-white shadow-sm' 
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Round-Trip
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleTripType(false)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      !isRoundTrip 
                        ? 'bg-amber-600 text-white shadow-sm' 
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    One-Way
                  </button>
                </div>
              </div>

              {/* Traveler Identity (Field 0, 1, 2) */}
              <div className="space-y-4">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold block">
                  1. Traveler Profile
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="travel_name" className="block text-xs font-medium text-stone-300 mb-1.5">
                      Lead Traveler Name <span className="text-amber-400">*</span>
                      <span className="text-[10px] text-stone-500 font-mono ml-1.5">(field-0)</span>
                    </label>
                    <input
                      id="travel_name"
                      type="text"
                      name="travel_name"
                      value={formData.travel_name}
                      onChange={handleInputChange}
                      placeholder="e.g. Sarah Jenkins"
                      required
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3.5 py-2.5 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone_number" className="block text-xs font-medium text-stone-300 mb-1.5">
                      Phone Number <span className="text-amber-400">*</span>
                      <span className="text-[10px] text-stone-500 font-mono ml-1.5">(field-2)</span>
                    </label>
                    <input
                      id="phone_number"
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      placeholder="e.g. +1 415 555 0199"
                      required
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3.5 py-2.5 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-stone-300 mb-1.5">
                    Email Address <span className="text-stone-500 font-normal">(for automated dispatch)</span>
                    <span className="text-[10px] text-stone-500 font-mono ml-1.5">(field-1)</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. sarah.jenkins@voyage.com"
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3.5 py-2.5 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Origin & Destination (Field 4 & 5) */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                    2. Origin & Destination
                  </span>
                  <button
                    type="button"
                    onClick={handleSwapLocations}
                    className="text-xs text-stone-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
                    title="Swap Departure and Destination"
                  >
                    <ArrowLeftRight className="w-3 h-3" />
                    Swap Cities
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="From_Location" className="block text-xs font-medium text-stone-300 mb-1.5">
                      From Location / Airport <span className="text-amber-400">*</span>
                      <span className="text-[10px] text-stone-500 font-mono ml-1.5">(field-4)</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                      <input
                        id="From_Location"
                        type="text"
                        name="From_Location"
                        value={formData.From_Location}
                        onChange={handleInputChange}
                        placeholder="Departure City (e.g. London)"
                        required
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="To_Location" className="block text-xs font-medium text-stone-300 mb-1.5">
                      To Location / Destination <span className="text-amber-400">*</span>
                      <span className="text-[10px] text-stone-500 font-mono ml-1.5">(field-5)</span>
                    </label>
                    <div className="relative">
                      <Plane className="w-4 h-4 text-amber-400 absolute left-3 top-3 rotate-45" />
                      <input
                        id="To_Location"
                        type="text"
                        name="To_Location"
                        value={formData.To_Location}
                        onChange={handleInputChange}
                        placeholder="Destination (e.g. Rome)"
                        required
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Popular Destinations Quick Click */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-stone-500 mr-1">Popular:</span>
                  {POPULAR_CITIES.slice(0, 5).map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, To_Location: city }))}
                      className="text-[11px] px-2 py-0.5 bg-stone-950 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800/80 rounded transition-colors"
                    >
                      {city.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dates & Travelers (Field 6, 7 & 3) */}
              <div className="space-y-4 pt-2">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold block">
                  3. Travel Dates & Party Size
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="Travel_date" className="block text-xs font-medium text-stone-300 mb-1.5">
                      Travel Date <span className="text-amber-400">*</span>
                      <span className="text-[10px] text-stone-500 font-mono ml-1.5">(field-6)</span>
                    </label>
                    <input
                      id="Travel_date"
                      type="date"
                      name="Travel_date"
                      value={formData.Travel_date}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2.5 text-sm text-stone-100 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="return_date" className="block text-xs font-medium text-stone-300 mb-1.5">
                      Return Date {isRoundTrip ? <span className="text-amber-400">*</span> : <span className="text-stone-500 font-normal">(Optional)</span>}
                      <span className="text-[10px] text-stone-500 font-mono ml-1.5">(field-7)</span>
                    </label>
                    <input
                      id="return_date"
                      type="date"
                      name="return_date"
                      value={formData.return_date}
                      onChange={handleInputChange}
                      disabled={!isRoundTrip}
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2.5 text-sm text-stone-100 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="number_of_travelers" className="block text-xs font-medium text-stone-300 mb-1.5">
                      Travelers <span className="text-amber-400">*</span>
                      <span className="text-[10px] text-stone-500 font-mono ml-1.5">(field-3)</span>
                    </label>
                    <div className="flex items-center bg-stone-950 border border-stone-800 rounded-lg">
                      <button
                        type="button"
                        onClick={() => handleTravelerCountChange(-1)}
                        className="px-3 py-2.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800/60 rounded-l-lg transition-colors text-sm font-bold"
                        aria-label="Decrease travelers"
                      >
                        -
                      </button>
                      <input
                        id="number_of_travelers"
                        type="number"
                        name="number_of_travelers"
                        value={formData.number_of_travelers}
                        onChange={handleInputChange}
                        min={1}
                        max={30}
                        required
                        className="w-full text-center bg-transparent py-2.5 text-sm font-semibold text-stone-100 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleTravelerCountChange(1)}
                        className="px-3 py-2.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800/60 rounded-r-lg transition-colors text-sm font-bold"
                        aria-label="Increase travelers"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {tripDays && (
                  <div className="text-xs text-stone-400 font-mono bg-stone-950/60 border border-stone-800/60 rounded-lg p-2.5 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Duration: <strong className="text-stone-200">{tripDays} Days / {tripDays - 1} Nights</strong></span>
                  </div>
                )}
              </div>

              {/* Budget Allocation (Field 8) */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                    4. Planned Budget
                  </span>
                  <span className="text-xs text-stone-400 font-mono">
                    Estimated: <strong className="text-amber-400 text-sm font-bold">${formData.budget.toLocaleString()}</strong>
                  </span>
                </div>

                <div className="relative">
                  <DollarSign className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    min={100}
                    step={50}
                    placeholder="Planned total budget in USD"
                    required
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg pl-9 pr-3.5 py-2.5 text-sm font-mono text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                {/* Range Slider */}
                <input
                  type="range"
                  min={300}
                  max={15000}
                  step={100}
                  value={formData.budget}
                  onChange={(e) => setFormData((prev) => ({ ...prev, budget: Number(e.target.value) }))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
                />

                {/* Budget Presets */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {BUDGET_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleApplyBudgetPreset(preset.value)}
                      className={`p-2 rounded-lg text-left border transition-all ${
                        formData.budget === preset.value
                          ? 'bg-amber-500/10 border-amber-500/50 text-amber-300'
                          : 'bg-stone-950/60 border-stone-800/80 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <span className="block text-[11px] font-semibold text-stone-200">${preset.value.toLocaleString()}</span>
                      <span className="block text-[10px] text-stone-500 truncate">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Notice */}
              {errorMessage && (
                <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{errorMessage}</div>
                </div>
              )}

              {/* Submit Action */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-stone-950 font-semibold text-sm rounded-xl transition-all shadow-lg shadow-amber-950/30 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                      <span>{submissionStep || 'Transmitting to Travel Agent...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Transmit Itinerary to n8n Travel Agent</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-[11px] text-stone-500 mt-3 font-mono">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Direct Multipart/Form-Data Post
                  </span>
                  <span>Endpoint: vennela0811.app.n8n.cloud</span>
                </div>
              </div>
            </form>
          </div>

          {/* Right: Live Itinerary Projection & Cost Matrix */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Route Projection Card */}
            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-6 shadow-xl backdrop-blur space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  Live Trip Projection
                </span>
                <span className="text-[11px] font-mono text-stone-400">
                  {travelers} {travelers === 1 ? 'Traveler' : 'Travelers'}
                </span>
              </div>

              {/* Route Graphics */}
              <div className="p-4 bg-stone-950/80 border border-stone-800/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase font-mono block">Origin</span>
                    <span className="text-base font-bold text-stone-100">
                      {formData.From_Location || 'Choose Origin'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-400">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <div className="w-12 h-px bg-stone-700 relative">
                      <Plane className="w-3.5 h-3.5 absolute -top-1.5 left-1/2 -translate-x-1/2 rotate-45" />
                    </div>
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-stone-500 uppercase font-mono block">Destination</span>
                    <span className="text-base font-bold text-stone-100">
                      {formData.To_Location || 'Choose Destination'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-stone-400 border-t border-stone-800/80 pt-2 font-mono">
                  <span>Dep: {formData.Travel_date || 'TBD'}</span>
                  <span>Ret: {formData.return_date || 'One-Way'}</span>
                </div>
              </div>

              {/* Cost Allocation Visualizer */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-300 font-medium">Estimated Cost Distribution</span>
                  <span className="text-amber-400 font-mono font-semibold">
                    ~${perPersonBudget.toLocaleString()} / person
                  </span>
                </div>

                <div className="h-2 w-full bg-stone-800 rounded-full overflow-hidden flex">
                  <div style={{ width: '40%' }} className="bg-amber-500" title="Transport (40%)" />
                  <div style={{ width: '35%' }} className="bg-emerald-500" title="Lodging (35%)" />
                  <div style={{ width: '15%' }} className="bg-sky-500" title="Activities (15%)" />
                  <div style={{ width: '10%' }} className="bg-purple-500" title="Dining (10%)" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                  <div className="p-2.5 bg-stone-950/60 border border-stone-800/60 rounded-lg">
                    <div className="text-[10px] text-stone-400 flex items-center gap-1">
                      <Plane className="w-3 h-3 text-amber-400" />
                      Transport (40%)
                    </div>
                    <div className="text-sm font-semibold text-stone-200 mt-0.5">
                      ${transportCost.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-2.5 bg-stone-950/60 border border-stone-800/60 rounded-lg">
                    <div className="text-[10px] text-stone-400 flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      Hotels & Stays (35%)
                    </div>
                    <div className="text-sm font-semibold text-stone-200 mt-0.5">
                      ${lodgingCost.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-2.5 bg-stone-950/60 border border-stone-800/60 rounded-lg">
                    <div className="text-[10px] text-stone-400 flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                      Sightseeing (15%)
                    </div>
                    <div className="text-sm font-semibold text-stone-200 mt-0.5">
                      ${activitiesCost.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-2.5 bg-stone-950/60 border border-stone-800/60 rounded-lg">
                    <div className="text-[10px] text-stone-400 flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                      Dining & Misc (10%)
                    </div>
                    <div className="text-sm font-semibold text-stone-200 mt-0.5">
                      ${diningCost.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Transport Matrix Preview */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-mono uppercase tracking-wider text-stone-400 block">
                  Transport Options Evaluated by n8n
                </span>

                <div className="space-y-2">
                  <div className="p-3 bg-stone-950/60 border border-stone-800/60 rounded-lg flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-amber-500/10 text-amber-400 flex items-center justify-center">
                        <Plane className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-stone-200">Scheduled Flight</div>
                        <div className="text-[11px] text-stone-400">Fastest transit · Checked baggage allocation</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400 font-medium">Optimal</span>
                  </div>

                  <div className="p-3 bg-stone-950/60 border border-stone-800/60 rounded-lg flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-sky-500/10 text-sky-400 flex items-center justify-center">
                        <Train className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-stone-200">High-Speed Rail</div>
                        <div className="text-[11px] text-stone-400">Scenic corridors · Zero baggage stress</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-stone-400 font-medium">Eco-friendly</span>
                  </div>

                  <div className="p-3 bg-stone-950/60 border border-stone-800/60 rounded-lg flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-purple-500/10 text-purple-400 flex items-center justify-center">
                        <Car className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-stone-200">Private Transfer</div>
                        <div className="text-[11px] text-stone-400">Door-to-door flexibility</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-stone-400 font-medium">On-Demand</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Workflow Quick Status Badge */}
            <div className="p-4 bg-stone-950/60 border border-stone-800/60 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-stone-300 font-medium">n8n Cloud Automation Live</span>
              </div>
              <span className="font-mono text-[11px] text-stone-400">ID: 046dba14...</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
