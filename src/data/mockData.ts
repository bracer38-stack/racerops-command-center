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

export const INITIAL_BUSINESSES: Business[] = [
  {
    id: 'over50fitlife',
    name: 'Over50FitLife',
    tagline: 'Longevity fitness & functional nutrition for adults 50+',
    category: 'Coaching & Media',
    healthScore: 88,
    status: 'healthy',
    revenueMonth: 14280,
    revenuePriorMonth: 12450,
    revenueChangePct: 14.7,
    activeLeads: 14,
    openAlerts: 1,
    topOpportunity: 'Launch Q4 Strength Masterclass cohort based on high engagement in kettlebell series'
  },
  {
    id: 'nutriplanpro',
    name: 'NutriPlanPro',
    tagline: 'Precision nutrition & macro-tracking mobile application',
    category: 'SaaS / Mobile App',
    healthScore: 88,
    status: 'healthy',
    revenueMonth: 0,
    revenuePriorMonth: 0,
    revenueChangePct: 0,
    activeLeads: 0,
    openAlerts: 1,
    topOpportunity: 'Integrate mobile store paywall to initiate first subscription conversions'
  },
  {
    id: 'kims-closet',
    name: "Kim's Closet Boutique",
    tagline: 'Curated luxury & vintage consignment resale',
    category: 'E-Commerce / Resale',
    healthScore: 82,
    status: 'attention',
    revenueMonth: 8420,
    revenuePriorMonth: 7210,
    revenueChangePct: 16.8,
    activeLeads: 8,
    openAlerts: 1,
    topOpportunity: 'Relist and markdown 18 luxury items aged >45 days to capture weekend buyer surge'
  },
  {
    id: 'team-rhino',
    name: 'Team Rhino',
    tagline: 'High-durability training apparel & equipment brand',
    category: 'Apparel & Goods',
    healthScore: 91,
    status: 'healthy',
    revenueMonth: 9120,
    revenuePriorMonth: 8350,
    revenueChangePct: 9.2,
    activeLeads: 6,
    openAlerts: 0,
    topOpportunity: 'Wholesale bundle reorder for Pacific Rim Gym accounts before holiday cutoffs'
  }
];

export const INITIAL_HEALTH_BREAKDOWN: HealthBreakdown = {
  overallScore: 84,
  calculatedAt: '2026-10-03 21:00 EST',
  components: [
    {
      name: 'Financial Velocity',
      score: 22,
      maxScore: 25,
      weight: 25,
      status: 'good',
      details: 'Portfolio pacing +13.6% MoM ($31,820 consolidated revenue). Healthy cash-flow across active operating businesses.',
      deductionReason: 'NutriPlanPro is currently pre-revenue with mobile subscription paywall pending release.',
      recommendation: 'Complete Google Play & App Store paywall setup to initiate first subscription conversions.'
    },
    {
      name: 'Lead & Sales Flow',
      score: 16,
      maxScore: 20,
      weight: 20,
      status: 'warning',
      details: '70 total active pipeline inquiries across businesses; strong inbound from Over50FitLife podcast.',
      deductionReason: '2 high-value personal training consult inquiries (> $2,400 est.) exceeded 48-hour response SLA.',
      recommendation: 'Trigger immediate automated outreach or assign manual follow-up to coaching coordinator.'
    },
    {
      name: 'Automation Reliability',
      score: 12,
      maxScore: 15,
      weight: 15,
      status: 'warning',
      details: '94.2% workflow uptime across n8n, OpenClaw, and Blotato. 1,420 automated tasks executed smoothly this week.',
      deductionReason: 'Pinterest auto-publishing workflow via Blotato failed 3 consecutive runs due to token expiry.',
      recommendation: 'Re-authenticate Blotato Pinterest OAuth credential in Integrations tab.'
    },
    {
      name: 'Inventory & Asset Health',
      score: 13,
      maxScore: 15,
      weight: 15,
      status: 'good',
      details: 'Kim’s Closet turn rate remains solid at 24.3 days average listing lifespan with $2,840 net realized profit.',
      deductionReason: '12 luxury handbags and coats in Kim’s Closet have reached 60+ days without price concessions.',
      recommendation: 'Execute 15% promotional markdown and cross-list to Vestiaire Collective.'
    },
    {
      name: 'Product & App Stability',
      score: 14,
      maxScore: 15,
      weight: 15,
      status: 'good',
      details: 'NutriPlanPro iOS build 2.4.1 stable (0.12% crash rate). Android build 2.4.2 currently in Google Play review.',
      deductionReason: '1 High-severity background calorie sync bug reported on Samsung Galaxy devices.',
      recommendation: 'Have Antigravity review Sentry logs and dispatch quick-fix hotfix 2.4.3.'
    },
    {
      name: 'Operational Discipline',
      score: 7,
      maxScore: 10,
      weight: 10,
      status: 'warning',
      details: '31 tasks completed this week; 4 active projects moving steadily through development stages.',
      deductionReason: '3 critical consequential items pending human approval in Approval Inbox for > 24 hours.',
      recommendation: 'Clear pending social batch and price markdown approvals to unblock publishing engine.'
    }
  ]
};

