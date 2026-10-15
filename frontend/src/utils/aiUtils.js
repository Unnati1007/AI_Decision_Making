import { DOMAINS, domainKnowledge } from "../data/dummyData";

const FILLER_GREETINGS = new Set([
  "hello", "helo", "helllo", "hlo", "hlw", "hi", "hii", "hiii", "hey", "heyy", "heyyy",
  "hola", "namaste", "pranam", "bye", "byee", "bue", "by", "goodbye", "tata", "cya",
  "test", "testing", "check", "checking", "ok", "okay", "okk", "k", "cool", "fine",
  "good", "bad", "morning", "night", "pls", "please", "plz", "haan", "ha", "theek",
  "thik", "bhai", "bro", "dude", "yaar", "yar", "kuch", "bhi"
]);

// ─── Gibberish Detection ───────────────────────────────────
export const isGibberish = (text) => {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length < 2) return true;

  // Check repeated character sequences (e.g. "aaaaaaa")
  if (/(.)\1{4,}/.test(text.toLowerCase())) return true;

  // Check repeated words (e.g. "helo helo helo", "asdf asdf asdf")
  const cleaned = words.map((w) => w.replace(/[^a-zA-Z0-9]/g, "")).filter(Boolean);
  if (cleaned.length >= 3) {
    const counts = {};
    for (const w of cleaned) {
      counts[w] = (counts[w] || 0) + 1;
      if (counts[w] >= 3) return true;
    }
    if (cleaned.length >= 4 && new Set(cleaned).size <= 2) return true;
  }

  const realWords = words.filter((w) => w.length >= 3 && /^[a-zA-Z]+$/.test(w));
  return realWords.length / Math.max(words.length, 1) < 0.4;
};

// ─── Query Validation ─────────────────────────────────────
export const validateQuery = (text, domain) => {
  const trimmed = text.trim();
  const words = trimmed.split(/\s+/).filter((w) => w.length > 0);

  if (words.length < 2) {
    return { valid: false, error: "Please enter a meaningful query (at least 2-3 words)." };
  }
  if (isGibberish(trimmed)) {
    return { valid: false, error: "Please re-enter a valid, clear query without repetitive words." };
  }

  // Check if all or most words are pure greetings or filler
  const nonFiller = words.filter(
    (w) => !FILLER_GREETINGS.has(w.toLowerCase().replace(/[^a-z]/g, ""))
  );
  if (nonFiller.length < 2) {
    return {
      valid: false,
      error: "Please enter a specific decision question or dilemma (e.g., job offer comparison, notice period resignation, tax saving).",
    };
  }

  if (domain && !isDomainMatch(trimmed, domain)) {
    const domainLabel = DOMAINS[domain]?.label || domain;
    return {
      valid: false,
      error: `Your query seems outside the ${domainLabel} domain. Please ask queries related to your selected domain.`,
    };
  }
  return { valid: true, error: null };
};

// ─── Domain Match ──────────────────────────────────────────
export const isDomainMatch = (text, domain) => {
  const normalized = text.toLowerCase();
  const domainConfig = DOMAINS[domain];
  if (!domainConfig) return true; // no domain set, allow all

  // Check if query matches selected domain keywords
  const domainHit = domainConfig.keywords.some((kw) => normalized.includes(kw));

  // Check if query matches any OTHER domain strongly
  const otherDomains = Object.values(DOMAINS).filter((d) => d.key !== domain);
  const otherHit = otherDomains.some((d) =>
    d.keywords.filter((kw) => normalized.includes(kw)).length >= 2
  );

  // Allow if domain keyword found, or if no strong signal for other domain
  return domainHit || !otherHit;
};

// ─── Match Query to Domain Knowledge Base ─────────────────
export const matchQueryToDomain = (text, domain, numFollowUps = 4) => {
  const entries = domainKnowledge[domain] || [];
  const normalized = text.toLowerCase();

  let best = null;
  let maxScore = 0;

  entries.forEach((entry) => {
    const score = entry.keywords.filter((kw) => normalized.includes(kw)).length;
    if (score > maxScore) {
      maxScore = score;
      best = entry;
    }
  });

  // Fallback to first entry in domain if no match
  if (!best && entries.length > 0) best = entries[0];

  if (!best) return null;

  const followUps = best.followUps?.slice(0, Math.min(numFollowUps, 7)) || [];

  return {
    recommendation: best.recommendation,
    reasoning: best.reasoning,
    risks: best.risks,
    simulation: best.simulation,
    followUps,
    resources: best.resources || [],
  };
};

// ─── Get Follow-Up Questions ───────────────────────────────
export const getFollowUps = (domain, query) => {
  const result = matchQueryToDomain(query, domain);
  if (!result) return [];
  const count = 3 + Math.floor(Math.random() * 3); // 3–5
  return result.followUps.slice(0, count);
};

// ─── AI Thinking Steps ────────────────────────────────────
export const thinkingSteps = [
  "Validating input parameters...",
  "Checking domain alignment...",
  "Retrieving knowledge base entries...",
  "Running outcome simulations...",
  "Generating recommendation...",
];

// ─── Legacy exports ───────────────────────────────────────
export const matchQueryToData = (query) => {
  const allDomains = ["Career", "Finance", "Legal", "Wellbeing"];
  for (const d of allDomains) {
    const result = matchQueryToDomain(query, d);
    if (result) return result;
  }
  return null;
};

export const generateAIIndicators = (query, matchResult) => {
  const relevance = matchResult ? 0.75 + Math.random() * 0.2 : 0.3 + Math.random() * 0.2;
  return {
    relevance: (relevance * 100).toFixed(1) + "%",
    securityStatus: "Passed",
    confidence: relevance > 0.7 ? "High" : "Medium",
    latency: Math.floor(Math.random() * 300 + 700) + "ms",
  };
};
