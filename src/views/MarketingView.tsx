import React, { useState } from 'react';
import {
  Megaphone,
  TrendingUp,
  Share2,
  Eye,
  MousePointer,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Filter,
  Flame,
  ThumbsDown,
  Sparkles
} from 'lucide-react';
import { useRacerOps } from '../context/RacerOpsContext';

export const MarketingView: React.FC = () => {
  const { approvals, setActiveView } = useRacerOps();

  const [platformFilter, setPlatformFilter] = useState('all');
  const [businessFilter, setBusinessFilter] = useState('all');

  const pendingMarketingApprovals = approvals.filter(
    a => a.status === 'pending' && a.category === 'publish_content'
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-slate-100 tracking-tight">Marketing Command</h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
              Multi-Channel Attribution
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-brand social reach, Blotato publishing health, engagement velocity, and conversion attribution.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 font-medium focus:outline-none"
          >
            <option value="all">All Channels (IG, FB, YT, Pinterest, LI)</option>
            <option value="instagram">Instagram</option>
            <option value="youtube">YouTube</option>
            <option value="pinterest">Pinterest</option>
            <option value="facebook">Facebook</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>Total Reach (30d)</span>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-100">148,200</p>
          <span className="text-[10px] text-emerald-400 font-mono">+18.4% MoM</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
            <MousePointer className="w-4 h-4 text-purple-400" />
            <span>Inbound Clicks</span>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-100">8,940</p>
          <span className="text-[10px] text-purple-400 font-mono">6.03% CTR</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Attributed Leads</span>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-100">64</p>
          <span className="text-[10px] text-emerald-400 font-mono">42 from YouTube/Podcast</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
            <Share2 className="w-4 h-4 text-pink-400" />
            <span>Blotato Queue</span>
          </div>
          <p className="text-2xl font-bold font-mono text-amber-400">4 Stalled</p>
          <span className="text-[10px] text-amber-400/90 font-mono">Pinterest token renewal needed</span>
        </div>
      </div>

      {/* Intelligence Cards: Top vs Worst Performing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top Performing Post */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono uppercase font-bold mb-2">
            <Flame className="w-4 h-4" />
            <span>Top-Performing Post</span>
          </div>
          <h3 className="text-xs font-bold text-slate-200">
            "Safe Overhead Pressing for Shoulders Over 55"
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Platform: <strong className="text-slate-300">YouTube</strong> • 14,200 views • 7.4% engagement • Attributed 6 consult inquiries.
          </p>
        </div>

        {/* Top Performing Topic */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono uppercase font-bold mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Top-Performing Topic</span>
          </div>
          <h3 className="text-xs font-bold text-slate-200">
            Strength & Hypertrophy for Older Adults
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Averages <strong className="text-emerald-400">6.8% engagement</strong> across all networks, outperforming generic mobility and stretching by 62%.
          </p>
        </div>

        {/* Underperforming Alert */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center space-x-2 text-rose-400 text-xs font-mono uppercase font-bold mb-2">
            <ThumbsDown className="w-4 h-4" />
            <span>Lowest Return Format</span>
          </div>
          <h3 className="text-xs font-bold text-slate-200">
            Generic "Monday Mindset" Quotes
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Instagram static image quotes average only 1.2% engagement and generated 0 leads in the past 60 days.
          </p>
        </div>
      </div>

      {/* Content Awaiting Approval & Scheduled Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Awaiting Human Approval */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 font-mono flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Marketing Outbound Requiring Approval</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
              {pendingMarketingApprovals.length} Items
            </span>
          </div>

          <div className="space-y-3">
            {pendingMarketingApprovals.map((appr) => (
              <div
                key={appr.id}
                className="p-3 rounded-xl bg-slate-950 border border-amber-900/40 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{appr.title}</span>
                  <span className="text-[10px] font-mono text-amber-400">Awaiting Signoff</span>
                </div>
                <p className="text-[11px] text-slate-400">{appr.payloadSummary}</p>
                <button
                  onClick={() => setActiveView('command-center')}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
                >
                  <span>Review in Approval Inbox</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Channel Health Matrix */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-3">
            Publishing Channel Automation Status
          </h3>

          <div className="space-y-2">
            {[
              { channel: 'Instagram Carousel & Reels', engine: 'Blotato', status: 'Healthy', state: 'online' },
              { channel: 'YouTube Video & Shorts', engine: 'Native Pipeline', status: 'Healthy', state: 'online' },
              { channel: 'Facebook Group & Page', engine: 'Blotato', status: 'Healthy', state: 'online' },
              { channel: 'Pinterest Auto-Pinning', engine: 'Blotato API', status: 'Token Expired (HTTP 401)', state: 'error' },
              { channel: 'LinkedIn Thought Leadership', engine: 'Native Pipeline', status: 'Drafting', state: 'online' }
            ].map((ch, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-2.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      ch.state === 'online' ? 'bg-emerald-400' : 'bg-rose-400'
                    }`}
                  ></span>
                  <div>
                    <span className="font-semibold text-slate-200">{ch.channel}</span>
                    <span className="text-[11px] text-slate-400 font-mono ml-2">via {ch.engine}</span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    ch.state === 'online'
                      ? 'bg-emerald-950 text-emerald-400'
                      : 'bg-rose-950 text-rose-300 font-bold'
                  }`}
                >
                  {ch.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
