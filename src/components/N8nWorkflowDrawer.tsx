import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink, 
  Layers, 
  Send, 
  ShieldCheck, 
  SlidersHorizontal,
  History
} from 'lucide-react';
import { SubmissionResponse } from '../types/travel.ts';

interface N8nWorkflowDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  n8nUrl: string;
  onUpdateN8nUrl: (newUrl: string) => void;
  submissionHistory: SubmissionResponse[];
}

export const N8nWorkflowDrawer: React.FC<N8nWorkflowDrawerProps> = ({
  isOpen,
  onClose,
  n8nUrl,
  onUpdateN8nUrl,
  submissionHistory,
}) => {
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [inputUrl, setInputUrl] = useState(n8nUrl);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestResult(null);
    try {
      const res = await fetch(`/api/test-n8n?url=${encodeURIComponent(inputUrl)}`);
      const data = await res.json();
      if (res.ok && data.ok) {
        setTestStatus('success');
        setTestResult(data.message || `Connected! Status HTTP ${data.status}`);
      } else {
        setTestStatus('error');
        setTestResult(data.error || `HTTP ${data.status} response from endpoint`);
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestResult(err.message || 'Network error attempting to ping n8n endpoint');
    }
  };

  const handleSaveUrl = () => {
    onUpdateN8nUrl(inputUrl);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleResetDefault = () => {
    const defaultUrl = 'https://vennela0811.app.n8n.cloud/form/046dba14-f279-420e-9400-f6c479219664';
    setInputUrl(defaultUrl);
    onUpdateN8nUrl(defaultUrl);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-xl bg-stone-900 border-l border-stone-800 h-full flex flex-col shadow-2xl text-stone-200 overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-stone-800 flex items-center justify-between sticky top-0 bg-stone-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-100 font-serif">n8n Workflow Hub</h2>
              <p className="text-xs text-stone-400">Direct cloud automation trigger & parameters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Active Endpoint Config */}
          <div className="bg-stone-950/80 border border-stone-800/80 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="n8n-url-input" className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Target n8n Form Endpoint
              </label>
              <button
                onClick={handleResetDefault}
                className="text-xs text-stone-400 hover:text-stone-200 underline decoration-dotted"
              >
                Reset Default
              </button>
            </div>

            <input
              id="n8n-url-input"
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700/80 rounded-lg px-3.5 py-2.5 text-xs font-mono text-stone-200 focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="https://vennela0811.app.n8n.cloud/form/..."
            />

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleTestConnection}
                disabled={testStatus === 'testing'}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-md transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
                {testStatus === 'testing' ? 'Verifying...' : 'Ping Endpoint'}
              </button>
              <button
                onClick={handleSaveUrl}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium rounded-md transition-colors"
              >
                {isSaved ? 'Saved!' : 'Apply URL'}
              </button>
              <a
                href={inputUrl}
                target="_blank"
                rel="noreferrer"
                className="ml-auto flex items-center gap-1 text-xs text-stone-400 hover:text-amber-400 transition-colors"
              >
                Open n8n UI <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {testResult && (
              <div className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                testStatus === 'success' 
                  ? 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-300' 
                  : 'bg-rose-950/40 border border-rose-800/60 text-rose-300'
              }`}>
                {testStatus === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                <div>{testResult}</div>
              </div>
            )}
          </div>

          {/* Chatbot Webhook Overview */}
          <div className="bg-stone-950/80 border border-stone-800/80 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                n8n Chatbot Webhook
              </span>
              <span className="text-[10px] font-mono text-stone-500">ID: 76c515fa...</span>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-lg p-2.5 text-xs font-mono text-stone-300 break-all">
              https://vennela0811.app.n8n.cloud/webhook/76c515fa-5e07-4c05-bf40-92cb512b41d8/chat
            </div>

            <p className="text-xs text-stone-400 leading-relaxed">
              Provides real-time conversation and itinerary assistance docked at the bottom-right of the site. Can be toggled between Production (<code className="text-amber-300">/webhook/</code>) and Canvas Test (<code className="text-amber-300">/webhook-test/</code>) mode.
            </p>
          </div>

          {/* Form Field Architecture Mapping */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-stone-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Payload Schema Mapping (9 Parameters)
            </h3>
            <p className="text-xs text-stone-400">
              When submitted, the travel application converts form values into standard multipart/form-data matching both n8n positional IDs (<code className="text-amber-300">field-0..8</code>) and named attributes:
            </p>

            <div className="border border-stone-800 rounded-lg overflow-hidden text-xs">
              <div className="grid grid-cols-12 bg-stone-950 text-stone-400 font-medium p-2.5 border-b border-stone-800">
                <span className="col-span-3">n8n Field ID</span>
                <span className="col-span-5">Workflow Variable</span>
                <span className="col-span-4">Type & Constraint</span>
              </div>
              <div className="divide-y divide-stone-800/60 font-mono">
                <div className="grid grid-cols-12 p-2.5 bg-stone-900/60">
                  <span className="col-span-3 text-amber-400">field-0</span>
                  <span className="col-span-5 font-sans text-stone-200">travel_name</span>
                  <span className="col-span-4 font-sans text-stone-400">Text · Required</span>
                </div>
                <div className="grid grid-cols-12 p-2.5 bg-stone-900/30">
                  <span className="col-span-3 text-amber-400">field-1</span>
                  <span className="col-span-5 font-sans text-stone-200">email</span>
                  <span className="col-span-4 font-sans text-stone-400">Email · Optional</span>
                </div>
                <div className="grid grid-cols-12 p-2.5 bg-stone-900/60">
                  <span className="col-span-3 text-amber-400">field-2</span>
                  <span className="col-span-5 font-sans text-stone-200">phone_number</span>
                  <span className="col-span-4 font-sans text-stone-400">Number · Required</span>
                </div>
                <div className="grid grid-cols-12 p-2.5 bg-stone-900/30">
                  <span className="col-span-3 text-amber-400">field-3</span>
                  <span className="col-span-5 font-sans text-stone-200">number_of_travelers</span>
                  <span className="col-span-4 font-sans text-stone-400">Integer · Required</span>
                </div>
                <div className="grid grid-cols-12 p-2.5 bg-stone-900/60">
                  <span className="col-span-3 text-amber-400">field-4</span>
                  <span className="col-span-5 font-sans text-stone-200">From_Location</span>
                  <span className="col-span-4 font-sans text-stone-400">Text · Required</span>
                </div>
                <div className="grid grid-cols-12 p-2.5 bg-stone-900/30">
                  <span className="col-span-3 text-amber-400">field-5</span>
                  <span className="col-span-5 font-sans text-stone-200">To_Location</span>
                  <span className="col-span-4 font-sans text-stone-400">Text · Required</span>
                </div>
                <div className="grid grid-cols-12 p-2.5 bg-stone-900/60">
                  <span className="col-span-3 text-amber-400">field-6</span>
                  <span className="col-span-5 font-sans text-stone-200">Travel_date</span>
                  <span className="col-span-4 font-sans text-stone-400">Date · Required</span>
                </div>
                <div className="grid grid-cols-12 p-2.5 bg-stone-900/30">
                  <span className="col-span-3 text-amber-400">field-7</span>
                  <span className="col-span-5 font-sans text-stone-200">return_date</span>
                  <span className="col-span-4 font-sans text-stone-400">Date · Optional</span>
                </div>
                <div className="grid grid-cols-12 p-2.5 bg-stone-900/60">
                  <span className="col-span-3 text-amber-400">field-8</span>
                  <span className="col-span-5 font-sans text-stone-200">budget</span>
                  <span className="col-span-4 font-sans text-stone-400">Number · Required</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submission History */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-stone-100 flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" />
              Session Submission Logs ({submissionHistory.length})
            </h3>
            {submissionHistory.length === 0 ? (
              <div className="p-4 bg-stone-950/40 border border-stone-800 rounded-lg text-center text-xs text-stone-500">
                No submissions dispatched in this session yet. Submit a journey through the planner to record events.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {submissionHistory.map((item, idx) => (
                  <div key={idx} className="p-3 bg-stone-950/70 border border-stone-800 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-amber-400 font-medium">{item.bookingReference || `Ref #${idx + 1}`}</span>
                      <span className="text-[11px] text-stone-400">
                        {item.submittedAt ? new Date(item.submittedAt).toLocaleTimeString() : 'Just now'}
                      </span>
                    </div>
                    {item.details && (
                      <div className="text-stone-300">
                        {item.details.From_Location} ➔ {item.details.To_Location} ({item.details.number_of_travelers} pax) · ${item.details.budget}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      HTTP 200 acknowledged by n8n workflow
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950 flex items-center justify-between text-xs text-stone-400">
          <span>Automated Agent ID: 046dba14...</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
