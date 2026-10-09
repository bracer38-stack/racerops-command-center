import React from 'react';
import {
  LayoutDashboard,
  Building2,
  DollarSign,
  Megaphone,
  Users,
  FileEdit,
  Bot,
  Cpu,
  FolderGit2,
  CheckSquare,
  FileBarChart,
  Boxes,
  Settings,
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useRacerOps, ActiveView } from '../../context/RacerOpsContext';

interface NavItem {
  id: ActiveView;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    approvals,
    alerts,
    tasks,
    projects,
    agents,
    automations,
    businesses,
    setIsAskRacerOpsOpen,
    setIsDailyBriefOpen
  } = useRacerOps();

  const pendingApprovals = approvals.filter(a => a.status === 'pending').length;
  const criticalAlerts = alerts.filter(a => !a.isResolved && a.severity === 'critical').length;
  const openTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'canceled').length;
  const stalledProjects = projects.filter(p => p.inactivityAlert && p.recommendedAction !== 'archive').length;
  const onlineAgents = agents.filter(a => a.status !== 'offline' && a.status !== 'error').length;
  const degradedAutomations = automations.filter(a => a.status === 'degraded' || a.status === 'error').length;

  const navItems: NavItem[] = [
    { id: 'command-center', label: 'Command Center', icon: LayoutDashboard },
    { id: 'businesses', label: 'Businesses', icon: Building2 },
    { id: 'finance', label: 'Finance', icon: DollarSign },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
    { id: 'leads', label: 'Leads / CRM', icon: Users },
    { id: 'content', label: 'Content', icon: FileEdit },
    { id: 'agents', label: 'AI Agents', icon: Bot, badge: `${onlineAgents} Online`, badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-800' },
    { id: 'automations', label: 'Automations', icon: Cpu, badge: degradedAutomations ? `${degradedAutomations} Degraded` : undefined, badgeColor: 'bg-amber-950 text-amber-400 border-amber-800' },
    { id: 'projects', label: 'Projects', icon: FolderGit2, badge: stalledProjects ? `${stalledProjects} Stalled` : undefined, badgeColor: 'bg-orange-950 text-orange-400 border-orange-800' },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: openTasks, badgeColor: 'bg-slate-800 text-slate-300 border-slate-700' },
    { id: 'reports', label: 'Reports', icon: FileBarChart },
    { id: 'integrations', label: 'Integrations', icon: Boxes },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col flex-shrink-0 select-none z-20 h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30">
            <span className="font-extrabold text-white text-lg tracking-wider">R</span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-slate-100 tracking-tight text-base">RacerOps</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-semibold">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Business Command Center</p>
          </div>
        </div>
      </div>

      {/* Quick Action Pills */}
      <div className="px-3 pt-3 pb-2 space-y-1.5">
        <button
          onClick={() => setIsDailyBriefOpen(true)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gradient-to-r from-blue-950/60 to-cyan-950/60 border border-cyan-800/40 text-cyan-300 hover:bg-cyan-900/40 transition-colors text-xs font-semibold group shadow-sm"
        >
          <div className="flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span>Open Daily Brief</span>
          </div>
          <span className="text-[10px] text-cyan-400/70 font-mono">Today</span>
        </button>

        {pendingApprovals > 0 && (
          <button
            onClick={() => setActiveView('command-center')}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-800/50 text-amber-300 hover:bg-amber-900/30 transition-colors text-xs font-medium"
          >
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Pending Approvals</span>
            </div>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold">
              {pendingApprovals}
            </span>
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5 font-mono">
          Core Operations
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'
                  }`}
                />
                <span className={isActive ? 'font-semibold text-slate-100' : ''}>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border ${
                    item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-slate-300">Live Operating</span>
          </div>
          <button
            onClick={() => setIsAskRacerOpsOpen(true)}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-medium"
          >
            <span>Ask AI</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-1 truncate">
          {businesses.length} Businesses • {agents.length} AI Agents • {automations.length} Workflows
        </p>
      </div>
    </aside>
  );
};
