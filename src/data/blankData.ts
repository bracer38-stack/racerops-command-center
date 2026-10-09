import {
  Business,
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
  FinancialSnapshot
} from '../types';

export const BLANK_BUSINESSES: Business[] = [
  {
    id: 'over50fitlife',
    name: 'Over50FitLife',
    tagline: 'Longevity fitness & functional nutrition for adults 50+',
    category: 'Coaching & Media',
    healthScore: 100,
    status: 'healthy',
    revenueMonth: 0,
    revenuePriorMonth: 0,
    revenueChangePct: 0,
    activeLeads: 0,
    openAlerts: 0,
    topOpportunity: 'Awaiting initial traffic or consult lead ingestion'
  },
  {
    id: 'nutriplanpro',
    name: 'NutriPlanPro',
    tagline: 'Precision nutrition & macro-tracking mobile application',
    category: 'SaaS / Mobile App',
    healthScore: 100,
    status: 'healthy',
    revenueMonth: 0,
    revenuePriorMonth: 0,
    revenueChangePct: 0,
    activeLeads: 0,
    openAlerts: 0,
    topOpportunity: 'Connect App Store Connect and Google Play Console adapters'
  },
  {
    id: 'kims-closet',
    name: "Kim's Closet Boutique",
    tagline: 'Curated luxury & vintage consignment resale',
    category: 'E-Commerce / Resale',
    healthScore: 100,
    status: 'healthy',
    revenueMonth: 0,
    revenuePriorMonth: 0,
    revenueChangePct: 0,
    activeLeads: 0,
    openAlerts: 0,
    topOpportunity: 'Upload inventory CSV or add initial consignment listings'
  },
  {
    id: 'team-rhino',
    name: 'Team Rhino',
    tagline: 'High-durability training apparel & equipment brand',
    category: 'Apparel & Goods',
    healthScore: 100,
    status: 'healthy',
    revenueMonth: 0,
    revenuePriorMonth: 0,
    revenueChangePct: 0,
    activeLeads: 0,
    openAlerts: 0,
    topOpportunity: 'Enter initial wholesale or retail product catalog'
  }
];

export const BLANK_HEALTH_BREAKDOWN: HealthBreakdown = {
  overallScore: 100,
  calculatedAt: 'Baseline Initialized',
  components: [
    {
      name: 'Financial Velocity',
      score: 25,
      maxScore: 25,
      weight: 25,
      status: 'optimal',
      details: 'Clean financial ledger ready for live revenue ingestion.',
      recommendation: 'Record your first revenue or sales transaction.'
    },
    {
      name: 'Lead & Sales Flow',
      score: 20,
      maxScore: 20,
      weight: 20,
      status: 'optimal',
      details: '0 overdue leads; response SLAs clear.',
      recommendation: 'Sync inbound leads from n8n or upload CSV.'
    },
    {
      name: 'Automation Reliability',
      score: 15,
      maxScore: 15,
      weight: 15,
      status: 'optimal',
      details: 'All workflow pipelines standing by with 0 error records.',
      recommendation: 'Configure webhook endpoints for live workers.'
    },
    {
      name: 'Inventory & Asset Health',
      score: 15,
      maxScore: 15,
      weight: 15,
      status: 'optimal',
      details: '0 stagnant items aged >60 days.',
      recommendation: 'Add inventory listings or sync marketplace catalogs.'
    },
    {
      name: 'Product & App Stability',
      score: 15,
      maxScore: 15,
      weight: 15,
      status: 'optimal',
      details: '0 critical bug reports in backlog.',
      recommendation: 'Link Sentry and store crashlytics feeds.'
    },
    {
      name: 'Operational Discipline',
      score: 10,
      maxScore: 10,
      weight: 10,
      status: 'optimal',
      details: 'Safety Gate inbox clear; 0 overdue tasks.',
      recommendation: 'Create operational priorities as they arise.'
    }
  ]
};

export const BLANK_FINANCIALS: FinancialSnapshot = {
  revenueThisMonth: 0,
  revenuePriorMonth: 0,
  revenueChangePct: 0,
  expensesThisMonth: 0,
  profitEstimate: 0,
  profitMarginPct: 0,
  recurringBurn: 0,
  revenueByBusiness: [
    { businessId: 'over50fitlife', name: 'Over50FitLife', revenue: 0, pctOfTotal: 0 },
    { businessId: 'nutriplanpro', name: 'NutriPlanPro', revenue: 0, pctOfTotal: 0 },
    { businessId: 'team-rhino', name: 'Team Rhino', revenue: 0, pctOfTotal: 0 },
    { businessId: 'kims-closet', name: "Kim's Closet Boutique", revenue: 0, pctOfTotal: 0 }
  ],
  monthlyCashFlow: []
};

export const BLANK_OVER50_STATS: Over50FitLifeStats = {
  website: {
    sessions: 0,
    visitors: 0,
    topPages: [],
    trafficSources: [],
    ctaClicks: 0,
    conversionRate: 0,
    brokenLinks: 0,
    websiteStatus: 'online'
  },
  contentTopics: [
    { topic: 'strength', label: 'Strength & Hypertrophy', itemsCount: 0, avgEngagementRate: 0, topPerformer: 'None yet' },
    { topic: 'mobility', label: 'Joint Mobility & Spine Health', itemsCount: 0, avgEngagementRate: 0, topPerformer: 'None yet' },
    { topic: 'nutrition', label: 'Protein & Metabolic Health', itemsCount: 0, avgEngagementRate: 0, topPerformer: 'None yet' },
    { topic: 'healthy_aging', label: 'Healthy Aging & Hormones', itemsCount: 0, avgEngagementRate: 0, topPerformer: 'None yet' },
    { topic: 'motivation', label: 'Mindset & Habit Formation', itemsCount: 0, avgEngagementRate: 0, topPerformer: 'None yet' }
  ],
  revenueSplit: {
    personalTraining: 0,
    coachingPackages: 0,
    digitalProducts: 0,
    nutritionPlans: 0,
    affiliate: 0,
    other: 0
  }
};

export const BLANK_NUTRIPLAN_STATS: NutriPlanProStats = {
  users: { total: 0, newMonth: 0, free: 0, premium: 0, active: 0, inactive: 0 },
  subscriptions: { monthly: 0, annual: 0, newMonth: 0, renewed: 0, canceled: 0, conversionRate: 0, mrr: 0, arr: 0 },
  platforms: {
    ios: { version: '1.0.0', build: '1', storeStatus: 'ready_for_sale', releaseStatus: 'Live', reviewStatus: 'Ready', installsMonth: 0 },
    android: { version: '1.0.0', build: '1', storeStatus: 'published', releaseStatus: 'Live', reviewStatus: 'Ready', installsMonth: 0 }
  },
  bugs: [],
  roadmap: []
};

export const BLANK_TEAM_RHINO: TeamRhinoStats = {
  products: [],
  monthlyPerformance: []
};
