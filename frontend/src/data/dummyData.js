// ============================================================
// DOMAIN DEFINITIONS
// ============================================================
export const DOMAINS = {
  Career: {
    key: "Career",
    label: "Career",
    icon: "Briefcase",
    color: "blue",
    description: "Job changes, growth paths, MBA decisions",
    keywords: ["job", "career", "work", "mba", "resume", "salary", "promotion", "hire", "interview", "skills", "internship", "switch", "corporate", "startup", "employment", "profession", "occupation", "workplace", "manager", "leadership"],
  },
  Finance: {
    key: "Finance",
    label: "Finance",
    icon: "TrendingUp",
    color: "emerald",
    description: "Investments, savings, and financial planning",
    keywords: ["money", "invest", "finance", "stock", "fund", "savings", "budget", "tax", "insurance", "loan", "debt", "mutual", "real estate", "returns", "portfolio", "wealth", "expense", "income", "profit", "loss", "bank", "crypto"],
  },
  Legal: {
    key: "Legal",
    label: "Legal",
    icon: "Scale",
    color: "violet",
    description: "Contracts, rights, and legal guidance",
    keywords: ["legal", "law", "contract", "court", "rights", "agreement", "sue", "lawyer", "attorney", "clause", "copyright", "ip", "intellectual property", "dispute", "litigation", "regulation", "compliance", "penalty", "fine", "jurisdiction"],
  },
  Wellbeing: {
    key: "Wellbeing",
    label: "Wellbeing",
    icon: "Heart",
    color: "rose",
    description: "Health, mental wellness, and lifestyle choices",
    keywords: ["health", "mental", "stress", "diet", "fitness", "sleep", "anxiety", "depression", "exercise", "wellbeing", "wellness", "therapy", "meditation", "nutrition", "weight", "fasting", "lifestyle", "habit", "energy", "burnout"],
  },
};

