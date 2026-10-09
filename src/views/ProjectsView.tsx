import React from 'react';
import {
  FolderGit2,
  AlertTriangle,
  Play,
  Pause,
  Archive,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Plus,
  Flame,
  Clock
} from 'lucide-react';
import { useRacerOps } from '../context/RacerOpsContext';
import { ProjectStage } from '../types';

export const ProjectsView: React.FC = () => {
  const { projects, updateProjectAction } = useRacerOps();

  const stages: ProjectStage[] = [
    'idea',
    'research',
    'planning',
    'prototype',
    'testing',
    'validation',
    'pre_launch',
    'launch',
    'active',
    'paused'
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-slate-100 tracking-tight">
              Projects & Invention Pipeline
            </h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-800 font-bold">
              R&D Radar Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Managing products, inventions, and experiments from initial concept to commercial launch with automated dormancy detection.
          </p>
        </div>
      </div>

      {/* Inactivity Detection Alert Box */}
      {projects.some(p => p.inactivityAlert) && (
        <div className="p-4 rounded-2xl bg-orange-950/40 border border-orange-800/60 shadow-lg">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-400 animate-pulse" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-orange-300 font-mono">
              Inactivity Alert Triggered: Stalled R&D Detected
            </h2>
          </div>
          <p className="text-xs text-slate-300">
            Project <strong className="text-white">Card Tracker Invention</strong> has had no code commits, milestone logs, or telemetry updates for <span className="text-orange-300 font-mono font-bold">42 consecutive days</span>.
          </p>
          <div className="mt-3 flex items-center space-x-2">
            <button
              onClick={() => updateProjectAction('proj-1', 'resume')}
              className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Resume Project (Kickoff Rev 2 PCB)</span>
            </button>
            <button
              onClick={() => updateProjectAction('proj-1', 'keep_paused')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
            >
              Keep Paused (Snooze 30d)
            </button>
            <button
              onClick={() => updateProjectAction('proj-1', 'archive')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 hover:text-rose-300 border border-slate-800 text-slate-400 text-xs font-medium transition-all"
            >
              Archive Dossier
            </button>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex flex-col justify-between shadow-sm space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {proj.stage.toUpperCase()}
                </span>
                <span
                  className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-semibold ${
                    proj.daysInactive > 30
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}
                >
                  {proj.daysInactive === 0 ? 'Active Today' : `${proj.daysInactive}d Inactive`}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-100 mt-2">{proj.name}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{proj.description}</p>

              {/* Next Action Box */}
              <div className="mt-3.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <span className="text-[10px] uppercase font-mono text-cyan-400 font-bold block mb-1">
                  Next Critical Action:
                </span>
                <p className="text-slate-200 font-medium leading-snug">{proj.nextAction}</p>
              </div>

              {/* Milestones Progress */}
              <div className="mt-3.5 space-y-1.5">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Milestones</span>
                {proj.milestones.map((ms, mIdx) => (
                  <div key={mIdx} className="flex items-center space-x-2 text-xs">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${
                        ms.reached ? 'text-emerald-400' : 'text-slate-600'
                      }`}
                    />
                    <span className={ms.reached ? 'text-slate-300 line-through' : 'text-slate-400'}>
                      {ms.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Owner: {proj.owner}</span>
              <span>
                {proj.tasksCount.completed}/{proj.tasksCount.total} Tasks Completed
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
