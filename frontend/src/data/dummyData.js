export const dummyResponse = {
  career: {
    label: "Career",
    aspects: [
      "Higher Studies",
      "Job Switch",
      "Promotion Strategy",
      "Skill Upgrade",
      "Domain Pivot",
      "Interview Prep",
      "Leadership Track",
      "Freelancing",
      "Startup Path",
      "Research Career",
      "Remote Career",
      "International Roles",
    ],
    questionBank: [
      { id: "c1", question: "What is your current career stage?", options: ["Student", "Early Career", "Mid-Level", "Senior"] },
      { id: "c2", question: "Which outcome matters most right now?", options: ["Higher Salary", "Role Clarity", "Stability", "Fast Growth"] },
      { id: "c3", question: "What is your timeline for change?", options: ["1-3 months", "3-6 months", "6-12 months", "1+ year"] },
      { id: "c4", question: "Which learning mode suits you?", options: ["Self-paced", "Mentor-led", "University Program", "Bootcamp"] },
      { id: "c5", question: "How much time can you invest weekly?", options: ["<5 hrs", "5-10 hrs", "10-15 hrs", "15+ hrs"] },
      { id: "c6", question: "Preferred work style?", options: ["Hands-on Coding", "Research", "Management", "Hybrid"] },
      { id: "c7", question: "Which sector attracts you?", options: ["Product", "Service", "Research Lab", "Startup"] },
      { id: "c8", question: "How confident are you in interviews?", options: ["Low", "Moderate", "Good", "Very Strong"] },
      { id: "c9", question: "Do you have a portfolio of projects?", options: ["No", "Basic", "Strong", "Outstanding"] },
      { id: "c10", question: "Preferred career location?", options: ["Local", "Metro Cities", "Remote Global", "Open to Relocation"] },
      { id: "c11", question: "How much risk can you take?", options: ["Very Low", "Low", "Moderate", "High"] },
      { id: "c12", question: "What is your strongest skill area?", options: ["Technical", "Communication", "Leadership", "Analytical"] },
      { id: "c13", question: "Need a certification-driven path?", options: ["Yes", "Maybe", "Only if required", "No"] },
      { id: "c14", question: "How important is work-life balance?", options: ["Critical", "Important", "Moderate", "Low Priority"] },
    ],
    recommendation: "Pursue M.Tech in AI & Data Systems",
    reasoning: [
      "Strong alignment with your long-term goal in applied machine learning.",
      "The program balances deep technical foundations with real-world projects.",
      "It improves your profile for both research and high-growth industry teams.",
    ],
    resources: [
      {
        title: "IEEE Paper 2024",
        description: "Recent trends in AI-driven career mobility and specialization paths.",
        citation: "https://ieeexplore.ieee.org/",
      },
      {
        title: "NASSCOM Skill Report",
        description: "Data-backed overview of in-demand AI capabilities and outcomes.",
        citation: "https://nasscom.in/",
      },
    ],
  },
  finance: {
    label: "Finance",
    aspects: [
      "Monthly Budgeting",
      "Debt Management",
      "Emergency Fund",
      "Short-term Investing",
      "Long-term Investing",
      "Retirement Planning",
      "Tax Planning",
      "Insurance Planning",
      "Wealth Preservation",
      "Portfolio Rebalancing",
      "Passive Income",
      "Goal-based Savings",
    ],
    questionBank: [
      { id: "f1", question: "What is your monthly savings ratio?", options: ["0-10%", "10-20%", "20-35%", "35%+"] },
      { id: "f2", question: "What is your current debt level?", options: ["None", "Low", "Moderate", "High"] },
      { id: "f3", question: "How stable is your income?", options: ["Highly Variable", "Somewhat Stable", "Stable", "Very Stable"] },
      { id: "f4", question: "Your investment horizon?", options: ["<1 year", "1-3 years", "3-7 years", "7+ years"] },
      { id: "f5", question: "Risk comfort level?", options: ["Very Low", "Low", "Moderate", "High"] },
      { id: "f6", question: "Primary finance goal?", options: ["Safety", "Growth", "Income", "Balanced"] },
      { id: "f7", question: "Do you track expenses regularly?", options: ["Never", "Sometimes", "Often", "Always"] },
      { id: "f8", question: "Emergency fund status?", options: ["None", "1-2 months", "3-6 months", "6+ months"] },
      { id: "f9", question: "Preferred investing style?", options: ["Passive", "Active", "Advisory", "Not Sure"] },
      { id: "f10", question: "Tax optimization priority?", options: ["Low", "Medium", "High", "Critical"] },
      { id: "f11", question: "Insurance coverage quality?", options: ["No Coverage", "Basic", "Adequate", "Comprehensive"] },
      { id: "f12", question: "Need liquidity soon?", options: ["Immediate", "Within 6 months", "Within 1 year", "No"] },
      { id: "f13", question: "Investment knowledge level?", options: ["Beginner", "Intermediate", "Advanced", "Expert"] },
      { id: "f14", question: "Preferred portfolio type?", options: ["Conservative", "Balanced", "Growth", "Aggressive"] },
    ],
    recommendation: "Use a 60/30/10 split: Index Funds, Bonds, Emergency Reserve",
    reasoning: [
      "The strategy balances growth with volatility control.",
      "Diversification lowers concentration risk in uncertain markets.",
      "An emergency reserve protects against sudden financial shocks.",
    ],
    resources: [
      {
        title: "RBI Retail Investor Handbook",
        description: "Fundamentals for risk, debt instruments, and savings behavior.",
        citation: "https://rbi.org.in/",
      },
      {
        title: "SEBI Investor Education",
        description: "Guidelines for long-term disciplined investing.",
        citation: "https://www.sebi.gov.in/",
      },
    ],
  },
  wellbeing: {
    label: "Personal Wellbeing",
    aspects: [
      "Stress Management",
      "Sleep Quality",
      "Fitness Routine",
      "Nutrition Discipline",
      "Mental Health",
      "Work-Life Balance",
      "Focus & Productivity",
      "Habit Building",
      "Emotional Stability",
      "Burnout Recovery",
      "Social Wellbeing",
      "Mindfulness",
    ],
    questionBank: [
      { id: "w1", question: "How often do you feel stressed?", options: ["Rarely", "Sometimes", "Often", "Daily"] },
      { id: "w2", question: "Average nightly sleep duration?", options: ["<5 hrs", "5-6 hrs", "6-7 hrs", "7+ hrs"] },
      { id: "w3", question: "Current physical activity level?", options: ["None", "Light", "Moderate", "High"] },
      { id: "w4", question: "Main wellbeing concern?", options: ["Stress", "Energy", "Sleep", "Mood"] },
      { id: "w5", question: "How consistent are routines?", options: ["Very Inconsistent", "Somewhat", "Mostly Consistent", "Highly Consistent"] },
      { id: "w6", question: "Do you practice mindfulness?", options: ["Never", "Occasionally", "Weekly", "Daily"] },
      { id: "w7", question: "Screen-time management?", options: ["Poor", "Average", "Good", "Excellent"] },
      { id: "w8", question: "Nutrition quality self-rating?", options: ["Poor", "Average", "Good", "Excellent"] },
      { id: "w9", question: "Biggest blocker to wellbeing?", options: ["Time", "Motivation", "Knowledge", "Environment"] },
      { id: "w10", question: "Need fast results or sustainable plan?", options: ["Fast", "Balanced", "Sustainable", "Not Sure"] },
      { id: "w11", question: "How is emotional regulation?", options: ["Low", "Improving", "Stable", "Strong"] },
      { id: "w12", question: "Support system quality?", options: ["Weak", "Moderate", "Strong", "Very Strong"] },
      { id: "w13", question: "Work-life boundary strength?", options: ["Very Weak", "Weak", "Moderate", "Strong"] },
      { id: "w14", question: "Would coaching help?", options: ["Yes", "Maybe", "Not Now", "No"] },
    ],
    recommendation: "Adopt a 30-day balanced routine: sleep, movement, and mindfulness",
    reasoning: [
      "Improved sleep quality produces the fastest wellbeing gains.",
      "Light daily exercise reduces stress and improves focus.",
      "Short mindfulness blocks improve emotional regulation and consistency.",
    ],
    resources: [
      {
        title: "WHO Wellbeing Guidelines",
        description: "Evidence-based recommendations for preventive wellbeing practices.",
        citation: "https://www.who.int/",
      },
      {
        title: "CDC Healthy Living Toolkit",
        description: "Practical templates for sleep, activity, and stress habits.",
        citation: "https://www.cdc.gov/",
      },
    ],
  },
  legal: {
    label: "Legal",
    aspects: [
      "Contract Review",
      "Employment Issues",
      "Property Matters",
      "Consumer Complaints",
      "Compliance Checks",
      "IP/Trademark Basics",
      "Dispute Resolution",
      "Legal Documentation",
      "Data Privacy",
      "Business Registration",
      "Notice/Response Planning",
      "Case Timeline Planning",
    ],
    questionBank: [
      { id: "l1", question: "What type of legal matter is this?", options: ["Contract", "Employment", "Property", "Other"] },
      { id: "l2", question: "Current urgency level?", options: ["Low", "Moderate", "High", "Critical"] },
      { id: "l3", question: "Do you have relevant documents ready?", options: ["No", "Partial", "Most", "Complete"] },
      { id: "l4", question: "Goal of legal support?", options: ["Preventive Review", "Negotiation", "Dispute", "Compliance"] },
      { id: "l5", question: "Any official notice received?", options: ["No", "Yes - Informal", "Yes - Formal", "Not Sure"] },
      { id: "l6", question: "Need local jurisdiction-specific advice?", options: ["Yes", "Maybe", "No", "Unsure"] },
      { id: "l7", question: "Do deadlines apply soon?", options: ["Within 3 days", "Within 2 weeks", "Within 1 month", "No immediate deadline"] },
      { id: "l8", question: "How complex is the case?", options: ["Simple", "Moderate", "Complex", "Very Complex"] },
      { id: "l9", question: "Preferred legal path?", options: ["Settlement", "Formal Notice", "Litigation Prep", "Consultation First"] },
      { id: "l10", question: "Need confidentiality controls?", options: ["Essential", "Important", "Optional", "Not Needed"] },
      { id: "l11", question: "Prior legal consultation done?", options: ["No", "One Session", "Multiple Sessions", "Ongoing"] },
      { id: "l12", question: "Estimated legal budget readiness?", options: ["Low", "Moderate", "High", "Flexible"] },
      { id: "l13", question: "Counterparty responsiveness?", options: ["Unresponsive", "Slow", "Cooperative", "Unknown"] },
      { id: "l14", question: "Risk tolerance for escalation?", options: ["Very Low", "Low", "Moderate", "High"] },
    ],
    recommendation: "Start with contract/document review before taking legal action",
    reasoning: [
      "Early document analysis reduces avoidable legal risk.",
      "A preventive strategy often avoids costly escalations.",
      "Timeline mapping ensures compliance with legal filing windows.",
    ],
    resources: [
      {
        title: "Legal Aid Advisory Portal",
        description: "General legal information and first-step guidance resources.",
        citation: "https://www.legalaid.gov/",
      },
      {
        title: "Contract Review Checklist",
        description: "Common clauses to validate before signing or disputing agreements.",
        citation: "https://www.americanbar.org/",
      },
    ],
  },
};

