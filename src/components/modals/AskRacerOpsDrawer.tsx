import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ArrowRight,
  Database,
  CheckCircle,
  HelpCircle,
  Send,
  ExternalLink,
  Bot
} from 'lucide-react';
import { useRacerOps } from '../../context/RacerOpsContext';

export const AskRacerOpsDrawer: React.FC = () => {
  const {
    isAskRacerOpsOpen,
    setIsAskRacerOpsOpen,
    askRacerOpsHistory,
    submitAskRacerOps,
    setActiveView
  } = useRacerOps();

  const [inputVal, setInputVal] = useState('');

  if (!isAskRacerOpsOpen) return null;

  const quickPrompts = [
    'What needs my attention today?',
    'How are my businesses doing this month?',
    'What is making money this month?',
    "Which Kim's Closet products should I relist?",
    'How is NutriPlanPro performing?',
    'What content should I create next?',
    'Which leads need follow-up?',
    'Did any automation fail today?',
    'What are my biggest opportunities?'
  ];

  const handleSend = (text?: string) => {
    const q = text || inputVal;
    if (!q.trim()) return;
    submitAskRacerOps(q);
    setInputVal('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex justify-end">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-slate-100">Ask RacerOps AI</h2>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  Grounded Intelligence
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Direct querying across portfolio finances, leads, inventory, automations & apps
              </p>
            </div>
          </div>
          <button
            aria-label="Close drawer"
            onClick={() => setIsAskRacerOpsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompts Carousel */}
        <div className="px-4 py-2.5 border-b border-slate-800/80 bg-slate-950/40">
          <p className="text-[10px] font-mono uppercase text-slate-400 mb-1.5">Suggested Executive Prompts</p>
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
            {quickPrompts.slice(0, 4).map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-cyan-950/60 hover:text-cyan-300 hover:border-cyan-800 border border-slate-700/60 text-[11px] text-slate-300 transition-all font-medium flex-shrink-0"
              >
                {qp}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {askRacerOpsHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Bot className="w-10 h-10 text-cyan-400 mb-3 opacity-80" />
              <h3 className="text-sm font-semibold text-slate-200">How can I assist you today?</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Ask about revenue trends, pending leads, failed automations, aging inventory, or app releases.
              </p>
            </div>
          ) : (
            askRacerOpsHistory.map((item, idx) => (
              <div key={idx} className="space-y-3">
                {/* User Prompt */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] p-3 rounded-2xl rounded-tr-sm bg-cyan-600 text-white text-xs font-medium shadow-sm">
                    {item.question}
                  </div>
                </div>

                {/* AI Grounded Answer */}
                <div className="flex justify-start">
                  <div className="max-w-[95%] p-4 rounded-2xl rounded-tl-sm bg-slate-950 border border-slate-800 text-xs text-slate-200 space-y-3 shadow-md">
                    <div className="flex items-center space-x-2 pb-2 border-b border-slate-800/80">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-semibold text-slate-300 text-[11px]">RacerOps Intelligence</span>
                    </div>

                    <p className="leading-relaxed whitespace-pre-line text-slate-300">
                      {item.answer}
                    </p>

                    {/* Source Citations */}
                    {item.sourceReferences && item.sourceReferences.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/80 flex items-center flex-wrap gap-1.5 text-[10px]">
                        <span className="text-slate-400 flex items-center space-x-1 font-mono">
                          <Database className="w-3 h-3 text-cyan-400" />
                          <span>Sources:</span>
                        </span>
                        {item.sourceReferences.map((ref, rIdx) => (
                          <span
                            key={rIdx}
                            className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-mono"
                          >
                            {ref}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Suggested Action Button */}
                    {item.suggestedAction && (
                      <div className="pt-1">
                        <button
                          onClick={() => {
                            if (item.suggestedAction) {
                              setActiveView(item.suggestedAction.viewTarget);
                              setIsAskRacerOpsOpen(false);
                            }
                          }}
                          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/70 border border-cyan-800 text-cyan-300 hover:bg-cyan-900/60 text-[11px] font-semibold transition-colors"
                        >
                          <span>{item.suggestedAction.label}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Persistent Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask anything about your businesses..."
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-medium"
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white transition-all shadow-sm flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[10px] text-slate-400 text-center mt-2 font-mono">
            Answers are deterministically cross-referenced against your live state.
          </p>
        </div>
      </div>
    </div>
  );
};