// ============================================================
// DOMAIN Q&A KNOWLEDGE BASE
// ============================================================
export const domainKnowledge = {
  Career: [
    {
      keywords: ["mba", "higher studies", "master", "business school"],
      recommendation: "Pursue an Executive MBA if you have 5+ years of experience",
      reasoning: ["Accelerates leadership trajectory significantly", "Builds a high-value professional network", "Opens doors to C-suite and strategic roles"],
      risks: ["High financial cost (₹15-30L)", "2-year career pause for full-time programs", "ROI varies significantly by institute ranking"],
      simulation: { best_case: "50-80% salary hike + leadership role within 3 years", worst_case: "Break-even on investment after 5 years", timeline: "2-5 years" },
      followUps: [
        { q: "What is your current work experience in years?", options: ["0-2 years", "2-5 years", "5+ years"] },
        { q: "What is your primary goal for the MBA?", options: ["Career switch", "Salary increase", "Leadership role"] },
        { q: "Are you considering Indian or foreign institutes?", options: ["India (IIM/ISB)", "Abroad (INSEAD/Wharton)", "Online program"] },
        { q: "What is your target time frame?", options: ["Within 1 year", "1-2 years", "Flexible"] },
      ],
      resources: [
        { title: "HBR: Is an MBA Still Worth It?", url: "https://hbr.org/2020/09/is-an-mba-still-worth-it" },
        { title: "FT Top Global MBA Rankings", url: "https://rankings.ft.com/" }
      ]
    },
    {
      keywords: ["startup", "corporate", "switch", "job change"],
      recommendation: "Join a growth-stage startup for accelerated skill development",
      reasoning: ["Broader ownership and impact per person", "Faster skill acquisition across functions", "Higher equity upside if startup succeeds"],
      risks: ["Job security lower than corporates", "Benefits and structure may be lacking", "High burnout risk in early stages"],
      simulation: { best_case: "Rapid growth + equity gains in 3-5 years", worst_case: "Startup fails within 2 years", timeline: "3-4 years" },
      followUps: [
        { q: "How is your risk tolerance?", options: ["Low — prefer stability", "Medium", "High — growth at all costs"] },
        { q: "What stage startup interests you?", options: ["Early (Seed/Series A)", "Growth (Series B/C)", "Pre-IPO"] },
        { q: "Do you have financial runway for lower initial salary?", options: ["Yes (6+ months)", "Partially", "No"] },
      ],
      resources: [
        { title: "Y Combinator: How to Evaluate Startups", url: "https://www.ycombinator.com/library/4D-how-to-evaluate-startups" },
        { title: "Equity vs Salary Calculator", url: "https://example.com/equity-calculator" }
      ]
    },
    {
      keywords: ["salary", "negotiation", "raise", "promotion", "hike"],
      recommendation: "Negotiate with market data and a documented value case",
      reasoning: ["Benchmark salary against Glassdoor/LinkedIn data", "Present quantifiable achievements (revenue, savings)", "Timing matters — post-appraisal cycles are ideal"],
      risks: ["Counter-offer may not come", "Relationship impact if handled poorly"],
      simulation: { best_case: "20-30% hike secured within 3 months", worst_case: "Offer declined, seek external opportunities", timeline: "1-3 months" },
      followUps: [
        { q: "When was your last salary revision?", options: ["Less than 6 months", "6-12 months", "More than 1 year"] },
        { q: "What is your leverage (competing offer)?", options: ["Yes, I have one", "Exploring options", "No competing offer"] },
        { q: "How long have you been in your current role?", options: ["Less than 1 year", "1-3 years", "3+ years"] },
      ],
      resources: [
        { title: "Harvard Law School: Negotiation Tactics", url: "https://www.pon.harvard.edu/daily/salary-negotiations/" },
        { title: "Glassdoor Salary Benchmarking", url: "https://www.glassdoor.com/Salaries/" }
      ]
    },
  ],
  Finance: [
    {
      keywords: ["invest", "stock", "mutual fund", "index", "portfolio", "wealth"],
      recommendation: "Diversify: 60% Index Funds, 20% Direct Equity, 20% Debt",
      reasoning: ["Index funds provide market returns with low fees", "Direct equity for higher alpha potential", "Debt instruments for stability and rebalancing"],
      risks: ["Market volatility can erode short-term returns", "Requires 7+ year investment horizon for optimal returns"],
      simulation: { best_case: "15-18% CAGR over 10 years doubling wealth", worst_case: "6-8% flat returns in stagnant market", timeline: "7-15 years" },
      followUps: [
        { q: "What is your investment horizon?", options: ["Short (1-3 yrs)", "Medium (3-7 yrs)", "Long (7+ yrs)"] },
        { q: "What is your monthly investable surplus?", options: ["< ₹10,000", "₹10,000-50,000", "> ₹50,000"] },
        { q: "What is your current risk appetite?", options: ["Conservative", "Moderate", "Aggressive"] },
        { q: "Do you have an emergency fund in place?", options: ["Yes (6 months)", "Partially", "No"] },
      ],
      resources: [
        { title: "Investopedia: Asset Allocation Strategies", url: "https://www.investopedia.com/managing-wealth/achieve-optimal-asset-allocation/" },
        { title: "Vanguard Index Fund Guide", url: "https://investor.vanguard.com/investment-products/index-funds" }
      ]
    },
    {
      keywords: ["real estate", "property", "house", "flat", "rent"],
      recommendation: "Buy property only if planning to stay 7+ years in that city",
      reasoning: ["Real estate provides leverage and tax benefits", "Rental yield in India is 2-3% — lower than other assets", "Illiquid asset — diversification is key"],
      risks: ["High upfront capital requirement", "Illiquidity risk", "Maintenance and legal complexities"],
      simulation: { best_case: "Property appreciates 8-10% annually in metro areas", worst_case: "Flat market or declining city tier", timeline: "7-10 years" },
      followUps: [
        { q: "Are you planning to self-occupy or rent out?", options: ["Self-occupy", "Rent out", "Undecided"] },
        { q: "Is this your first property?", options: ["Yes", "No — additional property"] },
        { q: "What city/tier are you targeting?", options: ["Metro (Mumbai/Delhi)", "Tier 2 (Pune/Hyderabad)", "Other"] },
      ],
      resources: [
        { title: "Rent vs Buy Calculator", url: "https://www.nytimes.com/interactive/2024/upshot/buy-rent-calculator.html" },
        { title: "Real Estate Market Reports", url: "https://www.knightfrank.com/research" }
      ]
    },
    {
      keywords: ["tax", "saving", "80c", "itr", "return"],
      recommendation: "Maximize 80C + NPS + HRA to reduce effective tax rate",
      reasoning: ["80C allows ₹1.5L deduction via ELSS, PPF, LIC", "NPS gives additional ₹50K under 80CCD(1B)", "HRA exemption if residing in rented accommodation"],
      risks: ["Lock-in periods for some instruments (PPF = 15 years)", "Penalty for early withdrawal from ELSS before 3 years"],
      simulation: { best_case: "Save ₹80,000+ in taxes annually", worst_case: "Minimal benefit for very high income brackets", timeline: "1 year (annual)" },
      followUps: [
        { q: "What is your approximate annual income?", options: ["< ₹5L", "₹5L-12L", "> ₹12L"] },
        { q: "Are you salaried or self-employed?", options: ["Salaried", "Self-employed/Freelance", "Business owner"] },
        { q: "Do you currently file ITR yourself?", options: ["Yes", "No — CA handles it"] },
      ],
      resources: [
        { title: "ClearTax: 80C Investment Options", url: "https://cleartax.in/s/80c-80-deductions" },
        { title: "Income Tax Department Official Portal", url: "https://www.incometax.gov.in/iec/foportal/" }
      ]
    },
  ],
  Legal: [
    {
      keywords: ["contract", "agreement", "sign", "clause", "legal document"],
      recommendation: "Always have a lawyer review before signing any binding contract",
      reasoning: ["Critical clauses (termination, IP ownership, jurisdiction) are often buried", "Verbal amendments are unenforceable — get everything in writing", "Limitation of liability clauses can expose you to unlimited risk"],
      risks: ["Vague scope-of-work clauses lead to disputes", "Jurisdiction clauses can make litigation expensive"],
      simulation: { best_case: "Clean contract, no disputes, relationship preserved", worst_case: "Legal dispute costing 10x legal fees", timeline: "Immediate (before signing)" },
      followUps: [
        { q: "What type of contract is this?", options: ["Employment", "Freelance/Service", "Business partnership", "NDA"] },
        { q: "Is there an intellectual property clause?", options: ["Yes", "No", "Not sure"] },
        { q: "What is the contract duration?", options: ["< 6 months", "6-12 months", "Multi-year"] },
        { q: "Do you have access to a lawyer?", options: ["Yes", "Need to find one", "Want to self-review"] },
      ],
      resources: [
        { title: "Nolo: Contracts 101", url: "https://www.nolo.com/legal-encyclopedia/contracts-101-make-legally-valid-30247.html" },
        { title: "Standard NDA Templates", url: "https://www.ycombinator.com/documents" }
      ]
    },
    {
      keywords: ["copyright", "ip", "intellectual property", "trademark", "patent"],
      recommendation: "Register your IP immediately — first-to-file matters in India",
      reasoning: ["Copyright is automatic but registration strengthens legal standing", "Trademark gives exclusive brand protection nationwide", "Patent protects inventions for 20 years"],
      risks: ["Registration costs range ₹5,000-50,000 depending on type", "Patent examination takes 2-7 years in India"],
      simulation: { best_case: "Full legal protection, licensing revenue potential", worst_case: "Competitor registers similar IP first", timeline: "3-6 months for registration" },
      followUps: [
        { q: "What type of IP are you protecting?", options: ["Brand/Logo (Trademark)", "Creative work (Copyright)", "Invention (Patent)", "Software"] },
        { q: "Is this for a business or personal use?", options: ["Business/Startup", "Personal/Freelance"] },
        { q: "Have competitors already copied your work?", options: ["Yes", "No — preventive", "Unsure"] },
      ],
      resources: [
        { title: "India IP Office Official Website", url: "https://ipindia.gov.in/" },
        { title: "WIPO: Intellectual Property Handbook", url: "https://www.wipo.int/publications/en/details.jsp?id=4517" }
      ]
    },
    {
      keywords: ["rights", "dispute", "sue", "court", "litigation"],
      recommendation: "Attempt mediation first — litigation is costly and slow",
      reasoning: ["Mediation resolves 70% of commercial disputes faster", "Court cases take 5-15 years in Indian system", "Legal fees can exceed the disputed amount"],
      risks: ["Mediated agreements may lack enforceability", "Counterparty may refuse mediation"],
      simulation: { best_case: "Resolved in 3-6 months via mediation", worst_case: "5+ year litigation with uncertain outcome", timeline: "3 months (mediation) to 5+ years (court)" },
      followUps: [
        { q: "What is the nature of the dispute?", options: ["Financial", "Property", "Employment", "Consumer"] },
        { q: "What is the value at stake?", options: ["< ₹1L (Small claims)", "₹1L-10L", "> ₹10L"] },
        { q: "Has the other party been unresponsive?", options: ["Yes", "We've spoken but disagree", "Haven't reached out"] },
      ],
      resources: [
        { title: "Mediation vs Litigation Overview", url: "https://www.findlaw.com/litigation/going-to-court/mediation-vs-litigation.html" },
        { title: "National Legal Services Authority (India)", url: "https://nalsa.gov.in/" }
      ]
    },
  ],
  Wellbeing: [
    {
      keywords: ["stress", "burnout", "mental health", "anxiety", "depression", "overwhelmed"],
      recommendation: "Implement a structured daily reset routine + seek professional support",
      reasoning: ["Burnout is physiological — requires systemic change, not willpower", "Therapy reduces anxiety symptoms significantly in 8-12 sessions", "Daily 10-min mindfulness proven to lower cortisol by 30%"],
      risks: ["Ignoring burnout leads to long-term health consequences", "Self-diagnosis can delay proper treatment"],
      simulation: { best_case: "Significant improvement in 6-8 weeks with structured approach", worst_case: "Chronic condition requiring extended support", timeline: "6-12 weeks" },
      followUps: [
        { q: "How long have you been feeling this way?", options: ["< 2 weeks", "2-8 weeks", "3+ months"] },
        { q: "Is this affecting your work performance?", options: ["Yes, significantly", "Somewhat", "Not yet"] },
        { q: "Have you spoken to a professional?", options: ["Yes, currently in therapy", "No — open to it", "Prefer self-help first"] },
        { q: "What triggers it most?", options: ["Work overload", "Relationships", "Financial pressure", "Uncertainty"] },
      ],
      resources: [
        { title: "Mayo Clinic: Understanding Job Burnout", url: "https://www.mayoclinic.org/healthy-lifestyle/adult-health/in-depth/burnout/art-20046642" },
        { title: "Headspace: Meditation for Stress", url: "https://www.headspace.com/meditation/stress" }
      ]
    },
    {
      keywords: ["diet", "fasting", "weight", "nutrition", "eat", "food"],
      recommendation: "Start 16:8 Intermittent Fasting with a protein-first diet strategy",
      reasoning: ["16:8 IF improves insulin sensitivity and fat metabolism", "Protein-first meals reduce cravings by 60%", "Scientific consensus supports sustained weight loss vs crash diets"],
      risks: ["Not suitable for people with diabetes or eating disorders", "Initial fatigue for first 1-2 weeks", "Social eating becomes harder"],
      simulation: { best_case: "4-6 kg weight loss in 8 weeks + improved energy", worst_case: "No weight change if caloric surplus is maintained", timeline: "8-12 weeks" },
      followUps: [
        { q: "What is your primary goal?", options: ["Weight loss", "Muscle gain", "Energy improvement", "Maintain current state"] },
        { q: "Any dietary restrictions?", options: ["Vegetarian", "Vegan", "Non-vegetarian", "No restrictions"] },
        { q: "Current activity level?", options: ["Sedentary", "Light exercise", "Moderate (3-4x/week)", "High (5+/week)"] },
        { q: "Have you tried structured dieting before?", options: ["Yes, unsuccessfully", "Yes, with some success", "First time"] },
      ],
      resources: [
        { title: "Johns Hopkins: Intermittent Fasting Guide", url: "https://www.hopkinsmedicine.org/health/wellness-and-prevention/intermittent-fasting-what-is-it-and-how-does-it-work" },
        { title: "Harvard Nutrition Source: Protein", url: "https://www.hsph.harvard.edu/nutritionsource/what-should-you-eat/protein/" }
      ]
    },
    {
      keywords: ["sleep", "insomnia", "tired", "rest", "fatigue"],
      recommendation: "Establish a strict sleep schedule + eliminate blue light 90 min before bed",
      reasoning: ["Consistent sleep timing anchors circadian rhythm", "Blue light suppresses melatonin production", "7-9 hours is optimal for cognitive performance and immunity"],
      risks: ["Sleep deprivation compounds — 7 days of bad sleep = cognitive decline", "Over-the-counter sleep aids cause dependency"],
      simulation: { best_case: "Improved sleep quality in 2-3 weeks", worst_case: "Underlying medical condition requiring specialist", timeline: "2-4 weeks for lifestyle changes" },
      followUps: [
        { q: "How many hours do you currently sleep?", options: ["< 5 hours", "5-6 hours", "6-7 hours"] },
        { q: "Do you use screens before bed?", options: ["Yes, heavily", "Occasionally", "Rarely"] },
        { q: "Do you consume caffeine after 2PM?", options: ["Yes, daily", "Sometimes", "No"] },
      ],
      resources: [
        { title: "Sleep Foundation: Sleep Hygiene", url: "https://www.sleepfoundation.org/sleep-hygiene" },
        { title: "Huberman Lab: Master Your Sleep", url: "https://hubermanlab.com/toolkit-for-sleep/" }
      ]
    },
  ],
};