export const INITIAL_PRIORITIES: PriorityItem[] = [
  {
    id: 'pri-1',
    rank: 1,
    title: 'Follow up with 2 high-value Over50FitLife consult requests',
    whyItMatters: 'Lead response SLA breached (>48h). High-ticket coaching pipeline value at risk (~$3,600).',
    expectedImpact: '+$3,600 pipeline conversion; preserves lead momentum.',
    suggestedAction: 'Send personalized calendar invite using Coaching Onboarding template.',
    businessId: 'over50fitlife',
    priority: 'critical',
    estimatedEffort: '15m',
    completed: false
  },
  {
    id: 'pri-2',
    rank: 2,
    title: 'Approve 4 queued Blotato social posts & newsletter dispatch',
    whyItMatters: 'Engine is blocked waiting for executive clearance. Content scheduled for Monday peak traffic.',
    expectedImpact: 'Maintains algorithmic consistency and drives weekend lead capture.',
    suggestedAction: 'Review copy in Approval Inbox and click Approve All.',
    businessId: 'over50fitlife',
    priority: 'high',
    estimatedEffort: '10m',
    completed: false
  },
  {
    id: 'pri-3',
    rank: 3,
    title: 'Apply 15% markdown to 3 Kim’s Closet listings older than 60 days',
    whyItMatters: 'Items tying up $420 in capital; algorithm penalizes listings stagnant >60 days.',
    expectedImpact: 'Triggers Poshmark & Mercari buyer push notifications; ~80% sell-through within 5 days.',
    suggestedAction: 'Approve suggested price reduction in Inventory tab.',
    businessId: 'kims-closet',
    priority: 'high',
    estimatedEffort: '10m',
    completed: false
  },
  {
    id: 'pri-4',
    rank: 4,
    title: 'Investigate NutriPlanPro Android background sync crash',
    whyItMatters: 'Recent Samsung Galaxy OS update causes intermittent Health Connect sync timeout.',
    expectedImpact: 'Prevents 1-star Play Store reviews and protects 4.7-star rating.',
    suggestedAction: 'Assign Antigravity subagent to inspect Sentry stack trace and prepare patch.',
    businessId: 'nutriplanpro',
    priority: 'high',
    estimatedEffort: '45m',
    completed: false
  },
  {
    id: 'pri-5',
    rank: 5,
    title: 'Review failed Blotato Pinterest workflow credential',
    whyItMatters: 'Auto-pinning automation halted; missed 18 daily Pinterest impressions pins.',
    expectedImpact: 'Restores automatic visual traffic pipeline to Over50FitLife recipes.',
    suggestedAction: 'Refresh OAuth token in Integrations > Blotato.',
    businessId: 'all',
    priority: 'medium',
    estimatedEffort: '15m',
    completed: false
  }
];

export const INITIAL_ALERTS: Alert[] = [
  {
    id: 'alt-1',
    title: 'Blotato Pinterest Automation Token Expired',
    description: 'OAuth handshake failed at 06:15 EST. Scheduled pins are queued but failing dispatch.',
    severity: 'high',
    businessId: 'system',
    source: 'Blotato Engine',
    timestamp: '2 hours ago',
    isResolved: false
  },
  {
    id: 'alt-2',
    title: '2 Over50FitLife Leads Overdue for First Contact',
    description: 'Marcus Vance & Eleanor Ross submitted consultation requests >48 hours ago without outreach.',
    severity: 'critical',
    businessId: 'over50fitlife',
    source: 'CRM Automation',
    timestamp: '3 hours ago',
    isResolved: false
  },
  {
    id: 'alt-3',
    title: 'Card Tracker Invention Project Inactive for 42 Days',
    description: 'No commits, notes, or milestone updates logged since mid-August. Action required to resume or archive.',
    severity: 'medium',
    businessId: 'system',
    source: 'Project Radar',
    timestamp: '1 day ago',
    isResolved: false
  },
  {
    id: 'alt-4',
    title: 'Google Play Store Review Update: NutriPlanPro v2.4.2',
    description: 'Google Play console flagged missing declaration for Health Connect permissions. Resubmission needed.',
    severity: 'high',
    businessId: 'nutriplanpro',
    source: 'Play Console Adapter',
    timestamp: '5 hours ago',
    isResolved: false
  }
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    type: 'sale',
    title: 'Kim’s Closet Sale: Vintage Burberry Trench',
    description: 'Sold on Poshmark for $340.00 (Gross profit: $185.00). Buyer accepted offer.',
    timestamp: '24 mins ago',
    businessId: 'kims-closet',
    severity: 'success'
  },
  {
    id: 'act-2',
    type: 'lead',
    title: 'New High-Ticket Consult Request',
    description: 'Dr. Gregory Hayes requested 1-on-1 Longevity Coaching assessment via Over50FitLife landing page.',
    timestamp: '1 hour ago',
    businessId: 'over50fitlife',
    severity: 'info'
  },
  {
    id: 'act-3',
    type: 'app',
    title: 'NutriPlanPro v2.4.2 Store Release Update',
    description: 'Google Play policy compliance review underway for Android build 143.',
    timestamp: '2 hours ago',
    businessId: 'nutriplanpro',
    severity: 'info'
  },
  {
    id: 'act-4',
    type: 'automation',
    title: 'Daily Website Health Audit Passed',
    description: 'Cloudflare edge scan verified 100% uptime, 0 broken links across all subdomains.',
    timestamp: '3 hours ago',
    businessId: 'system',
    severity: 'info'
  },
  {
    id: 'act-5',
    type: 'automation',
    title: 'Pinterest Sync Failure',
    description: 'Workflow #402 aborted with HTTP 401 Unauthorized during image catalog sync.',
    timestamp: '3 hours ago',
    businessId: 'system',
    severity: 'warning'
  },
  {
    id: 'act-6',
    type: 'agent',
    title: 'Claude Agent Completed Research Dossier',
    description: 'Synthesized 12 clinical studies on resistance training vs bone density for adults 55+.',
    timestamp: '4 hours ago',
    businessId: 'over50fitlife',
    severity: 'info'
  },
  {
    id: 'act-7',
    type: 'sale',
    title: 'Team Rhino Wholesale Reorder Received',
    description: 'Apex Fitness ordered 40 units of Pro Rhino Wrist Wraps ($960.00 invoice).',
    timestamp: '6 hours ago',
    businessId: 'team-rhino',
    severity: 'success'
  }
];

