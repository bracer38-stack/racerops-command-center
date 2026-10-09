import React, { useState } from 'react';
import {
  X,
  Bot,
  Sparkles,
  Building2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Send
} from 'lucide-react';
import { useRacerOps } from '../../context/RacerOpsContext';
import { BusinessId } from '../../types';

export const AssignTaskModal: React.FC = () => {
  const {
    isAssignTaskModalOpen,
    setIsAssignTaskModalOpen,
    agents,
    businesses,
    assignTaskToAgent
  } = useRacerOps();

  const [selectedAgent, setSelectedAgent] = useState(agents[0]?.id || 'agent-antigravity');
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState<string>('over50fitlife');

  if (!isAssignTaskModalOpen) return null;

  const currentAgentObj = agents.find(a => a.id === selectedAgent);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    assignTaskToAgent(selectedAgent, taskTitle, selectedBusiness);
    setIsAssignTaskModalOpen(false);
    setTaskTitle('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Assign Task to AI Agent</h2>
              <p className="text-[11px] text-slate-400">
                Route operational tasks to specialized autonomous team agents
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAssignTaskModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Pick Agent */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select AI Agent
            </label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              {agents.map(ag => (
                <option key={ag.id} value={ag.id}>
                  {ag.name} — {ag.role} ({ag.status.toUpperCase()})
                </option>
              ))}
            </select>
            {currentAgentObj && (
              <div className="mt-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Capabilities: </span>
                {currentAgentObj.capabilities.join(', ')}
              </div>
            )}
          </div>

          {/* Business Context */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Business Context
            </label>
            <select
              value={selectedBusiness}
              onChange={(e) => setSelectedBusiness(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="cross-business">Cross-Business / Portfolio Wide</option>
              {businesses.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Task Instructions */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Task Directive & Instructions
            </label>
            <textarea
              rows={3}
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g., Analyze recent Over50FitLife content topics and identify 3 high-yield blog angles..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-medium"
              required
            />
          </div>

          {/* Safety Notice */}
          <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-900/60 text-[11px] text-blue-300 flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <span>
              Autonomous execution will proceed inside safe boundaries. Any consequential actions (publishing, pricing changes, messaging) will route to your Approval Inbox for sign-off.
            </span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAssignTaskModalOpen(false)}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!taskTitle.trim()}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-cyan-600/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Route & Dispatch Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