export const userTopics = [
  { key: "career", label: "Career" },
  { key: "finance", label: "Finance" },
  { key: "wellbeing", label: "Personal Wellbeing" },
  { key: "legal", label: "Legal" },
];

export const dashboardStats = {
  totalDecisions: 120,
  activeUsers: 45,
  cacheHits: 78,
  llmUsage: 32,
};

export const queryTrend = [
  { day: "Mon", value: 24 },
  { day: "Tue", value: 40 },
  { day: "Wed", value: 35 },
  { day: "Thu", value: 52 },
  { day: "Fri", value: 48 },
  { day: "Sat", value: 36 },
  { day: "Sun", value: 44 },
];

export const queryCategories = [
  { label: "Career", value: 38, color: "#2563eb" },
  { label: "Finance", value: 24, color: "#0ea5e9" },
  { label: "Health", value: 20, color: "#38bdf8" },
  { label: "Legal", value: 18, color: "#7dd3fc" },
];

export const recentActivity = [
  { user: "alex@intelli.ai", query: "Compare MBA vs M.Tech", status: "Passed", time: "2 mins ago" },
  { user: "maria@intelli.ai", query: "Should I invest in bonds?", status: "Passed", time: "15 mins ago" },
  { user: "joel@intelli.ai", query: "Need legal guidance for contract", status: "Failed", time: "25 mins ago" },
  { user: "zara@intelli.ai", query: "Career pivot to AI product role", status: "Passed", time: "45 mins ago" },
];