export const INITIAL_FINANCIALS: FinancialSnapshot = {
  revenueThisMonth: 31820,
  revenuePriorMonth: 28010,
  revenueChangePct: 13.6,
  expensesThisMonth: 12480,
  profitEstimate: 19340,
  profitMarginPct: 60.8,
  recurringBurn: 4150,
  revenueByBusiness: [
    { businessId: 'over50fitlife', name: 'Over50FitLife', revenue: 14280, pctOfTotal: 44.9 },
    { businessId: 'team-rhino', name: 'Team Rhino', revenue: 9120, pctOfTotal: 28.7 },
    { businessId: 'kims-closet', name: "Kim's Closet Boutique", revenue: 8420, pctOfTotal: 26.4 },
    { businessId: 'nutriplanpro', name: 'NutriPlanPro', revenue: 0, pctOfTotal: 0.0 }
  ],
  monthlyCashFlow: [
    { month: 'May 2026', revenue: 20400, expenses: 8200, profit: 12200 },
    { month: 'Jun 2026', revenue: 23500, expenses: 8900, profit: 14600 },
    { month: 'Jul 2026', revenue: 25600, expenses: 9400, profit: 16200 },
    { month: 'Aug 2026', revenue: 28010, expenses: 10100, profit: 17910 },
    { month: 'Sep 2026', revenue: 31820, expenses: 12480, profit: 19340 }
  ]
};

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    businessId: 'over50fitlife',
    name: 'Marcus Vance',
    email: 'm.vance@techhorizon.io',
    phone: '(555) 349-1102',
    stage: 'consultation',
    value: 2400,
    source: 'Podcast Ep #42',
    lastContact: '3 days ago',
    nextFollowUp: 'Yesterday',
    notes: 'Interested in bespoke 12-week joint mobility & hypertrophy program. Overdue for reply!',
    isOverdue: true
  },
  {
    id: 'lead-2',
    businessId: 'over50fitlife',
    name: 'Eleanor Ross',
    email: 'eleanor.ross@westridge.org',
    phone: '(555) 890-4421',
    stage: 'qualified',
    value: 1200,
    source: 'Kettlebell Masterclass Lead Magnet',
    lastContact: '2 days ago',
    nextFollowUp: 'Today',
    notes: 'Age 58, runner transitioning to strength training. Downloaded recovery guide.',
    isOverdue: true
  },
  {
    id: 'lead-3',
    businessId: 'over50fitlife',
    name: 'Dr. Gregory Hayes',
    email: 'ghayes@cardiacspecialists.com',
    stage: 'new',
    value: 3600,
    source: 'Website Organic',
    lastContact: '1 hour ago',
    nextFollowUp: 'Tomorrow',
    notes: 'Cardiologist interested in clinician-supervised strength programming.'
  },
  {
    id: 'lead-4',
    businessId: 'nutriplanpro',
    name: 'Iron Forge Crossfit Gym',
    email: 'coach@ironforgegym.com',
    stage: 'proposal',
    value: 4800,
    source: 'B2B Inbound',
    lastContact: '1 day ago',
    nextFollowUp: 'In 2 days',
    notes: 'Bulk corporate licensing for 85 members.'
  },
  {
    id: 'lead-5',
    businessId: 'team-rhino',
    name: 'Olympus Performance Center',
    email: 'purchasing@olympusfitness.co',
    stage: 'proposal',
    value: 3200,
    source: 'Trade Show Inbound',
    lastContact: '4 days ago',
    nextFollowUp: 'Tomorrow',
    notes: 'Custom branded weightlifting belts and wraps order.'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    businessId: 'over50fitlife',
    name: 'Robert Thornton',
    service: 'VIP 1-on-1 Coaching',
    status: 'active',
    startDate: '2026-06-15',
    revenue: 4800,
    notes: 'Down 14 lbs, knee pain resolved. Highly receptive to renewal.',
    followUpDate: '2026-10-15'
  },
  {
    id: 'cust-2',
    businessId: 'over50fitlife',
    name: 'Patricia Chen',
    service: 'Longevity Nutrition Cohort',
    status: 'active',
    startDate: '2026-08-01',
    revenue: 1200,
    notes: 'Completed 60-day baseline testing. Glucose control improved.',
    followUpDate: '2026-10-20'
  },
  {
    id: 'cust-3',
    businessId: 'nutriplanpro',
    name: 'David K. (Family Tier)',
    service: 'Annual Pro Subscription',
    status: 'active',
    startDate: '2026-01-10',
    revenue: 149,
    notes: 'Power user, provided detailed feedback on barcode scanner.'
  }
];

export const INITIAL_OVER50_STATS: Over50FitLifeStats = {
  website: {
    sessions: 42800,
    visitors: 31200,
    topPages: [
      { path: '/blog/knee-safe-squats-over-50', views: 12400, bounceRate: '41%' },
      { path: '/podcast/episode-48-protein-synthesis', views: 8900, bounceRate: '32%' },
      { path: '/coaching-application', views: 4200, bounceRate: '28%' },
      { path: '/free-longevity-routine', views: 3800, bounceRate: '35%' }
    ],
    trafficSources: [
      { source: 'Organic Google Search', sharePct: 48 },
      { source: 'Podcast Feeds (Apple/Spotify)', sharePct: 26 },
      { source: 'YouTube & Shorts', sharePct: 15 },
      { source: 'Direct & Email Newsletter', sharePct: 11 }
    ],
    ctaClicks: 3240,
    conversionRate: 4.8,
    brokenLinks: 0,
    websiteStatus: 'online'
  },
  contentTopics: [
    {
      topic: 'strength',
      label: 'Strength & Hypertrophy',
      itemsCount: 28,
      avgEngagementRate: 6.8,
      topPerformer: 'Safe Overhead Pressing for Shoulders Over 55'
    },
    {
      topic: 'mobility',
      label: 'Joint Mobility & Spine Health',
      itemsCount: 22,
      avgEngagementRate: 4.2,
      topPerformer: 'Morning 7-Minute Hip Mobility Flow'
    },
    {
      topic: 'nutrition',
      label: 'Protein & Metabolic Health',
      itemsCount: 19,
      avgEngagementRate: 5.9,
      topPerformer: '30g Protein Breakfast Guide for Older Adults'
    },
    {
      topic: 'healthy_aging',
      label: 'Healthy Aging & Hormones',
      itemsCount: 15,
      avgEngagementRate: 5.1,
      topPerformer: 'Zone 2 Cardio vs HIIT for Heart Elasticity'
    },
    {
      topic: 'motivation',
      label: 'Mindset & Habit Formation',
      itemsCount: 11,
      avgEngagementRate: 3.4,
      topPerformer: 'How to Train When You Wake Up Stiff'
    }
  ],
  revenueSplit: {
    personalTraining: 6800,
    coachingPackages: 3900,
    digitalProducts: 1850,
    nutritionPlans: 1100,
    affiliate: 480,
    other: 150
  }
};

