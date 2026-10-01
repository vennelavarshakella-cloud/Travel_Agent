import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { TripPlannerSection } from './components/TripPlannerSection.tsx';
import { DestinationsSection } from './components/DestinationsSection.tsx';
import { ChatbotSection } from './components/ChatbotSection.tsx';
import { TransportAndFaqSection } from './components/TransportAndFaqSection.tsx';
import { Footer } from './components/Footer.tsx';
import { N8nWorkflowDrawer } from './components/N8nWorkflowDrawer.tsx';
import { BookingConfirmationModal } from './components/BookingConfirmationModal.tsx';
import { N8nChatbot } from './components/N8nChatbot.tsx';
import { TravelFormData, SubmissionResponse, CuratedDestination } from './types/travel.ts';

const DEFAULT_N8N_URL = 'https://vennela0811.app.n8n.cloud/form/046dba14-f279-420e-9400-f6c479219664';

export default function App() {
  // Pre-calculate convenient default dates (2 weeks from today, 9 days duration)
  const defaultDeparture = new Date();
  defaultDeparture.setDate(defaultDeparture.getDate() + 14);
  const departureStr = defaultDeparture.toISOString().split('T')[0];

  const defaultReturn = new Date();
  defaultReturn.setDate(defaultReturn.getDate() + 23);
  const returnStr = defaultReturn.toISOString().split('T')[0];

  const [formData, setFormData] = useState<TravelFormData>({
    travel_name: '',
    email: '',
    phone_number: '',
    number_of_travelers: 2,
    From_Location: 'New York, USA',
    To_Location: 'Tokyo, Japan',
    Travel_date: departureStr,
    return_date: returnStr,
    budget: 3500,
  });

  const [activeSubmission, setActiveSubmission] = useState<SubmissionResponse | null>(null);
  const [submissionHistory, setSubmissionHistory] = useState<SubmissionResponse[]>([]);
  const [isWorkflowDrawerOpen, setIsWorkflowDrawerOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [customN8nUrl, setCustomN8nUrl] = useState<string>(DEFAULT_N8N_URL);
  const [n8nStatus, setN8nStatus] = useState<'connected' | 'checking' | 'error'>('checking');

  // Verify connection to n8n on mount
  useEffect(() => {
    let mounted = true;
    const checkConnection = async () => {
      try {
        const res = await fetch(`/api/test-n8n?url=${encodeURIComponent(customN8nUrl)}`);
        const data = await res.json();
        if (mounted) {
          if (res.ok && data.ok) {
            setN8nStatus('connected');
          } else {
            setN8nStatus('error');
          }
        }
      } catch {
        if (mounted) setN8nStatus('error');
      }
    };

    checkConnection();
    return () => {
      mounted = false;
    };
  }, [customN8nUrl]);

  const handleSubmissionSuccess = (response: SubmissionResponse) => {
    setActiveSubmission(response);
    setSubmissionHistory((prev) => [response, ...prev]);
  };

  const handleSelectCuratedDestination = (dest: CuratedDestination) => {
    const departure = new Date();
    departure.setDate(departure.getDate() + 21);
    const depStr = departure.toISOString().split('T')[0];

    const returning = new Date(departure);
    returning.setDate(returning.getDate() + dest.durationDays);
    const retStr = returning.toISOString().split('T')[0];

    setFormData((prev) => ({
      ...prev,
      From_Location: dest.origin,
      To_Location: dest.destination,
      budget: dest.recommendedBudget,
      Travel_date: depStr,
      return_date: retStr,
    }));

    // Smooth scroll to planner
    const plannerEl = document.getElementById('planner-section');
    if (plannerEl) {
      plannerEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToPlanner = () => {
    const plannerEl = document.getElementById('planner-section');
    if (plannerEl) {
      plannerEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToDestinations = () => {
    const destEl = document.getElementById('destinations-section');
    if (destEl) {
      destEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToChatbot = () => {
    const chatEl = document.getElementById('chatbot-section');
    if (chatEl) {
      chatEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      setIsChatOpen(true);
    }
  };

  const handleApplyRouteFromChat = (origin: string, destination: string, budget?: number) => {
    setFormData((prev) => ({
      ...prev,
      From_Location: origin || prev.From_Location,
      To_Location: destination || prev.To_Location,
      budget: budget || prev.budget,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0e12] text-stone-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Header */}
      <Header
        onOpenWorkflowDrawer={() => setIsWorkflowDrawerOpen(true)}
        onScrollToPlanner={scrollToPlanner}
        onOpenChat={scrollToChatbot}
        n8nStatus={n8nStatus}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection
          onPlanClick={scrollToPlanner}
          onExploreClick={scrollToDestinations}
          onOpenChat={scrollToChatbot}
        />

        {/* Dedicated Live n8n Chatbot Workspace Section */}
        <ChatbotSection
          onApplyRouteToForm={handleApplyRouteFromChat}
        />

        {/* Curated Corridors Showcase */}
        <DestinationsSection
          onSelectDestination={handleSelectCuratedDestination}
        />

        {/* Core Trip Planner & Cost Matrix (Direct n8n Form Integration) */}
        <TripPlannerSection
          formData={formData}
          setFormData={setFormData}
          onSubmissionSuccess={handleSubmissionSuccess}
          customN8nUrl={customN8nUrl}
        />

        {/* Transport Matrix & Workflow FAQs */}
        <TransportAndFaqSection />
      </main>

      {/* Footer */}
      <Footer onOpenWorkflowDrawer={() => setIsWorkflowDrawerOpen(true)} />

      {/* Booking Confirmation / Boarding Voucher Modal */}
      <BookingConfirmationModal
        submission={activeSubmission}
        onClose={() => setActiveSubmission(null)}
        onPlanAnother={() => {
          setActiveSubmission(null);
          scrollToPlanner();
        }}
      />

      {/* n8n Workflow Inspector Drawer */}
      <N8nWorkflowDrawer
        isOpen={isWorkflowDrawerOpen}
        onClose={() => setIsWorkflowDrawerOpen(false)}
        n8nUrl={customN8nUrl}
        onUpdateN8nUrl={(url) => setCustomN8nUrl(url)}
        submissionHistory={submissionHistory}
      />

      {/* Floating n8n Chatbot Widget */}
      <N8nChatbot
        isOpen={isChatOpen}
        setIsOpen={setIsChatOpen}
        onApplyItineraryToForm={(dest, bud) => {
          setFormData((prev) => ({
            ...prev,
            To_Location: dest,
            budget: bud || prev.budget,
          }));
          setIsChatOpen(false);
          scrollToPlanner();
        }}
      />
    </div>
  );
}