// ============================================================
// ADMIN USER LIST
// ============================================================
export const adminUsers = [
  { id: "u001", name: "Aryan Mehta", email: "aryan@demo.ai", domain: "Career", queries: 14, status: "Active", joined: "2026-03-10", remark: "" },
  { id: "u002", name: "Priya Sharma", email: "priya@demo.ai", domain: "Finance", queries: 8, status: "Active", joined: "2026-03-18", remark: "" },
  { id: "u003", name: "Rahul Gupta", email: "rahul@demo.ai", domain: "Legal", queries: 3, status: "Blocked", joined: "2026-04-01", remark: "Violated terms of service" },
  { id: "u004", name: "Sneha Joshi", email: "sneha@demo.ai", domain: "Wellbeing", queries: 21, status: "Active", joined: "2026-04-05", remark: "" },
  { id: "u005", name: "Dev Kumar", email: "dev@demo.ai", domain: "Career", queries: 6, status: "Active", joined: "2026-04-12", remark: "" },
  { id: "u006", name: "Anita Rao", email: "anita@demo.ai", domain: "Finance", queries: 11, status: "Active", joined: "2026-04-14", remark: "" },
];

export const adminDomainStats = [
  { domain: "Career", queries: 320 },
  { domain: "Finance", queries: 280 },
  { domain: "Legal", queries: 140 },
  { domain: "Wellbeing", queries: 210 },
];

