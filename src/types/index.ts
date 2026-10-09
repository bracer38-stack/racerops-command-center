export type BusinessId = 'over50fitlife' | 'nutriplanpro' | 'kims-closet' | 'team-rhino';

export interface Business {
  id: BusinessId;
  name: string;
  tagline: string;
  category: string;
  healthScore: number;
  status: 'healthy' | 'attention' | 'warning';
  revenueMonth: number;
  revenuePriorMonth: number;
  revenueChangePct: number;
  activeLeads: number;
  openAlerts: number;
  topOpportunity: string;
}

export type PrioritySeverity = 'critical' | 'high' | 'medium' | 'low';

export interface PriorityItem {
  id: string;
  rank: number;
  title: string;
  whyItMatters: string;
  expectedImpact: string;
  suggestedAction: string;
  businessId: BusinessId | 'all';
  priority: PrioritySeverity;
  estimatedEffort: string;
  completed: boolean;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  businessId: BusinessId | 'system';
  source: string;
  timestamp: string;
  isResolved: boolean;
}

export interface Activity {
  id: string;
  type: 'sale' | 'lead' | 'content' | 'app' | 'automation' | 'agent' | 'project' | 'alert';
  title: string;
  description: string;
  timestamp: string;
  businessId: BusinessId | 'system';
  severity: 'info' | 'success' | 'warning' | 'critical';
}

export interface HealthScoreComponent {
  name: string;
  score: number;
  weight: number;
  maxScore: number;
  status: 'optimal' | 'good' | 'warning' | 'critical';
  details: string;
  deductionReason?: string;
  recommendation: string;
}

export interface HealthBreakdown {
  overallScore: number;
  calculatedAt: string;
  components: HealthScoreComponent[];
}

export type LeadStage = 'new' | 'contacted' | 'qualified' | 'consultation' | 'proposal' | 'customer' | 'lost';

export interface Lead {
  id: string;
  businessId: BusinessId;
  name: string;
  email: string;
  phone?: string;
  stage: LeadStage;
  value: number;
  source: string;
  lastContact: string;
  nextFollowUp: string;
  notes: string;
  assignedAgent?: string;
  isOverdue?: boolean;
}

export interface Customer {
  id: string;
  businessId: BusinessId;
  name: string;
  service: string;
  status: 'active' | 'completed' | 'on_hold';
  startDate: string;
  revenue: number;
  notes: string;
  followUpDate?: string;
}

export interface Over50FitLifeStats {
  website: {
    sessions: number;
    visitors: number;
    topPages: { path: string; views: number; bounceRate: string }[];
    trafficSources: { source: string; sharePct: number }[];
    ctaClicks: number;
    conversionRate: number;
    brokenLinks: number;
    websiteStatus: 'online' | 'degraded' | 'offline';
  };
  contentTopics: {
    topic: 'strength' | 'mobility' | 'nutrition' | 'healthy_aging' | 'motivation';
    label: string;
    itemsCount: number;
    avgEngagementRate: number;
    topPerformer: string;
  }[];
  revenueSplit: {
    personalTraining: number;
    nutritionPlans: number;
    coachingPackages: number;
    digitalProducts: number;
    affiliate: number;
    other: number;
  };
}

export interface NutriPlanProStats {
  users: {
    total: number;
    newMonth: number;
    free: number;
    premium: number;
    active: number;
    inactive: number;
  };
  subscriptions: {
    monthly: number;
    annual: number;
    newMonth: number;
    renewed: number;
    canceled: number;
    conversionRate: number;
    mrr: number;
    arr: number;
  };
  platforms: {
    ios: {
      version: string;
      build: string;
      storeStatus: 'ready_for_sale' | 'in_review' | 'rejected' | 'pending_developer_release';
      releaseStatus: string;
      reviewStatus: string;
      installsMonth: number;
    };
    android: {
      version: string;
      build: string;
      storeStatus: 'published' | 'in_review' | 'draft' | 'rejected';
      releaseStatus: string;
      reviewStatus: string;
      installsMonth: number;
    };
  };
  bugs: {
    id: string;
    title: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    platform: 'ios' | 'android' | 'cross-platform';
    status: 'open' | 'in_progress' | 'testing' | 'resolved';
    dateDiscovered: string;
    assignedAgent: string;
    resolution?: string;
  }[];
  roadmap: {
    id: string;
    feature: string;
    description: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    status: 'idea' | 'researching' | 'planned' | 'in_development' | 'testing' | 'ready' | 'released' | 'rejected' | 'paused';
    platform: 'ios' | 'android' | 'all';
    complexity: 'S' | 'M' | 'L' | 'XL';
    expectedImpact: 'High' | 'Medium' | 'Low';
    notes: string;
  }[];
}

export type AgingBucket = '0-14' | '15-30' | '31-60' | '61-90' | '90+';
export type Marketplace = 'website' | 'poshmark' | 'mercari' | 'depop' | 'vinted' | 'whatnot' | 'vestiaire';

export interface KimClosetItem {
  id: string;
  sku: string;
  brand: string;
  title: string;
  category: string;
  cost: number;
  listingPrice: number;
  salePrice?: number;
  profit?: number;
  status: 'draft' | 'ready' | 'listed' | 'sold' | 'returned' | 'archived' | 'not_allowed';
  marketplace: Marketplace;
  listingDate: string;
  daysListed: number;
  agingBucket: AgingBucket;
  views: number;
  likes: number;
  offers: number;
  lastRefreshed: string;
  smartRecommendation: 'relist' | 'reduce_price' | 'cross_list' | 'improve_photos' | 'rewrite_title' | 'bundle' | 'leave_unchanged';
  notes?: string;
}

