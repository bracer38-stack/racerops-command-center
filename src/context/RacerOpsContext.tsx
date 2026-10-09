import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Business,
  BusinessId,
  PriorityItem,
  Alert,
  Activity,
  HealthBreakdown,
  Lead,
  Customer,
  Over50FitLifeStats,
  NutriPlanProStats,
  KimClosetItem,
  TeamRhinoStats,
  Project,
  Task,
  AIAgent,
  Automation,
  AutomationRun,
  Opportunity,
  Approval,
  AppNotification,
  Integration,
  ContentItem,
  FinancialSnapshot,
  LeadStage,
  DataMode
} from '../types';

import {
  INITIAL_BUSINESSES,
  INITIAL_HEALTH_BREAKDOWN,
  INITIAL_PRIORITIES,
  INITIAL_ALERTS,
  INITIAL_ACTIVITIES,
  INITIAL_FINANCIALS,
  INITIAL_LEADS,
  INITIAL_CUSTOMERS,
  INITIAL_OVER50_STATS,
  INITIAL_NUTRIPLAN_STATS,
  INITIAL_KIM_ITEMS,
  INITIAL_TEAM_RHINO,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_AGENTS,
  INITIAL_AUTOMATIONS,
  INITIAL_AUTOMATION_RUNS,
  INITIAL_OPPORTUNITIES,
  INITIAL_APPROVALS,
  INITIAL_NOTIFICATIONS,
  INITIAL_INTEGRATIONS,
  INITIAL_CONTENT
} from '../data/mockData';

import {
  BLANK_BUSINESSES,
  BLANK_HEALTH_BREAKDOWN,
  BLANK_FINANCIALS,
  BLANK_OVER50_STATS,
  BLANK_NUTRIPLAN_STATS,
  BLANK_TEAM_RHINO
} from '../data/blankData';

import { newId } from '../utils/ids';
import { loadPersistedState, pickSections, savePersistedState, PersistedState } from '../utils/persistence';

const DEMO_STATE: PersistedState = {
  dataMode: 'demo',
  businesses: INITIAL_BUSINESSES,
  healthBreakdown: INITIAL_HEALTH_BREAKDOWN,
  priorities: INITIAL_PRIORITIES,
  alerts: INITIAL_ALERTS,
  activities: INITIAL_ACTIVITIES,
  financials: INITIAL_FINANCIALS,
  leads: INITIAL_LEADS,
  customers: INITIAL_CUSTOMERS,
  over50Stats: INITIAL_OVER50_STATS,
  nutriPlanStats: INITIAL_NUTRIPLAN_STATS,
  kimItems: INITIAL_KIM_ITEMS,
  teamRhinoStats: INITIAL_TEAM_RHINO,
  projects: INITIAL_PROJECTS,
  tasks: INITIAL_TASKS,
  agents: INITIAL_AGENTS,
  automations: INITIAL_AUTOMATIONS,
  automationRuns: INITIAL_AUTOMATION_RUNS,
  opportunities: INITIAL_OPPORTUNITIES,
  approvals: INITIAL_APPROVALS,
  notifications: INITIAL_NOTIFICATIONS,
  integrations: INITIAL_INTEGRATIONS,
  contentItems: INITIAL_CONTENT
};

export type ActiveView = 
  | 'command-center'
  | 'businesses'
  | 'finance'
  | 'marketing'
  | 'leads'
  | 'content'
  | 'agents'
  | 'automations'
  | 'projects'
  | 'tasks'
  | 'reports'
  | 'integrations'
  | 'settings';

interface AskRacerOpsAnswer {
  question: string;
  answer: string;
  sourceReferences: string[];
  suggestedAction?: { label: string; viewTarget: ActiveView; subId?: string };
}

interface RacerOpsContextType {
  // Navigation
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedBusinessId: BusinessId;
  setSelectedBusinessId: (id: BusinessId) => void;
  
  // Data Mode
  dataMode: DataMode;
  resetToBlankSlate: () => void;
  restoreDemoData: () => void;
  exportDatabaseJson: () => void;
  importDatabaseJson: (json: unknown) => boolean;
  