export const adminSummaryStats = {
  totalUsers: 63,
  totalQueries: 950,
  activeSessions: 7,
  flaggedQueries: 4,
};

// ============================================================
// AUDIT LOGS
// ============================================================
export const auditLogs = [
  { id: "LOG-001", user: "system", action: "System initialized", timestamp: "2026-04-22 00:00", severity: "Low" },
  { id: "LOG-002", user: "aryan@demo.ai", action: "Session started — Career domain", timestamp: "2026-04-22 09:14", severity: "Low" },
  { id: "LOG-003", user: "rahul@demo.ai", action: "Query flagged: domain mismatch attempt", timestamp: "2026-04-22 10:32", severity: "High" },
  { id: "LOG-004", user: "admin@intellichoice.ai", action: "User rahul@demo.ai blocked", timestamp: "2026-04-22 11:00", severity: "Medium" },
  { id: "LOG-005", user: "priya@demo.ai", action: "Archive accessed — 8 items", timestamp: "2026-04-22 13:20", severity: "Low" },
  { id: "LOG-006", user: "sneha@demo.ai", action: "Settings profile updated", timestamp: "2026-04-22 15:45", severity: "Low" },
  { id: "LOG-007", user: "system", action: "Daily model weights calibration completed", timestamp: "2026-04-22 18:00", severity: "Low" },
  { id: "LOG-008", user: "anita@demo.ai", action: "Gibberish query rejected by validation layer", timestamp: "2026-04-22 20:11", severity: "Medium" },
];

