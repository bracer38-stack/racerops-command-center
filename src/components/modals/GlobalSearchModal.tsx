import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Building2,
  Users,
  ShoppingBag,
  Cpu,
  Bot,
  FolderGit2,
  CheckSquare,
  ArrowRight
} from 'lucide-react';
import { useRacerOps, ActiveView } from '../../context/RacerOpsContext';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    businesses,
    leads,
    kimItems,
    projects,
    tasks,
    automations,
    agents,
    setActiveView,
    setSelectedBusinessId
  } = useRacerOps();

  const [query, setQuery] = useState('');

  // Handle Cmd+K / Ctrl+K hotkey
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredBusinesses = q ? businesses.filter(b => b.name.toLowerCase().includes(q) || b.tagline.toLowerCase().includes(q)) : [];
  const filteredLeads = q ? leads.filter(l => l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.source.toLowerCase().includes(q)) : [];
  const filteredItems = q ? kimItems.filter(i => i.title.toLowerCase().includes(q) || i.brand.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q)) : [];
  const filteredProjects = q ? projects.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) : [];
  const filteredTasks = q ? tasks.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)) : [];
  const filteredAutomations = q ? automations.filter(a => a.name.toLowerCase().includes(q)) : [];
  const filteredAgents = q ? agents.filter(ag => ag.name.toLowerCase().includes(q) || ag.role.toLowerCase().includes(q)) : [];

  const totalResults =
    filteredBusinesses.length +
    filteredLeads.length +
    filteredItems.length +
    filteredProjects.length +
    filteredTasks.length +
    filteredAutomations.length +
    filteredAgents.length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center space-x-3 bg-slate-950/60">
          <Search className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search businesses, leads, items, tasks, automations, agents..."
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none font-medium"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!query ? (
            <div className="text-center py-8 text-xs text-slate-400">
              <p>Type to search across the entire RacerOps business suite.</p>
              <div className="flex justify-center gap-2 mt-3 font-mono text-[11px]">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">Esc to close</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">Ctrl+K / Cmd+K</span>
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No matching records found for "{query}".
            </div>
          ) : (
            <div className="space-y-4">
              {/* Businesses */}
              {filteredBusinesses.length > 0 && (
                <div>
                  <p className="text-[10px] font-mono uppercase text-slate-400 mb-1">Businesses</p>
                  <div className="space-y-1">
                    {filteredBusinesses.map(b => (
                      <button
                        key={b.id}
                        onClick={() => {
                          setSelectedBusinessId(b.id);
                          setActiveView('businesses');
                          setIsSearchOpen(false);
                        }}
                        className="w-full text-left p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800/80 flex items-center justify-between group text-xs text-slate-200"
                      >
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="font-semibold">{b.name}</span>
                          <span className="text-[11px] text-slate-400">({b.category})</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Leads */}
              {filteredLeads.length > 0 && (
                <div>
                  <p className="text-[10px] font-mono uppercase text-slate-400 mb-1">Leads / CRM</p>
                  <div className="space-y-1">
                    {filteredLeads.map(l => (
                      <button
                        key={l.id}
                        onClick={() => {
                          setActiveView('leads');
                          setIsSearchOpen(false);
                        }}
                        className="w-full text-left p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800/80 flex items-center justify-between group text-xs text-slate-200"
                      >
                        <div className="flex items-center space-x-2">
                          <Users className="w-3.5 h-3.5 text-blue-400" />
                          <span className="font-semibold">{l.name}</span>
                          <span className="text-[11px] text-slate-400">• {l.source} • ${l.value}</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300">
                          {l.stage}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Kim's Closet Items */}
              {filteredItems.length > 0 && (
                <div>
                  <p className="text-[10px] font-mono uppercase text-slate-400 mb-1">Inventory (Kim's Closet)</p>
                  <div className="space-y-1">
                    {filteredItems.map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSelectedBusinessId('kims-closet');
                          setActiveView('businesses');
                          setIsSearchOpen(false);
                        }}
                        className="w-full text-left p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800/80 flex items-center justify-between group text-xs text-slate-200"
                      >
                        <div className="flex items-center space-x-2">
                          <ShoppingBag className="w-3.5 h-3.5 text-pink-400" />
                          <span className="font-semibold">{item.brand} {item.title}</span>
                          <span className="text-[11px] text-slate-400">• ${item.listingPrice}</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {item.marketplace}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {filteredProjects.length > 0 && (
                <div>
                  <p className="text-[10px] font-mono uppercase text-slate-400 mb-1">Projects</p>
                  <div className="space-y-1">
                    {filteredProjects.map(proj => (
                      <button
                        key={proj.id}
                        onClick={() => {
                          setActiveView('projects');
                          setIsSearchOpen(false);
                        }}
                        className="w-full text-left p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800/80 flex items-center justify-between group text-xs text-slate-200"
                      >
                        <div className="flex items-center space-x-2">
                          <FolderGit2 className="w-3.5 h-3.5 text-orange-400" />
                          <span className="font-semibold">{proj.name}</span>
                          <span className="text-[11px] text-slate-400">({proj.stage})</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks */}
              {filteredTasks.length > 0 && (
                <div>
                  <p className="text-[10px] font-mono uppercase text-slate-400 mb-1">Tasks</p>
                  <div className="space-y-1">
                    {filteredTasks.map(tsk => (
                      <button
                        key={tsk.id}
                        onClick={() => {
                          setActiveView('tasks');
                          setIsSearchOpen(false);
                        }}
                        className="w-full text-left p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800/80 flex items-center justify-between group text-xs text-slate-200"
                      >
                        <div className="flex items-center space-x-2">
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="font-semibold">{tsk.title}</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {tsk.status}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
