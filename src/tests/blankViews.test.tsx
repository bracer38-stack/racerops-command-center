import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { BLANK_BUSINESSES, BLANK_FINANCIALS, BLANK_HEALTH_BREAKDOWN, BLANK_NUTRIPLAN_STATS, BLANK_OVER50_STATS, BLANK_TEAM_RHINO } from '../data/blankData';
import { Sidebar } from '../components/layout/Sidebar';
import { BusinessesView } from '../views/BusinessesView';
import { MarketingView } from '../views/MarketingView';
import { CommandCenterView } from '../views/CommandCenterView';
import { ReportsView } from '../views/ReportsView';
import { DailyBriefModal } from '../components/modals/DailyBriefModal';

vi.mock('../context/RacerOpsContext', () => ({ useRacerOps: () => state }));

const state = {
  dataMode: 'blank',
  activeView: 'businesses',
  selectedBusinessId: 'kims-closet',
  isDailyBriefOpen: true,
  businesses: BLANK_BUSINESSES,
  financials: BLANK_FINANCIALS,
  healthBreakdown: BLANK_HEALTH_BREAKDOWN,
  over50Stats: BLANK_OVER50_STATS,
  nutriPlanStats: BLANK_NUTRIPLAN_STATS,
  teamRhinoStats: BLANK_TEAM_RHINO,
  approvals: [], alerts: [], tasks: [], projects: [], agents: [], automations: [],
  leads: [], customers: [], kimItems: [], priorities: [], activities: [],
  opportunities: [], automationRuns: []
};

describe('blank-slate displays', () => {
  it('does not show a stalled project badge or demo project details', () => {
    const sidebar = renderToStaticMarkup(<Sidebar />);
    expect(sidebar).not.toContain('1 Stalled');
    const dashboard = renderToStaticMarkup(<CommandCenterView />);
    expect(dashboard).toContain('No stalled projects.');
    expect(dashboard).not.toContain('Card Tracker Invention');
  });

  it('shows inventory metrics derived from empty inventory', () => {
    const html = renderToStaticMarkup(<BusinessesView />);
    expect(html).toContain('0 Units');
    expect(html).toContain('0 Items Stagnant');
    expect(html).toContain('No sales data');
    expect(html).not.toContain('148 Units');
  });

  it('does not present sample marketing telemetry as real data', () => {
    const html = renderToStaticMarkup(<MarketingView />);
    expect(html).toContain('No marketing telemetry available.');
    expect(html).not.toContain('148,200');
    expect(html).not.toContain('8,940');
  });

  it('does not leak sample revenue or sales into reports or the daily brief', () => {
    const report = renderToStaticMarkup(<ReportsView />);
    expect(report).not.toContain('14,280');
    expect(report).not.toContain('Marcus Vance');
    const brief = renderToStaticMarkup(<DailyBriefModal />);
    expect(brief).not.toContain('42,980');
    expect(brief).not.toContain('$340 trench');
    expect(brief).toContain('No sales recorded');
  });
});