export const adminDecisionQueue = [
  { id: "D-1021", domain: "Career", risk: "Low", guard: "Passed", owner: "alex@intelli.ai", updated: "3 mins ago" },
  { id: "D-1022", domain: "Finance", risk: "Medium", guard: "Passed", owner: "maria@intelli.ai", updated: "10 mins ago" },
  { id: "D-1023", domain: "Legal", risk: "High", guard: "Review", owner: "joel@intelli.ai", updated: "18 mins ago" },
  { id: "D-1024", domain: "Wellbeing", risk: "Low", guard: "Passed", owner: "sara@intelli.ai", updated: "24 mins ago" },
  { id: "D-1025", domain: "Career", risk: "Medium", guard: "Passed", owner: "ravi@intelli.ai", updated: "32 mins ago" },
  { id: "D-1026", domain: "Finance", risk: "High", guard: "Review", owner: "nora@intelli.ai", updated: "40 mins ago" },
];

export const adminAuditHistory = [
  { id: "A-8901", event: "Guard escalation triggered", severity: "High", actor: "policy-engine", time: "Today 09:42" },
  { id: "A-8902", event: "Prompt policy updated", severity: "Medium", actor: "admin@intellichoice.ai", time: "Today 09:10" },
  { id: "A-8903", event: "Cache key invalidated", severity: "Low", actor: "system", time: "Today 08:52" },
  { id: "A-8904", event: "Model fallback activated", severity: "Medium", actor: "router-service", time: "Today 08:11" },
  { id: "A-8905", event: "User query quarantined", severity: "High", actor: "guard-service", time: "Today 07:40" },
  { id: "A-8906", event: "Knowledge source refreshed", severity: "Low", actor: "sync-worker", time: "Today 07:05" },
];

