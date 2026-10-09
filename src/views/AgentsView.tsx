import React from 'react';
import {
  Bot,
  Cpu,
  Terminal,
  FileText,
  BookOpen,
  TrendingUp,
  Network,
  Share2,
  CheckCircle2,
  Clock,
  Zap,
  AlertTriangle,
  Play,
  RotateCw,
  Plus
} from 'lucide-react';
import { useRacerOps } from '../context/RacerOpsContext';
import { AIAgent } from '../types';

export const AgentsView: React.FC = () => {
  const { agents, setIsAssignTaskModalOpen } = useRacerOps();

  const getAgentIcon = (id: string) => {
    switch (id) {
      case 'agent-openclaw': return <Cpu className="w-5 h-5 text-indigo-400" />;
      case 'agent-antigravity': return <Terminal className="w-5 h-5 text-cyan-400" />;
      case 'agent-claude': return <FileText className="w-5 h-5 text-amber-400" />;
      case 'agent-notebooklm': return <BookOpen className="w-5 h-5 text-blue-400" />;
      case 'agent-grok': return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case 'agent-n8n': return <Network className="w-5 h-5 text-rose-400" />;
      case 'agent-blotato': return <Share2 className="w-5 h-5 text-pink-400" />;
      default: return <Bot className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: AIAgent['status']) => {
    switch (status) {
      case 'online':
        return 'bg-emerald-950 text-emerald-400 border-emerald-800';
      case 'working':
        return 'bg-cyan-950 text-cyan-300 border-cyan-800 animate-pulse';
      case 'idle':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'needs_approval':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'error':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-slate-100 tracking-tight">AI Agent Control Room</h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
              Autonomous Fleet
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Specialized AI digital teammates running autonomous operations, research, coding, and scheduling.
          </p>
        </div>

        <button
          onClick={() => setIsAssignTaskModalOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition-all self-start sm:self-auto"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Assign New Task</span>
        </button>
      </div>

      {/* Fleet Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400">Active Agents</span>
          <p className="text-2xl font-bold font-mono text-slate-100 mt-1">{agents.length} Online</p>
          <span className="text-[10px] text-emerald-400 font-mono">100% fleet availability</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400">Total Tasks Finished</span>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {agents.reduce((acc, a) => acc + a.tasksCompleted, 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400 font-mono">Cumulative across systems</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400">Currently Executing</span>
          <p className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            {agents.filter(a => a.status === 'working').length}
          </p>
          <span className="text-[10px] text-cyan-400/80 font-mono">Active threads</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400">Safety Gated</span>
          <p className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {agents.filter(a => a.status === 'needs_approval').length}
          </p>
          <span className="text-[10px] text-amber-400/80 font-mono">Awaiting human signoff</span>
        </div>
      </div>

      {/* Agents Roster Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((ag) => (
          <div
            key={ag.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex flex-col justify-between shadow-sm space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                    {getAgentIcon(ag.id)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{ag.name}</h3>
                    <p className="text-[11px] text-slate-400 font-medium">{ag.role}</p>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${getStatusBadge(
                    ag.status
                  )}`}
                >
                  {ag.status.replace('_', ' ')}
                </span>
              </div>

              {/* Current / Last Task */}
              <div className="mt-3.5 space-y-2">
                {ag.currentTask ? (
                  <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-xs">
                    <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block mb-0.5">
                      Current Task In Flight:
                    </span>
                    <p className="text-slate-200 font-medium leading-snug">{ag.currentTask}</p>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-0.5">
                      Last Completed Task:
                    </span>
                    <p className="text-slate-300 leading-snug">{ag.lastTask}</p>
                  </div>
                )}
              </div>

              {/* Capabilities */}
              <div className="mt-3">
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                  Core Competencies
                </span>
                <div className="flex flex-wrap gap-1">
                  {ag.capabilities.map((cap, cIdx) => (
                    <span
                      key={cIdx}
                      className="px-2 py-0.5 rounded bg-slate-950 text-[10px] text-slate-300 border border-slate-800/80 font-mono"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats Footer */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>{ag.tasksCompleted} Completed • {ag.tasksFailed} Errs</span>
              <span className="text-slate-300">{ag.lastActivity}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