export const INITIAL_NUTRIPLAN_STATS: NutriPlanProStats = {
  users: {
    total: 2450,
    newMonth: 380,
    free: 2450,
    premium: 0,
    active: 1680,
    inactive: 770
  },
  subscriptions: {
    monthly: 0,
    annual: 0,
    newMonth: 0,
    renewed: 0,
    canceled: 0,
    conversionRate: 0,
    mrr: 0,
    arr: 0
  },
  platforms: {
    ios: {
      version: '2.4.1',
      build: '142',
      storeStatus: 'ready_for_sale',
      releaseStatus: 'Live in Production',
      reviewStatus: 'Approved (Rating 4.8 ★ / 412 reviews)',
      installsMonth: 1120
    },
    android: {
      version: '2.4.2',
      build: '143',
      storeStatus: 'in_review',
      releaseStatus: 'Pending Store Review',
      reviewStatus: 'Under Google Play Policy Review (Rating 4.6 ★ / 289 reviews)',
      installsMonth: 720
    }
  },
  bugs: [
    {
      id: 'bug-101',
      title: 'Health Connect Background Sync Timeout on Samsung OneUI 6',
      severity: 'high',
      platform: 'android',
      status: 'in_progress',
      dateDiscovered: '2026-10-01',
      assignedAgent: 'Antigravity (Systems)',
      resolution: 'Refactoring background worker with exponential retry handler.'
    },
    {
      id: 'bug-102',
      title: 'Dark mode contrast issue on Macro Ring Summary card',
      severity: 'low',
      platform: 'ios',
      status: 'open',
      dateDiscovered: '2026-10-02',
      assignedAgent: 'Antigravity (Systems)'
    },
    {
      id: 'bug-103',
      title: 'Barcode scan camera freeze on iOS 18 beta devices',
      severity: 'medium',
      platform: 'ios',
      status: 'testing',
      dateDiscovered: '2026-09-28',
      assignedAgent: 'Antigravity (Systems)',
      resolution: 'Updated VisionKit camera capture session delegate.'
    }
  ],
  roadmap: [
    {
      id: 'road-1',
      feature: 'AI Meal Photo Recognition (Instant Macro Logging)',
      description: 'Zero-typing macro estimation using on-device vision + Gemini multimodal endpoint.',
      priority: 'critical',
      status: 'in_development',
      platform: 'all',
      complexity: 'L',
      expectedImpact: 'High',
      notes: 'Key driver to elevate free-to-premium trial conversion.'
    },
    {
      id: 'road-2',
      feature: 'Apple Watch & Wear OS Complications',
      description: 'Glanceable remaining calorie and hydration rings on smartwatch dials.',
      priority: 'high',
      status: 'planned',
      platform: 'all',
      complexity: 'M',
      expectedImpact: 'High',
      notes: 'Most requested feature in Q3 user survey.'
    },
    {
      id: 'road-3',
      feature: 'Over50FitLife Cross-Brand Sync Integration',
      description: 'One-click import of Over50FitLife customized meal templates into NutriPlanPro.',
      priority: 'medium',
      status: 'researching',
      platform: 'all',
      complexity: 'M',
      expectedImpact: 'Medium',
      notes: 'Synergistic ecosystem play.'
    }
  ]
};

export const INITIAL_KIM_ITEMS: KimClosetItem[] = [
  {
    id: 'item-1',
    sku: 'KC-7892',
    brand: 'Gucci',
    title: 'Vintage GG Canvas Monogram Crossbody Bag',
    category: 'Handbags & Purses',
    cost: 180,
    listingPrice: 495,
    status: 'listed',
    marketplace: 'poshmark',
    listingDate: '2026-07-28',
    daysListed: 67,
    agingBucket: '61-90',
    views: 480,
    likes: 34,
    offers: 2,
    lastRefreshed: '2026-09-15',
    smartRecommendation: 'reduce_price',
    notes: 'High likes, but buyers hesitant at $495. A 10% markdown should trigger immediate sale.'
  },
  {
    id: 'item-2',
    sku: 'KC-8104',
    brand: 'Burberry',
    title: 'Classic Nova Check Double-Breasted Trench Coat (Size 8)',
    category: 'Outerwear',
    cost: 150,
    listingPrice: 380,
    salePrice: 340,
    profit: 190,
    status: 'sold',
    marketplace: 'poshmark',
    listingDate: '2026-09-12',
    daysListed: 21,
    agingBucket: '15-30',
    views: 310,
    likes: 28,
    offers: 3,
    lastRefreshed: '2026-09-28',
    smartRecommendation: 'leave_unchanged'
  },
  {
    id: 'item-3',
    sku: 'KC-8290',
    brand: 'Tory Burch',
    title: 'Miller Lug Sole Leather Ankle Booties (Size 7.5)',
    category: 'Shoes & Boots',
    cost: 65,
    listingPrice: 195,
    status: 'listed',
    marketplace: 'mercari',
    listingDate: '2026-09-24',
    daysListed: 9,
    agingBucket: '0-14',
    views: 145,
    likes: 18,
    offers: 1,
    lastRefreshed: '2026-10-01',
    smartRecommendation: 'leave_unchanged',
    notes: 'Fresh listing gaining high initial velocity.'
  },
  {
    id: 'item-4',
    sku: 'KC-7450',
    brand: 'Prada',
    title: 'Nylon Vela Backpack with Saffiano Leather Trim',
    category: 'Bags & Accessories',
    cost: 210,
    listingPrice: 550,
    status: 'listed',
    marketplace: 'depop',
    listingDate: '2026-06-25',
    daysListed: 100,
    agingBucket: '90+',
    views: 820,
    likes: 62,
    offers: 5,
    lastRefreshed: '2026-08-10',
    smartRecommendation: 'relist',
    notes: 'Algorithm penalty for age >90 days. Relist fresh with new cover photo.'
  },
  {
    id: 'item-5',
    sku: 'KC-8311',
    brand: 'Lululemon',
    title: 'Define Jacket Luon Ribbed (Size 6, Black)',
    category: 'Activewear',
    cost: 25,
    listingPrice: 78,
    status: 'listed',
    marketplace: 'whatnot',
    listingDate: '2026-09-18',
    daysListed: 15,
    agingBucket: '15-30',
    views: 95,
    likes: 12,
    offers: 0,
    lastRefreshed: '2026-09-30',
    smartRecommendation: 'cross_list',
    notes: 'Cross-list to Poshmark to accelerate sale.'
  },
  {
    id: 'item-6',
    sku: 'KC-8012',
    brand: 'Louis Vuitton',
    title: 'Monogram Neverfull MM with Pouch (Condition A-)',
    category: 'Handbags & Purses',
    cost: 650,
    listingPrice: 1350,
    status: 'ready',
    marketplace: 'website',
    listingDate: '2026-10-02',
    daysListed: 1,
    agingBucket: '0-14',
    views: 45,
    likes: 8,
    offers: 0,
    lastRefreshed: '2026-10-02',
    smartRecommendation: 'leave_unchanged',
    notes: 'Premium showroom piece. Listed on proprietary e-commerce.'
  }
];