  // Modals & Panels
  isDailyBriefOpen: boolean;
  setIsDailyBriefOpen: (open: boolean) => void;
  isHealthModalOpen: boolean;
  setIsHealthModalOpen: (open: boolean) => void;
  isAskRacerOpsOpen: boolean;
  setIsAskRacerOpsOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isAssignTaskModalOpen: boolean;
  setIsAssignTaskModalOpen: (open: boolean) => void;
  isIngestModalOpen: boolean;
  setIsIngestModalOpen: (open: boolean) => void;
  isAddLeadModalOpen: boolean;
  setIsAddLeadModalOpen: (open: boolean) => void;
  isAddInventoryModalOpen: boolean;
  setIsAddInventoryModalOpen: (open: boolean) => void;
  isAddRevenueModalOpen: boolean;
  setIsAddRevenueModalOpen: (open: boolean) => void;
  isConfigModalOpen: boolean;
  setIsConfigModalOpen: (open: boolean) => void;
  selectedIntegrationId: string | null;
  setSelectedIntegrationId: (id: string | null) => void;
  
  // Data State
  businesses: Business[];
  healthBreakdown: HealthBreakdown;
  priorities: PriorityItem[];
  togglePriority: (id: string) => void;
  alerts: Alert[];
  resolveAlert: (id: string) => void;
  activities: Activity[];
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  financials: FinancialSnapshot;
  leads: Lead[];
  updateLeadStage: (id: string, newStage: LeadStage) => void;
  addNewLead: (lead: Omit<Lead, 'id'>) => void;
  ingestLeadsList: (leads: Lead[], skippedRows?: number[]) => void;
  customers: Customer[];
  over50Stats: Over50FitLifeStats;
  nutriPlanStats: NutriPlanProStats;
  kimItems: KimClosetItem[];
  addNewKimItem: (item: Omit<KimClosetItem, 'id'>) => void;
  ingestInventoryList: (items: KimClosetItem[]) => void;
  updateKimItemRecommendation: (id: string, action: string) => void;
  teamRhinoStats: TeamRhinoStats;
  recordRevenueEntry: (businessId: BusinessId, amount: number, description: string, source: string) => void;
  projects: Project[];
  updateProjectAction: (id: string, action: 'resume' | 'keep_paused' | 'archive') => void;
  tasks: Task[];
  updateTaskStatus: (id: string, status: Task['status']) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  agents: AIAgent[];
  assignTaskToAgent: (agentId: string, taskTitle: string, businessId: string) => void;
  automations: Automation[];
  retryAutomation: (id: string) => void;
  automationRuns: AutomationRun[];
  opportunities: Opportunity[];
  updateOpportunityStatus: (id: string, status: Opportunity['status']) => void;
  approvals: Approval[];
  handleApproval: (id: string, action: 'approved' | 'rejected' | 'deferred') => void;
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  integrations: Integration[];
  syncIntegration: (id: string) => void;
  contentItems: ContentItem[];
  
  // Q&A Engine
  askRacerOpsQuery: string;
  setAskRacerOpsQuery: (q: string) => void;
  askRacerOpsHistory: AskRacerOpsAnswer[];
  submitAskRacerOps: (questionText?: string) => AskRacerOpsAnswer;
  
  // Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const RacerOpsContext = createContext<RacerOpsContextType | undefined>(undefined);

export const RacerOpsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ActiveView>('command-center');
  const [selectedBusinessId, setSelectedBusinessId] = useState<BusinessId>('over50fitlife');
  const [persisted] = useState(() => ({ ...DEMO_STATE, ...loadPersistedState(DEMO_STATE) }));
  const [dataMode, setDataMode] = useState<DataMode>(persisted.dataMode);
  