// ============================================================
// DEMO ARCHIVE (seed history for demo user)
// ============================================================
export const seedArchive = [
  {
    id: "arc-001",
    query: "Should I switch from corporate to startup?",
    domain: "Career",
    date: "2026-04-20 14:30",
    response: {
      recommendation: "Join a growth-stage startup for accelerated skill development",
      reasoning: ["Broader ownership and impact per person", "Faster skill acquisition across functions"],
      risks: ["Job security lower than corporates", "High burnout risk"],
      simulation: { best_case: "Rapid growth + equity gains", worst_case: "Startup fails", timeline: "3-4 years" },
    },
  },
  {
    id: "arc-002",
    query: "How should I invest my first salary?",
    domain: "Finance",
    date: "2026-04-21 10:15",
    response: {
      recommendation: "Diversify: 60% Index Funds, 20% Direct Equity, 20% Debt",
      reasoning: ["Index funds provide market returns with low fees", "Direct equity for higher alpha potential"],
      risks: ["Market volatility", "Requires long investment horizon"],
      simulation: { best_case: "15-18% CAGR", worst_case: "6-8% flat", timeline: "7 years" },
    },
  },
];

// ============================================================
// LEGACY EXPORTS (kept for backward compat)
// ============================================================
export const userTopics = [
  { key: "Career", label: "Career" },
  { key: "Finance", label: "Finance" },
  { key: "Legal", label: "Legal" },
  { key: "Wellbeing", label: "Wellbeing" },
];