export const INITIAL_TEAM_RHINO: TeamRhinoStats = {
  products: [
    {
      id: 'rhino-1',
      name: 'Rhino Pro Leather Weightlifting Belt (10mm)',
      sku: 'TR-BELT-10',
      unitsSold: 142,
      revenue: 4260,
      profit: 2272,
      inventoryStock: 85,
      unitCost: 14,
      unitPrice: 30
    },
    {
      id: 'rhino-2',
      name: 'Heavy Duty Heavy Elastic Wrist Wraps (24")',
      sku: 'TR-WRAP-24',
      unitsSold: 210,
      revenue: 3150,
      profit: 1680,
      inventoryStock: 140,
      unitCost: 7,
      unitPrice: 15
    },
    {
      id: 'rhino-3',
      name: 'Tri-Blend Rhino Distressed Athletic Tee',
      sku: 'TR-TEE-01',
      unitsSold: 88,
      revenue: 1710,
      profit: 968,
      inventoryStock: 52,
      unitCost: 8.5,
      unitPrice: 19.5
    }
  ],
  monthlyPerformance: [
    { month: 'Jun 2026', unitsSold: 310, revenue: 6800, profit: 3200 },
    { month: 'Jul 2026', unitsSold: 345, revenue: 7600, profit: 3650 },
    { month: 'Aug 2026', unitsSold: 390, revenue: 8350, profit: 4020 },
    { month: 'Sep 2026', unitsSold: 440, revenue: 9120, profit: 4920 }
  ]
};

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Card Tracker Invention',
    description: 'RFID & optical computer vision shelf scanner for automated collectible trading card grading and inventorying.',
    stage: 'prototype',
    priority: 'high',
    owner: 'Brace',
    createdAt: '2026-03-15',
    lastActivityDate: '2026-08-22',
    daysInactive: 42,
    inactivityAlert: true,
    nextAction: 'Decision needed: Order Revision 2 PCB board or archive intellectual property dossier.',
    tasksCount: { total: 18, completed: 11 },
    notes: 'Bench prototype validated ESP32 RFID reading. Stalled during camera lens calibration.',
    filesCount: 14,
    milestones: [
      { name: 'Concept & Patent Prior Art Search', reached: true },
      { name: 'Breadboard Circuit Validation', reached: true },
      { name: '3D Printed Chassis Mk1', reached: true },
      { name: 'Beta Optical Firmware Sync', reached: false }
    ],
    risks: [
      'Component obsolescence for optical lens sensor',
      'Manufacturing cost per unit exceeds target $85 BOM'
    ],
    recommendedAction: 'resume'
  },
  {
    id: 'proj-2',
    name: 'Longevity Biomarker AI Companion',
    description: 'Personalized blood panel interpretation engine tailored specifically for masters athletes 50+.',
    stage: 'planning',
    priority: 'medium',
    owner: 'Brace',
    createdAt: '2026-07-10',
    lastActivityDate: '2026-10-01',
    daysInactive: 2,
    inactivityAlert: false,
    nextAction: 'Review HIPPA/CLIA compliance architecture with Claude research analyst.',
    tasksCount: { total: 12, completed: 5 },
    notes: 'Positioned as an upsell module for Over50FitLife VIP coaching tier.',
    filesCount: 8,
    milestones: [
      { name: 'Clinical Biomarker Schema Design', reached: true },
      { name: 'Prompt Template Evaluation', reached: true },
      { name: 'Frontend Prototype Shell', reached: false }
    ],
    risks: ['Medical advice regulatory boundaries'],
    recommendedAction: 'resume'
  },
  {
    id: 'proj-3',
    name: 'Automated Resale Multi-Lister Extension',
    description: 'Browser sidecar to synchronize Kim’s Closet listings automatically across Poshmark, Mercari, and Depop.',
    stage: 'testing',
    priority: 'high',
    owner: 'Antigravity',
    createdAt: '2026-08-01',
    lastActivityDate: '2026-10-02',
    daysInactive: 1,
    inactivityAlert: false,
    nextAction: 'Test DOM selector fallbacks for Poshmark 2026 fall update.',
    tasksCount: { total: 15, completed: 12 },
    notes: 'Already saves estimated 4.5 hours per week of manual data duplication.',
    filesCount: 6,
    milestones: [
      { name: 'Poshmark DOM Mapper', reached: true },
      { name: 'Mercari API Bridge', reached: true },
      { name: 'Depop Webhook Listener', reached: true },
      { name: 'End-to-End Stress Test', reached: false }
    ],
    risks: ['Marketplace bot detection heuristics'],
    recommendedAction: 'resume'
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'tsk-1',
    title: 'Conduct phone consultation with Marcus Vance',
    description: 'Discuss 12-week longevity strength program and send Stripe enrollment link.',
    businessId: 'over50fitlife',
    assignedHuman: 'Brace',
    priority: 'critical',
    dueDate: '2026-10-04',
    status: 'todo',
    createdBy: 'System Alert',
    createdAt: '2026-10-02'
  },
  {
    id: 'tsk-2',
    title: 'Deploy hotfix for NutriPlanPro Samsung Health sync crash',
    description: 'Implement backoff retry logic in Android Health Connect background service.',
    businessId: 'nutriplanpro',
    assignedAgent: 'Antigravity',
    priority: 'high',
    dueDate: '2026-10-05',
    status: 'in_progress',
    createdBy: 'Play Console Monitor',
    createdAt: '2026-10-02'
  },
  {
    id: 'tsk-3',
    title: 'Repackage and relist Prada Nylon Backpack on Depop',
    description: 'Take 4 updated natural daylight photos and apply refreshed description with trending tags.',
    businessId: 'kims-closet',
    assignedHuman: 'Kim / Operations',
    priority: 'high',
    dueDate: '2026-10-06',
    status: 'todo',
    createdBy: 'Inventory Aging Radar',
    createdAt: '2026-10-03'
  },
  {
    id: 'tsk-4',
    title: 'Draft Over50FitLife Newsletter: "Why Grip Strength Predicts Longevity"',
    description: 'Synthesize research citations from Claude dossier into 600-word punchy Sunday newsletter.',
    businessId: 'over50fitlife',
    assignedAgent: 'NotebookLM',
    priority: 'medium',
    dueDate: '2026-10-06',
    status: 'needs_approval',
    createdBy: 'Content Pipeline',
    createdAt: '2026-10-01'
  },
  {
    id: 'tsk-5',
    title: 'Audit Team Rhino wholesale accounts receivables',
    description: 'Verify receipt of $960 wire from Apex Fitness and prepare October fulfillment manifests.',
    businessId: 'team-rhino',
    assignedHuman: 'Brace',
    priority: 'medium',
    dueDate: '2026-10-08',
    status: 'todo',
    createdBy: 'Finance Engine',
    createdAt: '2026-10-03'
  }
];

