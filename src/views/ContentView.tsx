import React, { useState } from 'react';
import {
  FileEdit,
  Calendar,
  Sparkles,
  Share2,
  Video,
  Mic,
  BookOpen,
  Mail,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus
} from 'lucide-react';
import { useRacerOps } from '../context/RacerOpsContext';

export const ContentView: React.FC = () => {
  const { contentItems, setActiveView } = useRacerOps();
  const [stageFilter, setStageFilter] = useState('all');

  const filteredContent = contentItems.filter(c => {
    if (stageFilter === 'all') return true;
    return c.stage === stageFilter;
  });

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'video': return <Video className="w-3.5 h-3.5 text-rose-400" />;
      case 'podcast': return <Mic className="w-3.5 h-3.5 text-purple-400" />;
      case 'blog': return <BookOpen className="w-3.5 h-3.5 text-blue-400" />;
      case 'newsletter': return <Mail className="w-3.5 h-3.5 text-amber-400" />;
      default: return <Share2 className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  const stages = ['idea', 'research', 'draft', 'review', 'approved', 'scheduled', 'published', 'repurpose'];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-slate-100 tracking-tight">Content Command Center</h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
              Multi-Asset Pipeline
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            End-to-end editorial workflow from clinical research to social batch syndication and podcasts.
          </p>
        </div>

        {/* Stage Filter */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1">
          <button
            onClick={() => setStageFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium ${
              stageFilter === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            All Content
          </button>
          {['approved', 'scheduled', 'published', 'draft'].map(st => (
            <button
              key={st}
              onClick={() => setStageFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium capitalize ${
                stageFilter === st
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Pipeline Stage Visual Flow */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-3">
          Lifecycle Pipeline Stages
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {stages.map((st, idx) => {
            const count = contentItems.filter(c => c.stage === st).length;
            return (
              <div
                key={st}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center"
              >
                <span className="text-[10px] uppercase font-mono text-slate-400 block truncate">
                  {st}
                </span>
                <span className="text-sm font-bold font-mono text-slate-100 block mt-0.5">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content Items Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredContent.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 space-y-3 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                  {getFormatIcon(item.format)}
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {item.platform}
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {item.topic}
                </span>
              </div>

              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                {item.stage}
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-100 leading-snug">{item.title}</h3>

            {item.draftSnippet && (
              <p className="text-xs text-slate-400 line-clamp-2 italic bg-slate-950/60 p-2.5 rounded-lg border border-slate-850">
                "{item.draftSnippet}"
              </p>
            )}

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-cyan-400 font-medium text-[11px] truncate max-w-xs">
                CTA: {item.cta}
              </span>
              <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">
                {item.publicationDate}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