export interface TeamRhinoStats {
  products: {
    id: string;
    name: string;
    sku: string;
    unitsSold: number;
    revenue: number;
    profit: number;
    inventoryStock: number;
    unitCost: number;
    unitPrice: number;
  }[];
  monthlyPerformance: {
    month: string;
    unitsSold: number;
    revenue: number;
    profit: number;
  }[];
}

export type ProjectStage = 
  | 'idea'
  | 'research'
  | 'planning'
  | 'prototype'
  | 'testing'
  | 'validation'
  | 'pre_launch'
  | 'launch'
  | 'active'
  | 'paused';

export interface Project {
  id: string;
  name: string;
  description: string;
  stage: ProjectStage;
  priority: 'critical' | 'high' | 'medium' | 'low';
  owner: string;
  createdAt: string;
  lastActivityDate: string;
  daysInactive: number;
  inactivityAlert: boolean;
  nextAction: string;
  tasksCount: { total: number; completed: number };
  notes: string;
  filesCount: number;
  milestones: { name: string; reached: boolean }[];
  risks: string[];
  recommendedAction: 'resume' | 'keep_paused' | 'archive';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  businessId: BusinessId | 'cross-business';
  projectId?: string;
  assignedAgent?: string;
  assignedHuman?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  dueDate: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'waiting' | 'needs_approval' | 'blocked' | 'completed' | 'canceled';
  createdBy: string;
  createdAt: string;
  completedAt?: string;
  dependencies?: string[];
  notes?: string;
}

export interface AIAgent {
  id: string;
  name: string;
  role: string;
  avatarIcon: string;
  status: 'online' | 'idle' | 'working' | 'waiting' | 'needs_approval' | 'error' | 'offline';
  currentTask?: string;
  lastTask?: string;
  tasksCompleted: number;
  tasksFailed: number;
  lastActivity: string;
  capabilities: string[];
  notes: string;
}

export interface Automation {
  id: string;
  name: string;
  platform: 'n8n' | 'openclaw' | 'blotato' | 'cloudflare' | 'hubspot' | 'sheets' | 'whatsapp';
  status: 'online' | 'degraded' | 'error' | 'offline';
  lastRun: string;
  nextRun: string;
  successCount: number;
  failureCount: number;
  lastError?: string;
  businessId: BusinessId | 'system';
  criticality: 'critical' | 'high' | 'medium';
}

export interface AutomationRun {
  id: string;
  workflowId: string;
  workflowName: string;
  time: string;
  status: 'success' | 'failed' | 'warning';
  durationMs: number;
  message: string;
  businessId: BusinessId | 'system';
}

export interface Opportunity {
  id: string;
  title: string;
  businessId: BusinessId | 'cross-business';
  category: 'revenue' | 'marketing' | 'content' | 'sales' | 'product' | 'inventory' | 'operations' | 'automation' | 'cost_savings' | 'retention';
  evidence: string;
  recommendation: string;
  expectedImpact: string;
  confidence: 'high' | 'medium' | 'low';
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedEffort: string;
  status: 'new' | 'reviewing' | 'accepted' | 'rejected' | 'in_progress' | 'completed';
}

export interface Approval {
  id: string;
  title: string;
  category: 'publish_content' | 'send_message' | 'price_change' | 'prod_config' | 'live_automation' | 'data_deletion' | 'financial_txn';
  businessId: BusinessId | 'system';
  initiator: string;
  payloadSummary: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'rejected' | 'deferred';
  timestamp: string;
  contextDetails: string;
}

export interface AppNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  businessId?: BusinessId | 'system';
  linkTarget?: string;
}

export interface Integration {
  id: string;
  name: string;
  category: 'automation' | 'crm' | 'analytics' | 'infrastructure' | 'social' | 'store' | 'ai' | 'messaging';
  status: 'connected' | 'degraded' | 'disconnected' | 'error';
  mode: 'live' | 'mock';
  lastSyncAt: string | null;
  lastError?: string | null;
  supportedDataTypes: string[];
  description: string;
  endpointUrl?: string;
}

export interface ContentItem {
  id: string;
  title: string;
  topic: string;
  businessId: BusinessId;
  platform: 'blog' | 'podcast' | 'instagram' | 'facebook' | 'pinterest' | 'linkedin' | 'newsletter' | 'youtube';
  format: 'blog' | 'podcast' | 'video' | 'social' | 'newsletter' | 'landing_page' | 'ad';
  stage: 'idea' | 'research' | 'draft' | 'review' | 'approved' | 'scheduled' | 'published' | 'repurpose' | 'archived';
  sourceResearch?: string;
  draftSnippet?: string;
  cta: string;
  publicationDate: string;
  performanceNotes?: string;
  impressions?: number;
  engagementRate?: string;
}

export interface FinancialSnapshot {
  revenueThisMonth: number;
  revenuePriorMonth: number;
  revenueChangePct: number;
  expensesThisMonth: number;
  profitEstimate: number;
  profitMarginPct: number;
  recurringBurn: number;
  revenueByBusiness: {
    businessId: BusinessId;
    name: string;
    revenue: number;
    pctOfTotal: number;
  }[];
  monthlyCashFlow: {
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }[];
}

export type DataMode = 'blank' | 'demo' | 'live';

export interface IngestionPreview {
  type: 'leads' | 'inventory' | 'financials' | 'tasks';
  fileName: string;
  rowCount: number;
  headers: string[];
  rows: Record<string, string>[];
}