export const INITIAL_AGENTS: AIAgent[] = [
  {
    id: 'agent-openclaw',
    name: 'OpenClaw',
    role: 'Operations Manager & Fleet Orchestrator',
    avatarIcon: 'Cpu',
    status: 'online',
    currentTask: 'Supervising n8n webhooks and monitoring cross-business SLAs',
    lastTask: 'Daily system health roll-up compiled',
    tasksCompleted: 412,
    tasksFailed: 2,
    lastActivity: '4 mins ago',
    capabilities: ['Workflow orchestration', 'SLA monitoring', 'Cron scheduling', 'Alert triage'],
    notes: 'Primary agent responsible for operational cadence and supervisor loop.'
  },
  {
    id: 'agent-antigravity',
    name: 'Antigravity',
    role: 'Developer & Systems Engineer',
    avatarIcon: 'Terminal',
    status: 'working',
    currentTask: 'Debugging Samsung Health Connect background sync timeout in NutriPlanPro',
    lastTask: 'Built multi-lister DOM fallback for Poshmark',
    tasksCompleted: 684,
    tasksFailed: 5,
    lastActivity: 'Active right now',
    capabilities: ['Full-stack coding', 'Bug diagnosis', 'API integrations', 'Architecture design', 'Git workflows'],
    notes: 'Handles codebase creation, app stability, and technical infrastructure.'
  },
  {
    id: 'agent-claude',
    name: 'Claude',
    role: 'Research Analyst & Deep Synthesizer',
    avatarIcon: 'FileText',
    status: 'idle',
    currentTask: undefined,
    lastTask: 'Synthesized 12 clinical studies on bone density vs resistance exercise for adults 55+',
    tasksCompleted: 295,
    tasksFailed: 1,
    lastActivity: '42 mins ago',
    capabilities: ['Scientific literature synthesis', 'Long-form drafting', 'Market research', 'Competitor benchmarking'],
    notes: 'Specialist in deep analytical rigor and science-backed copywriting.'
  },
  {
    id: 'agent-notebooklm',
    name: 'NotebookLM',
    role: 'Knowledge & Content Grounding',
    avatarIcon: 'BookOpen',
    status: 'idle',
    currentTask: undefined,
    lastTask: 'Indexed Over50FitLife episode transcripts #40-#50 into searchable knowledge vector',
    tasksCompleted: 188,
    tasksFailed: 0,
    lastActivity: '2 hours ago',
    capabilities: ['Audio transcript parsing', 'Fact-checking', 'Source grounding', 'Podcast show notes'],
    notes: 'Ensures all digital media content adheres strictly to verified source materials.'
  },
  {
    id: 'agent-grok',
    name: 'Grok',
    role: 'Trend & Social Intelligence',
    avatarIcon: 'TrendingUp',
    status: 'online',
    currentTask: 'Scanning fitness discourse for emerging longevity hashtags (#Zone2Cardio, #GripStrength)',
    lastTask: 'Flagged viral discussion on creatine supplementation for brain health in older adults',
    tasksCompleted: 154,
    tasksFailed: 3,
    lastActivity: '12 mins ago',
    capabilities: ['Real-time trend analysis', 'Virality forecasting', 'Audience sentiment tracking'],
    notes: 'Identifies cultural hooks and viral themes before they saturate.'
  },
  {
    id: 'agent-n8n',
    name: 'n8n Engine',
    role: 'Workflow Automation Backbone',
    avatarIcon: 'Network',
    status: 'online',
    currentTask: 'Executing scheduled 15-minute lead sync from Typeform to CRM',
    lastTask: 'Processed Kim’s Closet daily sales ledger sync',
    tasksCompleted: 1890,
    tasksFailed: 12,
    lastActivity: '1 min ago',
    capabilities: ['Multi-step webhook routing', 'Data transformation', 'CRON execution', 'Database updates'],
    notes: 'Core execution engine for headless data pipelines.'
  },
  {
    id: 'agent-blotato',
    name: 'Blotato',
    role: 'Social Publishing Engine',
    avatarIcon: 'Share2',
    status: 'needs_approval',
    currentTask: 'Awaiting human authorization to publish 4 queued social carousel posts',
    lastTask: 'Pinterest token refreshed and verified',
    tasksCompleted: 340,
    tasksFailed: 8,
    lastActivity: '28 mins ago',
    capabilities: ['Social batch scheduling', 'Asset resizing', 'Multi-platform dispatch', 'Engagement polling'],
    notes: 'Strictly gated behind human approval inbox for outbound publications.'
  }
];

export const INITIAL_AUTOMATIONS: Automation[] = [
  {
    id: 'auto-1',
    name: 'Over50FitLife Inbound Lead Sync',
    platform: 'n8n',
    status: 'online',
    lastRun: '12 mins ago',
    nextRun: 'In 3 mins',
    successCount: 4210,
    failureCount: 2,
    businessId: 'over50fitlife',
    criticality: 'critical'
  },
  {
    id: 'auto-2',
    name: 'Blotato Social Batch Dispatcher',
    platform: 'blotato',
    status: 'degraded',
    lastRun: '1 hour ago',
    nextRun: 'Paused (Awaiting Token)',
    successCount: 890,
    failureCount: 4,
    lastError: 'HTTP 401: Pinterest OAuth token expired at 06:15 EST',
    businessId: 'over50fitlife',
    criticality: 'high'
  },
  {
    id: 'auto-3',
    name: 'Kim’s Closet Multi-Marketplace Sales Poller',
    platform: 'n8n',
    status: 'online',
    lastRun: '5 mins ago',
    nextRun: 'In 10 mins',
    successCount: 1420,
    failureCount: 1,
    businessId: 'kims-closet',
    criticality: 'high'
  },
  {
    id: 'auto-4',
    name: 'NutriPlanPro Store Health & Review Tracker',
    platform: 'openclaw',
    status: 'online',
    lastRun: '30 mins ago',
    nextRun: 'In 30 mins',
    successCount: 620,
    failureCount: 0,
    businessId: 'nutriplanpro',
    criticality: 'medium'
  },
  {
    id: 'auto-5',
    name: 'Cloudflare Edge Health & SSL Validator',
    platform: 'cloudflare',
    status: 'online',
    lastRun: '10 mins ago',
    nextRun: 'In 50 mins',
    successCount: 8740,
    failureCount: 0,
    businessId: 'system',
    criticality: 'critical'
  }
];

