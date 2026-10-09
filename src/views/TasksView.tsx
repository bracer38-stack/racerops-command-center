import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  Bot,
  User,
  Plus,
  Check,
  Filter,
  Calendar,
  Layers
} from 'lucide-react';
import { useRacerOps } from '../context/RacerOpsContext';
import { Task } from '../types';

export const TasksView: React.FC = () => {
  const { tasks, updateTaskStatus, setIsAssignTaskModalOpen } = useRacerOps();
  const [filterType, setFilterType] = useState<string>('all');

  const filteredTasks = tasks.filter(t => {
    if (filterType === 'ai') return !!t.assignedAgent;
    if (filterType === 'human') return !!t.assignedHuman;
    if (filterType === 'needs_approval') return t.status === 'needs_approval';
    if (filterType === 'completed') return t.status === 'completed';
    return true;
  });

  const statuses: Task['status'][] = [
    'todo',
    'in_progress',
    'needs_approval',
    'completed'
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-slate-100 tracking-tight">Unified Task Operations</h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold">
              {tasks.length} Total Records
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Single pane of execution coordinating AI agents and human leadership across all business lines.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAssignTaskModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create / Assign Task</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Tasks' },
          { id: 'ai', label: 'AI Assigned' },
          { id: 'human', label: 'Human Assigned' },
          { id: 'needs_approval', label: 'Needs Approval' },
          { id: 'completed', label: 'Completed' }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilterType(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterType === f.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Kanban / Tasks Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statuses.map(st => {
          const colTasks = filteredTasks.filter(t => t.status === st);
          return (
            <div
              key={st}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col h-full shadow-sm"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <span className="text-xs font-bold uppercase font-mono text-slate-300">
                  {st.replace('_', ' ')}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.map(tsk => (
                  <div
                    key={tsk.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-850 hover:border-slate-700 transition-all space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                        {tsk.businessId}
                      </span>
                      <span
                        className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border ${
                          tsk.priority === 'critical'
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : tsk.priority === 'high'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {tsk.priority}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-200 leading-snug">{tsk.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-normal">{tsk.description}</p>

                    <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <div className="flex items-center space-x-1 text-slate-300">
                        {tsk.assignedAgent ? (
                          <>
                            <Bot className="w-3 h-3 text-cyan-400" />
                            <span>{tsk.assignedAgent}</span>
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3 text-emerald-400" />
                            <span>{tsk.assignedHuman}</span>
                          </>
                        )}
                      </div>

                      <select
                        value={tsk.status}
                        onChange={(e) => updateTaskStatus(tsk.id, e.target.value as Task['status'])}
                        className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-cyan-300 font-mono"
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="needs_approval">Needs Approval</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