// Generate a big decisions array for aiUtils compatibility
const baseDecisions = Object.values(domainKnowledge).flatMap((entries) => entries);
export const decisionData = baseDecisions;

export const dashboardStats = [
  { label: "Total Decisions", value: 1248, hint: "System Wide" },
  { label: "Success Rate", value: "94.2%", hint: "Accuracy" },
  { label: "Active Domain", value: "Career & AI", hint: "Trending" },
  { label: "Risk Mitigation", value: 0.88, hint: "Coefficient" },
];

export const userDecisionTraffic = [
  { day: "Mon", value: 45 }, { day: "Tue", value: 32 }, { day: "Wed", value: 58 },
  { day: "Thu", value: 41 }, { day: "Fri", value: 72 }, { day: "Sat", value: 85 }, { day: "Sun", value: 64 },
];

export const userCategoryDistribution = [
  { label: "Career & Growth", value: 45 }, { label: "Wealth & Finance", value: 25 },
  { label: "Health & Vitality", value: 20 }, { label: "Legal", value: 10 },
];

export const adminDecisionQueue = [
  { id: "DEC-8812", domain: "Career", risk: "Moderate", guard: "Passed", owner: "System Agent Alpha", updated: "2m ago" },
  { id: "DEC-8815", domain: "Finance", risk: "High", guard: "Review Required", owner: "System Agent Beta", updated: "15m ago" },
];

export const adminAuditHistory = auditLogs;

export const adminToolMetrics = [];

export const adminSettingsData = {
  environments: [
    { name: "Production", model: "GPT-Pro-v4", guardLevel: "High", cache: "Persistent" },
    { name: "Staging", model: "GPT-Turbo-v3", guardLevel: "Balanced", cache: "Volatile" },
  ],
  notificationChannels: [
    { channel: "System Logs (Internal)", enabled: true },
    { channel: "Discord Webhook", enabled: true },
  ],
};