export const INITIAL_AUTOMATION_RUNS: AutomationRun[] = [
  {
    id: 'run-1',
    workflowId: 'auto-1',
    workflowName: 'Inbound Lead Sync',
    time: '21:00:15',
    status: 'success',
    durationMs: 340,
    message: 'Synced 1 new lead from landing page to CRM state.',
    businessId: 'over50fitlife'
  },
  {
    id: 'run-2',
    workflowId: 'auto-3',
    workflowName: 'Multi-Marketplace Sales Poller',
    time: '20:55:00',
    status: 'success',
    durationMs: 1220,
    message: 'Checked Poshmark, Mercari, Depop. Recorded $340 Burberry trench sale.',
    businessId: 'kims-closet'
  },
  {
    id: 'run-3',
    workflowId: 'auto-2',
    workflowName: 'Blotato Social Batch Dispatcher',
    time: '20:00:12',
    status: 'failed',
    durationMs: 820,
    message: 'Failed dispatching Pinterest pin. OAuth 401 Unauthorized.',
    businessId: 'over50fitlife'
  },
  {
    id: 'run-4',
    workflowId: 'auto-5',
    workflowName: 'Cloudflare Edge Health',
    time: '19:50:00',
    status: 'success',
    durationMs: 140,
    message: 'All 6 DNS hostnames healthy. 0 5xx responses in 60m.',
    businessId: 'system'
  }
];

export const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-1',
    title: 'Strength Content Engagement Outperforming Mobility by 62%',
    businessId: 'over50fitlife',
    category: 'content',
    evidence: 'Over50FitLife YouTube & blog analytics show strength/hypertrophy posts receive 6.8% avg engagement vs 4.2% for mobility.',
    recommendation: 'Reallocate 2 upcoming podcast slots to deep-dive progressive overload for adults 55+, and feature Kettlebell Program CTA.',
    expectedImpact: 'Estimated +20-30% qualified coaching inquiries over next 30 days.',
    confidence: 'high',
    priority: 'high',
    estimatedEffort: '2h',
    status: 'new'
  },
  {
    id: 'opp-2',
    title: 'NutriPlanPro Mobile Paywall & In-App Subscription Setup',
    businessId: 'nutriplanpro',
    category: 'product',
    evidence: 'App currently free with 2,450 beta installs; zero paid subscription tiers configured in store builds.',
    recommendation: 'Implement StoreKit 2 & Google Play Billing subscription paywall ($9.99/mo) to begin monetization.',
    expectedImpact: 'Establishes initial recurring SaaS revenue stream from active user base.',
    confidence: 'high',
    priority: 'high',
    estimatedEffort: '1 week',
    status: 'in_progress'
  },
  {
    id: 'opp-3',
    title: 'Stagnant High-Ticket Resale Items in Kim’s Closet (3 items > 60d)',
    businessId: 'kims-closet',
    category: 'inventory',
    evidence: 'Gucci bag and Prada backpack have 480+ views and 60+ likes but zero purchases due to pricing elasticity.',
    recommendation: 'Apply temporary 12% weekend markdown and push notifications to likers.',
    expectedImpact: 'Recover $800+ in liquid working capital within 72 hours.',
    confidence: 'medium',
    priority: 'high',
    estimatedEffort: '15m',
    status: 'new'
  },
  {
    id: 'opp-4',
    title: 'Team Rhino Wholesale Cross-Sell with Over50FitLife Clients',
    businessId: 'cross-business',
    category: 'revenue',
    evidence: 'Over50FitLife coaching clients repeatedly ask for joint-friendly wrist wraps and supportive belts.',
    recommendation: 'Offer 15% exclusive VIP client bundle discount on Rhino Pro Wraps inside coaching onboarding kit.',
    expectedImpact: 'Estimated +$1,200/mo incremental merchandise revenue with zero CAC.',
    confidence: 'high',
    priority: 'medium',
    estimatedEffort: '1h',
    status: 'reviewing'
  }
];

export const INITIAL_APPROVALS: Approval[] = [
  {
    id: 'appr-1',
    title: 'Publish Social Carousel: "3 Exercises Seniors Should Never Skip"',
    category: 'publish_content',
    businessId: 'over50fitlife',
    initiator: 'Blotato Engine (via Claude Draft)',
    payloadSummary: 'Instagram & Facebook 6-slide carousel with branded typography, CTA link to free longevity workout guide.',
    riskLevel: 'medium',
    status: 'pending',
    timestamp: '1 hour ago',
    contextDetails: 'Requires human visual check on slide 4 anatomical diagram text.'
  },
  {
    id: 'appr-2',
    title: 'Execute 15% Markdown on 3 Stagnant Kim’s Closet Handbags',
    category: 'price_change',
    businessId: 'kims-closet',
    initiator: 'Inventory Intelligence Engine',
    payloadSummary: 'Reduces Gucci Monogram bag from $495 -> $435, Tory Burch Booties from $195 -> $170. Total price impact -$85.',
    riskLevel: 'medium',
    status: 'pending',
    timestamp: '2 hours ago',
    contextDetails: 'Items aged >60 days with high like counts. Markdown triggers notification to 52 past likers.'
  },
  {
    id: 'appr-3',
    title: 'Disburse Team Rhino Bulk Fabric Supplier Deposit ($1,850)',
    category: 'financial_txn',
    businessId: 'team-rhino',
    initiator: 'Purchasing Workflow',
    payloadSummary: 'Deposit wire to TexCore Mills for 300 meters of heavy-gauge wrist wrap webbing.',
    riskLevel: 'high',
    status: 'pending',
    timestamp: '4 hours ago',
    contextDetails: 'Production run for Q4 inventory replenishment. Terms 50% deposit, 50% on receipt.'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'critical',
    title: 'Consequential Approval Required',
    message: '3 items awaiting your sign-off before external dispatch.',
    timestamp: '10 mins ago',
    read: false,
    linkTarget: 'approvals'
  },
  {
    id: 'notif-2',
    type: 'warning',
    title: 'Lead SLA Threshold Warning',
    message: 'Marcus Vance consultation request has gone unanswered for 48 hours.',
    timestamp: '2 hours ago',
    read: false,
    businessId: 'over50fitlife',
    linkTarget: 'leads'
  },
  {
    id: 'notif-3',
    type: 'success',
    title: 'New Resale Sale: Burberry Trench ($340)',
    message: 'Poshmark funds secured in escrow.',
    timestamp: '3 hours ago',
    read: true,
    businessId: 'kims-closet',
    linkTarget: 'kims-closet'
  }
];

