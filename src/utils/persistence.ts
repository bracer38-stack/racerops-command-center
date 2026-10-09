import {
  Activity,
  AIAgent,
  Alert,
  AppNotification,
  Approval,
  Automation,
  AutomationRun,
  Business,
  ContentItem,
  Customer,
  DataMode,
  FinancialSnapshot,
  HealthBreakdown,
  Integration,
  KimClosetItem,
  Lead,
  NutriPlanProStats,
  Opportunity,
  Over50FitLifeStats,
  PriorityItem,
  Project,
  Task,
  TeamRhinoStats
} from '../types';

export const STORAGE_KEY = 'racerops_persisted_state';

export interface PersistedState {
  dataMode: DataMode;
  businesses: Business[];
  healthBreakdown: HealthBreakdown;
  priorities: PriorityItem[];
  alerts: Alert[];
  activities: Activity[];
  financials: FinancialSnapshot;
  leads: Lead[];
  customers: Customer[];
  over50Stats: Over50FitLifeStats;
  nutriPlanStats: NutriPlanProStats;
  kimItems: KimClosetItem[];
  teamRhinoStats: TeamRhinoStats;
  projects: Project[];
  tasks: Task[];
  agents: AIAgent[];
  automations: Automation[];
  automationRuns: AutomationRun[];
  opportunities: Opportunity[];
  approvals: Approval[];
  notifications: AppNotification[];
  integrations: Integration[];
  contentItems: ContentItem[];
}

const DATA_MODES: DataMode[] = ['blank', 'demo', 'live'];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Picks the sections of `source` whose shape matches `defaults` (array vs. object),
 * so a corrupt or partial blob/backup can't put a non-array where the UI maps over one.
 */
export function pickSections(source: unknown, defaults: PersistedState): Partial<PersistedState> {
  if (!isPlainObject(source)) return {};
  const picked: Record<string, unknown> = {};
  for (const key of Object.keys(defaults) as (keyof PersistedState)[]) {
    const value = source[key];
    if (value === undefined || value === null) continue;
    if (key === 'dataMode') {
      if (DATA_MODES.includes(value as DataMode)) picked[key] = value;
      continue;
    }
    const matches = Array.isArray(defaults[key]) ? Array.isArray(value) : isPlainObject(value);
    if (matches) picked[key] = value;
  }
  return picked as Partial<PersistedState>;
}

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

function defaultStorage(): StorageLike | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export function loadPersistedState(
  defaults: PersistedState,
  storage: StorageLike | null = defaultStorage()
): Partial<PersistedState> {
  try {
    const saved = storage?.getItem(STORAGE_KEY);
    return saved ? pickSections(JSON.parse(saved), defaults) : {};
  } catch {
    return {};
  }
}

export function savePersistedState(
  state: PersistedState,
  storage: StorageLike | null = defaultStorage()
): void {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota exceeded or storage disabled: keep running in-memory.
  }
}