  // Modals
  const [isDailyBriefOpen, setIsDailyBriefOpen] = useState(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [isAskRacerOpsOpen, setIsAskRacerOpsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [isAddInventoryModalOpen, setIsAddInventoryModalOpen] = useState(false);
  const [isAddRevenueModalOpen, setIsAddRevenueModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string | null>(null);

  // State data (restored from local storage, falling back to demo data)
  const [businesses, setBusinesses] = useState<Business[]>(persisted.businesses);
  const [healthBreakdown, setHealthBreakdown] = useState<HealthBreakdown>(persisted.healthBreakdown);
  const [priorities, setPriorities] = useState<PriorityItem[]>(persisted.priorities);
  const [alerts, setAlerts] = useState<Alert[]>(persisted.alerts);
  const [activities, setActivities] = useState<Activity[]>(persisted.activities);
  const [financials, setFinancials] = useState<FinancialSnapshot>(persisted.financials);
  const [leads, setLeads] = useState<Lead[]>(persisted.leads);
  const [customers, setCustomers] = useState<Customer[]>(persisted.customers);
  const [over50Stats, setOver50Stats] = useState<Over50FitLifeStats>(persisted.over50Stats);
  const [nutriPlanStats, setNutriPlanStats] = useState<NutriPlanProStats>(persisted.nutriPlanStats);
  const [kimItems, setKimItems] = useState<KimClosetItem[]>(persisted.kimItems);
  const [teamRhinoStats, setTeamRhinoStats] = useState<TeamRhinoStats>(persisted.teamRhinoStats);
  const [projects, setProjects] = useState<Project[]>(persisted.projects);
  const [tasks, setTasks] = useState<Task[]>(persisted.tasks);
  const [agents, setAgents] = useState<AIAgent[]>(persisted.agents);
  const [automations, setAutomations] = useState<Automation[]>(persisted.automations);
  const [automationRuns, setAutomationRuns] = useState<AutomationRun[]>(persisted.automationRuns);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(persisted.opportunities);
  const [approvals, setApprovals] = useState<Approval[]>(persisted.approvals);
  const [notifications, setNotifications] = useState<AppNotification[]>(persisted.notifications);
  const [integrations, setIntegrations] = useState<Integration[]>(persisted.integrations);
  const [contentItems, setContentItems] = useState<ContentItem[]>(persisted.contentItems);

  const currentState = (): PersistedState => ({
    dataMode,
    businesses,
    healthBreakdown,
    priorities,
    alerts,
    activities,
    financials,
    leads,
    customers,
    over50Stats,
    nutriPlanStats,
    kimItems,
    teamRhinoStats,
    projects,
    tasks,
    agents,
    automations,
    automationRuns,
    opportunities,
    approvals,
    notifications,
    integrations,
    contentItems
  });

  useEffect(() => {
    savePersistedState(currentState());
  }, [dataMode, businesses, healthBreakdown, priorities, alerts, activities, financials, leads, customers, over50Stats, nutriPlanStats, kimItems, teamRhinoStats, projects, tasks, agents, automations, automationRuns, opportunities, approvals, notifications, integrations, contentItems]);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // ERASE SAMPLE DATA & RESET TO BLANK SLATE
  const resetToBlankSlate = () => {
    setBusinesses(BLANK_BUSINESSES);
    setHealthBreakdown(BLANK_HEALTH_BREAKDOWN);
    setFinancials(BLANK_FINANCIALS);
    setOver50Stats(BLANK_OVER50_STATS);
    setNutriPlanStats(BLANK_NUTRIPLAN_STATS);
    setTeamRhinoStats(BLANK_TEAM_RHINO);
    setLeads([]);
    setKimItems([]);
    setPriorities([]);
    setAlerts([]);
    setApprovals([]);
    setTasks([]);
    setCustomers([]);
    setProjects([]);
    setOpportunities([]);
    setNotifications([]);
    setContentItems([]);
    setAutomationRuns([]);
    setActivities([
      {
        id: newId('act'),
        type: 'alert',
        title: 'Blank Slate Initialized',
        description: 'All sample data cleared. Ready for live business records and CSV imports.',
        timestamp: 'Just now',
        businessId: 'system',
        severity: 'info'
      }
    ]);
    setDataMode('blank');
    showToast('Sample data erased. Blank slate active with all cards ready!');
  };

  // RESTORE DEMO DATA
  const restoreDemoData = () => {
    setBusinesses(INITIAL_BUSINESSES);
    setHealthBreakdown(INITIAL_HEALTH_BREAKDOWN);
    setFinancials(INITIAL_FINANCIALS);
    setOver50Stats(INITIAL_OVER50_STATS);
    setNutriPlanStats(INITIAL_NUTRIPLAN_STATS);
    setKimItems(INITIAL_KIM_ITEMS);
    setTeamRhinoStats(INITIAL_TEAM_RHINO);
    setLeads(INITIAL_LEADS);
    setPriorities(INITIAL_PRIORITIES);
    setAlerts(INITIAL_ALERTS);
    setApprovals(INITIAL_APPROVALS);
    setTasks(INITIAL_TASKS);
    setActivities(INITIAL_ACTIVITIES);
    setCustomers(INITIAL_CUSTOMERS);
    setProjects(INITIAL_PROJECTS);
    setAgents(INITIAL_AGENTS);
    setAutomations(INITIAL_AUTOMATIONS);
    setAutomationRuns(INITIAL_AUTOMATION_RUNS);
    setOpportunities(INITIAL_OPPORTUNITIES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setIntegrations(INITIAL_INTEGRATIONS);
    setContentItems(INITIAL_CONTENT);
    setDataMode('demo');
    showToast('Demo data reloaded for testing.');
  };

  // BACKUP EXPORT & IMPORT
  const exportDatabaseJson = () => {
    const backup = {
      version: '1.1',
      exportedAt: new Date().toISOString(),
      ...currentState()
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `racerops_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Database exported to JSON file.');
  };

  const importDatabaseJson = (json: unknown): boolean => {
    const sections = pickSections(json, DEMO_STATE);
    const restored = Object.keys(sections).filter(k => k !== 'dataMode');
    if (restored.length === 0) {
      showToast('Backup file contains no recognizable RacerOps data.');
      return false;
    }
    if (sections.businesses) setBusinesses(sections.businesses);
    if (sections.healthBreakdown) setHealthBreakdown(sections.healthBreakdown);
    if (sections.priorities) setPriorities(sections.priorities);
    if (sections.alerts) setAlerts(sections.alerts);
    if (sections.activities) setActivities(sections.activities);
    if (sections.financials) setFinancials(sections.financials);
    if (sections.leads) setLeads(sections.leads);
    if (sections.customers) setCustomers(sections.customers);
    if (sections.over50Stats) setOver50Stats(sections.over50Stats);
    if (sections.nutriPlanStats) setNutriPlanStats(sections.nutriPlanStats);
    if (sections.kimItems) setKimItems(sections.kimItems);
    if (sections.teamRhinoStats) setTeamRhinoStats(sections.teamRhinoStats);
    if (sections.projects) setProjects(sections.projects);
    if (sections.tasks) setTasks(sections.tasks);
    if (sections.agents) setAgents(sections.agents);
    if (sections.automations) setAutomations(sections.automations);
    if (sections.automationRuns) setAutomationRuns(sections.automationRuns);
    if (sections.opportunities) setOpportunities(sections.opportunities);
    if (sections.approvals) setApprovals(sections.approvals);
    if (sections.notifications) setNotifications(sections.notifications);
    if (sections.integrations) setIntegrations(sections.integrations);
    if (sections.contentItems) setContentItems(sections.contentItems);
    setDataMode(sections.dataMode ?? 'live');
    showToast(`Database restored from JSON backup (${restored.length} sections).`);
    return true;
  };

  // ADD RECORD HANDLERS
  const addNewLead = (leadData: Omit<Lead, 'id'>) => {
    const newLead: Lead = {
      ...leadData,
      id: newId('lead')
    };
    setLeads(prev => [newLead, ...prev]);
    setBusinesses(prev =>
      prev.map(b => b.id === leadData.businessId ? { ...b, activeLeads: b.activeLeads + 1 } : b)
    );
    addActivity({
      type: 'lead',
      title: `New Lead: ${newLead.name}`,
      description: `Added to ${newLead.businessId} ($${newLead.value.toLocaleString()} est. value)`,
      businessId: newLead.businessId,
      severity: 'info'
    });
    showToast(`Lead added: ${newLead.name}`);
  };

  const ingestLeadsList = (newLeads: Lead[], skippedRows: number[] = []) => {
    const skippedNote = skippedRows.length
      ? ` Skipped ${skippedRows.length} row(s) with an unrecognized Business (rows ${skippedRows.join(', ')}).`
      : '';
    if (newLeads.length === 0) {
      showToast(`No leads imported.${skippedNote}`);
      return;
    }
    setLeads(prev => [...newLeads, ...prev]);
    setBusinesses(prev =>
      prev.map(b => {
        const added = newLeads.filter(l => l.businessId === b.id).length;
        return added ? { ...b, activeLeads: b.activeLeads + added } : b;
      })
    );
    showToast(`Successfully ingested ${newLeads.length} leads from CSV!${skippedNote}`);
    addActivity({
      type: 'lead',
      title: 'Bulk Leads Ingested',
      description: `Imported ${newLeads.length} leads from CSV file`,
      businessId: 'system',
      severity: 'success'
    });
  };

  const addNewKimItem = (itemData: Omit<KimClosetItem, 'id'>) => {
    const newItem: KimClosetItem = {
      ...itemData,
      id: newId('kc')
    };
    setKimItems(prev => [newItem, ...prev]);
    addActivity({
      type: 'sale',
      title: `Inventory Item Listed`,
      description: `${newItem.brand} ${newItem.title} ($${newItem.listingPrice})`,
      businessId: 'kims-closet',
      severity: 'info'
    });
    showToast(`Listed: ${newItem.brand} ${newItem.title}`);
  };

  const ingestInventoryList = (newItems: KimClosetItem[]) => {
    setKimItems(prev => [...newItems, ...prev]);
    showToast(`Successfully imported ${newItems.length} inventory items!`);
    addActivity({
      type: 'sale',
      title: 'Bulk Inventory Ingested',
      description: `Imported ${newItems.length} items from CSV`,
      businessId: 'kims-closet',
      severity: 'success'
    });
  };

  const recordRevenueEntry = (businessId: BusinessId, amount: number, description: string, source: string) => {
    setBusinesses(prev =>
      prev.map(b => b.id === businessId ? { ...b, revenueMonth: b.revenueMonth + amount } : b)
    );
    setFinancials(prev => {
      const newRev = prev.revenueThisMonth + amount;
      const newProfit = prev.profitEstimate + amount;
      const updatedShares = prev.revenueByBusiness.map(b => {
        if (b.businessId === businessId) {
          const rev = b.revenue + amount;
          return { ...b, revenue: rev, pctOfTotal: newRev > 0 ? Math.round((rev / newRev) * 100) : 0 };
        }
        return { ...b, pctOfTotal: newRev > 0 ? Math.round((b.revenue / newRev) * 100) : 0 };
      });
      return {
        ...prev,
        revenueThisMonth: newRev,
        profitEstimate: newProfit,
        profitMarginPct: newRev > 0 ? Math.round((newProfit / newRev) * 100) : 0,
        revenueByBusiness: updatedShares
      };
    });
    addActivity({
      type: 'sale',
      title: `Revenue Recorded: +$${amount.toLocaleString()}`,
      description: `${description} via ${source} for ${businessId}`,
      businessId,
      severity: 'success'
    });
    showToast(`Recorded +$${amount.toLocaleString()} revenue for ${businessId}`);
  };

  const togglePriority = (id: string) => {
    setPriorities(prev =>
      prev.map(item => {
        if (item.id === id) {
          const nextCompleted = !item.completed;
          showToast(nextCompleted ? `Priority marked complete: ${item.title}` : `Priority reopened`);
          return { ...item, completed: nextCompleted };
        }
        return item;
      })
    );
  };

  const resolveAlert = (id: string) => {
    setAlerts(prev =>
      prev.map(item => {
        if (item.id === id) {
          showToast(`Alert resolved: ${item.title}`);
          return { ...item, isResolved: true };
        }
        return item;
      })
    );
  };

  const addActivity = (act: Omit<Activity, 'id' | 'timestamp'>) => {
    const newAct: Activity = {
      ...act,
      id: newId('act'),
      timestamp: 'Just now'
    };
    setActivities(prev => [newAct, ...prev]);
  };

  const updateLeadStage = (id: string, newStage: LeadStage) => {
    setLeads(prev =>
      prev.map(lead => {
        if (lead.id === id) {
          showToast(`Updated ${lead.name} to stage: ${newStage.toUpperCase()}`);
          return { ...lead, stage: newStage, isOverdue: false };
        }
        return lead;
      })
    );
  };

  const updateKimItemRecommendation = (id: string, action: string) => {
    setKimItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          let updatedPrice = item.listingPrice;
          if (action === 'markdown') {
            updatedPrice = Math.round(item.listingPrice * 0.85);
          }
          showToast(`Applied ${action} on ${item.brand} ${item.title}`);
          return {
            ...item,
            listingPrice: updatedPrice,
            smartRecommendation: 'leave_unchanged',
            lastRefreshed: 'Today'
          };
        }
        return item;
      })
    );
  };

  const updateProjectAction = (id: string, action: 'resume' | 'keep_paused' | 'archive') => {
    setProjects(prev =>
      prev.map(proj => {
        if (proj.id === id) {
          showToast(`Project ${proj.name}: Action set to ${action}`);
          return {
            ...proj,
            daysInactive: action === 'resume' ? 0 : proj.daysInactive,
            inactivityAlert: false,
            recommendedAction: action
          };
        }
        return proj;
      })
    );
  };

  const updateTaskStatus = (id: string, status: Task['status']) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          showToast(`Task "${t.title}" moved to ${status}`);
          return { ...t, status };
        }
        return t;
      })
    );
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: newId('task'),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTasks(prev => [newTask, ...prev]);
    showToast(`Task created: ${newTask.title}`);
  };

  const assignTaskToAgent = (agentId: string, taskTitle: string, businessId: string) => {
    setAgents(prev =>
      prev.map(ag => {
        if (ag.id === agentId) {
          return {
            ...ag,
            status: 'working',
            currentTask: taskTitle,
            lastActivity: 'Just now'
          };
        }
        return ag;
      })
    );
    addTask({
      title: taskTitle,
      description: `Dispatched to autonomous agent: ${agentId}`,
      businessId: (businessId as any) || 'cross-business',
      assignedAgent: agentId,
      priority: 'high',
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      status: 'in_progress',
      createdBy: 'Operator Console'
    });
    showToast(`Task routed to AI Agent: ${agentId}`);
  };

  const retryAutomation = (id: string) => {
    setAutomations(prev =>
      prev.map(auto => {
        if (auto.id === id) {
          return {
            ...auto,
            status: 'online',
            lastRun: 'Just now',
            lastError: undefined,
            successCount: auto.successCount + 1
          };
        }
        return auto;
      })
    );
    showToast(`Automation trigger test dispatched for: ${id}`);
  };

  const updateOpportunityStatus = (id: string, status: Opportunity['status']) => {
    setOpportunities(prev =>
      prev.map(opp => opp.id === id ? { ...opp, status } : opp)
    );
  };

  const handleApproval = (id: string, action: 'approved' | 'rejected' | 'deferred') => {
    setApprovals(prev =>
      prev.map(appr => appr.id === id ? { ...appr, status: action } : appr)
    );
    const item = approvals.find(a => a.id === id);
    showToast(`${action.toUpperCase()}: ${item?.title || id}`);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const syncIntegration = (id: string) => {
    setIntegrations(prev =>
      prev.map(integ => integ.id === id ? { ...integ, status: 'connected', lastSyncAt: 'Just now', lastError: null } : integ)
    );
    showToast(`Integration synced successfully: ${id}`);
  };

  // AI Q&A Engine - Grounded in actual state
  const [askRacerOpsQuery, setAskRacerOpsQuery] = useState('');
  const [askRacerOpsHistory, setAskRacerOpsHistory] = useState<AskRacerOpsAnswer[]>([
    {
      question: "What needs my attention today?",
      answer: "System state active. Use the Ingest Data hub to upload your CSV files or connect live webhooks to see your real-time numbers populate.",
      sourceReferences: ["Today's Priorities", "Health Scoring Radar"]
    }
  ]);

  const submitAskRacerOps = (questionText?: string): AskRacerOpsAnswer => {
    const q = (questionText || askRacerOpsQuery).trim().toLowerCase();
    let res: AskRacerOpsAnswer;

    if (q.includes('doing this month') || q.includes('how are my businesses') || q.includes('status')) {
      res = {
        question: questionText || askRacerOpsQuery,
        answer: `Consolidated revenue across your businesses is $${financials.revenueThisMonth.toLocaleString()} with estimated profit of $${financials.profitEstimate.toLocaleString()}.\n\n• Over50FitLife: $${businesses.find(b => b.id === 'over50fitlife')?.revenueMonth.toLocaleString()}\n• NutriPlanPro: $${businesses.find(b => b.id === 'nutriplanpro')?.revenueMonth.toLocaleString()}\n• Team Rhino: $${businesses.find(b => b.id === 'team-rhino')?.revenueMonth.toLocaleString()}\n• Kim's Closet: $${businesses.find(b => b.id === 'kims-closet')?.revenueMonth.toLocaleString()}`,
        sourceReferences: ['Financial Snapshot', 'Business Portfolio Metrics'],
        suggestedAction: { label: 'View Portfolio', viewTarget: 'businesses' }
      };
    } else if (q.includes('attention') || q.includes('urgent') || q.includes('next')) {
      const openPri = priorities.filter(p => !p.completed).length;
      const pendAppr = approvals.filter(a => a.status === 'pending').length;
      res = {
        question: questionText || askRacerOpsQuery,
        answer: `Direct attention check:\n• Open priorities: ${openPri}\n• Pending consequential approvals: ${pendAppr}\n• Active alerts: ${alerts.filter(a => !a.isResolved).length}`,
        sourceReferences: ['Priority Engine', 'Alerts Queue', 'Approval Inbox'],
        suggestedAction: { label: 'Go to Command Center Priorities', viewTarget: 'command-center' }
      };
    } else {
      res = {
        question: questionText || askRacerOpsQuery,
        answer: `RacerOps state analysis:\n• Consolidated revenue: $${financials.revenueThisMonth.toLocaleString()}\n• Leads in pipeline: ${leads.length}\n• Kim's Closet items: ${kimItems.length}\n• Open tasks: ${tasks.filter(t => t.status !== 'completed').length}`,
        sourceReferences: ['RacerOps State Aggregator'],
        suggestedAction: { label: 'View Command Center', viewTarget: 'command-center' }
      };
    }

    setAskRacerOpsHistory(prev => [res, ...prev]);
    setAskRacerOpsQuery('');
    return res;
  };

  return (
    <RacerOpsContext.Provider
      value={{
        activeView,
        setActiveView,
        selectedBusinessId,
        setSelectedBusinessId,
        dataMode,
        resetToBlankSlate,
        restoreDemoData,
        exportDatabaseJson,
        importDatabaseJson,
        isDailyBriefOpen,
        setIsDailyBriefOpen,
        isHealthModalOpen,
        setIsHealthModalOpen,
        isAskRacerOpsOpen,
        setIsAskRacerOpsOpen,
        isSearchOpen,
        setIsSearchOpen,
        isAssignTaskModalOpen,
        setIsAssignTaskModalOpen,
        isIngestModalOpen,
        setIsIngestModalOpen,
        isAddLeadModalOpen,
        setIsAddLeadModalOpen,
        isAddInventoryModalOpen,
        setIsAddInventoryModalOpen,
        isAddRevenueModalOpen,
        setIsAddRevenueModalOpen,
        isConfigModalOpen,
        setIsConfigModalOpen,
        selectedIntegrationId,
        setSelectedIntegrationId,
        businesses,
        healthBreakdown,
        priorities,
        togglePriority,
        alerts,
        resolveAlert,
        activities,
        addActivity,
        financials,
        leads,
        updateLeadStage,
        addNewLead,
        ingestLeadsList,
        customers,
        over50Stats,
        nutriPlanStats,
        kimItems,
        addNewKimItem,
        ingestInventoryList,
        updateKimItemRecommendation,
        teamRhinoStats,
        recordRevenueEntry,
        projects,
        updateProjectAction,
        tasks,
        updateTaskStatus,
        addTask,
        agents,
        assignTaskToAgent,
        automations,
        retryAutomation,
        automationRuns,
        opportunities,
        updateOpportunityStatus,
        approvals,
        handleApproval,
        notifications,
        markNotificationAsRead,
        integrations,
        syncIntegration,
        contentItems,
        askRacerOpsQuery,
        setAskRacerOpsQuery,
        askRacerOpsHistory,
        submitAskRacerOps,
        toastMessage,
        showToast
      }}
    >
      {children}
    </RacerOpsContext.Provider>
  );
};

export const useRacerOps = () => {
  const context = useContext(RacerOpsContext);
  if (!context) {
    throw new Error('useRacerOps must be used within a RacerOpsProvider');
  }
  return context;
};