export const INITIAL_INTEGRATIONS: Integration[] = [
  {
    id: 'n8n',
    name: 'n8n Workflow Engine',
    category: 'automation',
    status: 'connected',
    mode: 'live',
    lastSyncAt: '2026-10-03 21:00 EST',
    supportedDataTypes: ['Webhooks', 'CRON Jobs', 'Data Transformations', 'System Health'],
    description: 'Primary self-hosted workflow automation service running backend triggers.',
    endpointUrl: 'https://n8n.internal.racerops.net'
  },
  {
    id: 'blotato',
    name: 'Blotato Social Engine',
    category: 'social',
    status: 'degraded',
    mode: 'live',
    lastSyncAt: '2026-10-03 20:00 EST',
    lastError: 'Pinterest token expired; Facebook/Instagram connectors healthy',
    supportedDataTypes: ['Social Scheduling', 'Asset Rendering', 'Post Analytics'],
    description: 'Automated social media publishing engine with gated approval workflows.'
  },
  {
    id: 'hubspot',
    name: 'HubSpot CRM',
    category: 'crm',
    status: 'connected',
    mode: 'mock',
    lastSyncAt: '2026-10-03 20:45 EST',
    supportedDataTypes: ['Contacts', 'Deals', 'Pipeline Stages', 'Consultation Notes'],
    description: 'Enterprise CRM sync adapter for Over50FitLife coaching prospects.'
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics 4',
    category: 'analytics',
    status: 'connected',
    mode: 'mock',
    lastSyncAt: '2026-10-03 20:30 EST',
    supportedDataTypes: ['Page Views', 'Bounce Rates', 'Traffic Channels', 'Conversion Goals'],
    description: 'Web behavioral metrics across Over50FitLife and marketing funnels.'
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare Edge',
    category: 'infrastructure',
    status: 'connected',
    mode: 'mock',
    lastSyncAt: '2026-10-03 21:01 EST',
    supportedDataTypes: ['DNS Health', 'SSL Certs', 'WAF Analytics', 'Uptime Heartbeat'],
    description: 'Edge security, CDN, and DNS gateway for all online properties.'
  },
  {
    id: 'apple-store',
    name: 'App Store Connect',
    category: 'store',
    status: 'connected',
    mode: 'mock',
    lastSyncAt: '2026-10-03 19:15 EST',
    supportedDataTypes: ['iOS Builds', 'App Review Status', 'In-App Subscriptions', 'Crash Reports'],
    description: 'Apple developer ecosystem adapter for NutriPlanPro iOS releases.'
  },
  {
    id: 'google-play',
    name: 'Google Play Console',
    category: 'store',
    status: 'degraded',
    mode: 'mock',
    lastSyncAt: '2026-10-03 19:15 EST',
    lastError: 'Version 2.4.2 currently awaiting Google Play policy review',
    supportedDataTypes: ['Android Builds', 'Store Policy Checks', 'Crashlytics', 'Install Velocity'],
    description: 'Google Play ecosystem adapter for NutriPlanPro Android releases.'
  },
  {
    id: 'openclaw',
    name: 'OpenClaw Agent',
    category: 'ai',
    status: 'connected',
    mode: 'mock',
    lastSyncAt: '2026-10-03 21:02 EST',
    supportedDataTypes: ['Task Delegation', 'Health Telemetry', 'Autonomous Run Traces'],
    description: 'Autonomous operations supervisor and workflow worker manager.'
  }
];

export const INITIAL_CONTENT: ContentItem[] = [
  {
    id: 'cnt-1',
    title: 'Why Grip Strength Predicts All-Cause Mortality Over 50',
    topic: 'strength',
    businessId: 'over50fitlife',
    platform: 'blog',
    format: 'blog',
    stage: 'approved',
    cta: 'Download the Free 12-Week Grip & Forearm Protocol',
    publicationDate: '2026-10-06',
    draftSnippet: 'Research in the Lancet confirms grip strength is a more powerful predictor of cardiovascular risk than systolic blood pressure...'
  },
  {
    id: 'cnt-2',
    title: 'Overcoming Shoulder Impingement When Bench Pressing',
    topic: 'strength',
    businessId: 'over50fitlife',
    platform: 'youtube',
    format: 'video',
    stage: 'published',
    cta: 'Book a 1-on-1 Form Audit Consultation',
    publicationDate: '2026-09-29',
    impressions: 14200,
    engagementRate: '7.4%'
  },
  {
    id: 'cnt-3',
    title: 'Macro Counting Made Painless for Busy Professionals',
    topic: 'nutrition',
    businessId: 'nutriplanpro',
    platform: 'instagram',
    format: 'social',
    stage: 'scheduled',
    cta: 'Try NutriPlanPro Free for 14 Days on iOS & Android',
    publicationDate: '2026-10-05'
  },
  {
    id: 'cnt-4',
    title: 'Top 5 Designer Handbags That Outperform the S&P 500',
    topic: 'resale',
    businessId: 'kims-closet',
    platform: 'newsletter',
    format: 'newsletter',
    stage: 'draft',
    cta: 'Shop Verified Authentic Handbags at Kim’s Closet',
    publicationDate: '2026-10-08'
  }
];
