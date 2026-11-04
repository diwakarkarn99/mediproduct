import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  ShieldAlert,
  Bot,
  User as UserIcon,
  HelpCircle,
  FileText,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { askMediTrackAssistant } from '../../services/geminiAssistant';
import { StorageService } from '../../services/storageService';

interface AssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFillMedicineForm?: (extractedData: { name: string; dosage: string; instructions: string; reminderTime: string }) => void;
}

export const AssistantModal: React.FC<AssistantModalProps> = ({
  isOpen,
  onClose,
  onFillMedicineForm
}) => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([
    {
      sender: 'assistant',
      text: "Hello! I am your MediTrack digital assistant. I can guide you through adding medicines, setting reminders, using Easy Mode, or explaining your daily schedule. How can I help you today?"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [hasConsent, setHasConsent] = useState(() => StorageService.getAiConsent());

  // Form filling helper state
  const [pasteText, setPasteText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<{ name: string; dosage: string; instructions: string; reminderTime: string } | null>(null);

  if (!isOpen) return null;

  const handleGrantConsent = () => {
    StorageService.setAiConsent(true);
    setHasConsent(true);
  };

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || prompt).trim();
    if (!q || loading) return;

    setMessages(prev => [...prev, { sender: 'user', text: q }]);
    setPrompt('');
    setLoading(true);

    try {
      const response = await askMediTrackAssistant(q);
      setMessages(prev => [...prev, { sender: 'assistant', text: response }]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: "I am ready to help with application questions! You can ask how to add medicines or view your schedule."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Text-to-form parser helper (strictly extracts text with user review)
  const handleParseText = () => {
    if (!pasteText.trim()) return;

    // Safe regex-based extraction
    const text = pasteText;

    // Simple robust heuristics for demo
    let medName = 'Prescription Item';
    let dosage = 'As directed';
    let instructions = text;
    let time = '08:00';

    if (text.toLowerCase().includes('lisinopril')) medName = 'Lisinopril';
    else if (text.toLowerCase().includes('metformin')) medName = 'Metformin';
    else if (text.toLowerCase().includes('atorvastatin')) medName = 'Atorvastatin';
    else if (text.toLowerCase().includes('vitamin d')) medName = 'Vitamin D3';
    else {
      const firstWord = text.split(' ')[0];
      if (firstWord) medName = firstWord;
    }

    const mgMatch = text.match(/(\d+\s*(?:mg|mcg|iu|g|ml|tablets?|capsules?))/i);
    if (mgMatch) dosage = mgMatch[1];

    if (text.toLowerCase().includes('morning') || text.toLowerCase().includes('breakfast')) time = '08:00';
    if (text.toLowerCase().includes('afternoon') || text.toLowerCase().includes('lunch')) time = '13:00';
    if (text.toLowerCase().includes('evening') || text.toLowerCase().includes('dinner') || text.toLowerCase().includes('night')) time = '19:00';

    setParsedPreview({
      name: medName,
      dosage,
      instructions: text,
      reminderTime: time
    });
  };

  const handleApplyForm = () => {
    if (parsedPreview && onFillMedicineForm) {
      onFillMedicineForm(parsedPreview);
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-[#E8E2D8] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#1E3326] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F95518] text-white flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-white">
                MediTrack Digital Assistant
              </h2>
              <p className="text-xs text-emerald-200">
                Application guidance & schedule assistance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Safety Disclaimer Banner */}
        <div className="bg-amber-50 px-6 py-2.5 border-b border-amber-200 text-amber-900 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Safety Boundary:</strong> This assistant explains how to use MediTrack. It cannot provide clinical diagnoses, medical advice, or dosage alterations. Always consult your prescribing physician.
          </span>
        </div>

        {!hasConsent ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <Bot className="w-14 h-14 text-teal-800 mx-auto" />
            <h3 className="font-heading text-xl font-bold text-slate-900">
              AI Guide Requires Consent
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              To consult the MediTrack digital assistant, please provide your consent. Your private medical documents and health data remain strictly confidential.
            </p>
            <button
              onClick={handleGrantConsent}
              className="px-6 py-3 bg-[#1E3326] hover:bg-[#15251C] text-white font-bold text-xs rounded-xl"
            >
              Grant Consent & Enable Assistant
            </button>
          </div>
        ) : (
          <>
            {/* Conversation Area */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 bg-[#FAF8F5]">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                      AI
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-[#1E3326] text-white rounded-br-none'
                        : 'bg-white border border-[#E8E2D8] text-slate-800 rounded-bl-none shadow-2xs whitespace-pre-line'
                    }`}
                  >
                    {m.text}
                    {m.sender === 'assistant' && (
                      <span className="block text-[10px] text-slate-400 mt-2 font-semibold">
                        AI-Generated Guide · MediTrack Safety Bounds
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-2 items-center text-xs text-slate-500 italic">
                  <Sparkles className="w-4 h-4 text-[#F95518] animate-spin" />
                  <span>Thinking safely...</span>
                </div>
              )}
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-6 py-2.5 bg-white border-t border-slate-200 flex flex-wrap gap-2">
              <button
                onClick={() => handleSend("How do I add a new medicine?")}
                className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                How to add medicine?
              </button>
              <button
                onClick={() => handleSend("Summarize my medicine routine today")}
                className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Summarize today's routine
              </button>
              <button
                onClick={() => handleSend("How does Family Sharing work?")}
                className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Family sharing rules
              </button>
              <button
                onClick={() => handleSend("Explain my weekly adherence progress")}
                className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Weekly adherence report
              </button>
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask how to use MediTrack or summarize routine..."
                className="flex-1 px-4 py-3 bg-[#FAF8F5] border border-slate-300 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#F95518]"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !prompt.trim()}
                className="p-3 bg-[#F95518] hover:bg-[#e0470f] disabled:opacity-50 text-white rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