export const adminToolMetrics = [
  { name: "Prompt Guard", uptime: "99.94%", latency: "118ms", status: "Healthy" },
  { name: "Citation Retriever", uptime: "99.71%", latency: "204ms", status: "Healthy" },
  { name: "Cache Layer", uptime: "99.88%", latency: "42ms", status: "Healthy" },
  { name: "Policy Router", uptime: "99.35%", latency: "166ms", status: "Warning" },
  { name: "Audit Logger", uptime: "99.99%", latency: "35ms", status: "Healthy" },
];

export const adminSettingsData = {
  environments: [
    { name: "Production", model: "gpt-4.1", guardLevel: "Strict", cache: "Enabled" },
    { name: "Staging", model: "gpt-4.1-mini", guardLevel: "Balanced", cache: "Enabled" },
    { name: "Sandbox", model: "gpt-4.1-nano", guardLevel: "Lenient", cache: "Disabled" },
  ],
  notificationChannels: [
    { channel: "Email Alerts", enabled: true },
    { channel: "Slack Alerts", enabled: true },
    { channel: "Webhook Alerts", enabled: false },
  ],
};

export const userDummyInsights = [
  "78% of users improved decision confidence after 3 guided sessions.",
  "Finance decisions have the highest follow-up depth this week.",
  "Career path queries show strongest recommendation acceptance rate.",
  "Legal domain responses trigger additional guard checks by design.",
];

export const userQuickPrompts = [
  "Should I switch from service to product role in 6 months?",
  "How should I allocate savings for low-risk growth?",
  "I feel burnout from work. What habit sequence should I start?",
  "Do I need legal review before signing this contract?",
  "Is M.Tech better than MBA for AI leadership goals?",
];

export const userRecentDomainActivity = [
  { domain: "Career", sessions: 9, completion: "89%" },
  { domain: "Finance", sessions: 7, completion: "83%" },
  { domain: "Personal Wellbeing", sessions: 6, completion: "91%" },
  { domain: "Legal", sessions: 4, completion: "76%" },
];
