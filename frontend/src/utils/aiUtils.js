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

const SENTENCE_PREDICATE_REGEX = new RegExp(
  "\\b(" +
  // Interrogatives & Question words
  "should|can|could|would|will|shall|may|might|must|is|are|am|was|were|do|does|did|have|has|had|" +
  "what|how|why|which|who|whom|whose|where|when|whether|if|" +
  "kya|kaise|kyun|kaun|kaunsa|kab|kahan|kisko|kiska|" +
  // Choice & Comparison
  "or|vs|versus|ya|than|either|neither|between|against|prefer|better than|" +
  // Personal Pronouns
  "i|my|me|mine|myself|we|our|us|you|your|he|she|they|their|" +
  "mujhe|mera|meri|mere|hum|hamara|apna|apni|apne|tera|teri|tere|" +
  // Real Action Verbs & Decision Predicates (strictly verbs/actions, no static nouns)
  "switch|switching|switched|resign|resigning|resigned|quit|quitting|stay|staying|stayed|leave|leaving|left|join|joining|joined|accept|accepting|accepted|negotiate|negotiating|negotiated|promote|promoting|promoted|apply|applying|applied|hire|hiring|interview|interviewing|upskill|upskilling|" +
  "invest|investing|invested|buy|buying|bought|sell|selling|sold|save|saving|saved|prepay|prepaying|prepaid|deposit|depositing|withdraw|withdrawing|spend|spending|spent|calculate|calculating|opt|opting|opted|allocate|allocating|" +
  "file|filing|filed|draft|drafting|drafted|send|sending|sent|sue|suing|sued|evict|evicting|evicted|dispute|disputing|disputed|claim|claiming|claimed|terminate|terminating|terminated|sign|signing|signed|complain|complaining|" +
  "manage|managing|managed|cure|curing|cured|prevent|preventing|prevented|treat|treating|treated|improve|improving|improved|reduce|reducing|reduced|cope|coping|exercise|exercising|sleep|sleeping|slept|relax|relaxing|heal|healing|meditate|meditating|" +
  "choose|choosing|chose|chosen|select|selecting|selected|decide|deciding|decided|compare|comparing|compared|plan|planning|planned|evaluate|evaluating|evaluated|recommend|recommending|suggest|suggesting|advise|advising|need|needing|needed|want|wanting|wanted|look|looking|looked|help|helping|helped|guide|guiding|guided|tell|telling|told|explain|explaining|explained|think|thinking|thought|feel|feeling|felt|" +
  "karna|karein|karun|kare|karte|karti|karta|chahiye|raha|rahi|rahe|gaya|gayi|gaye|hoga|hogi|hoge|hona|badal|badalna|chhod|chhodna|lu|le|lena|dena|diya|de|batao|bataiye|samjhao|samjhaiye|lagta|lagti|lagte|soch|sochna|hai|hain|tha|thi|the" +
  ")\\b|\\?",
  "i"
);

export const hasSentenceStructure = (text) => {
  return SENTENCE_PREDICATE_REGEX.test(text);
};

const PRESCRIPTION_REGEX = new RegExp(
  "\\b(kaunsi|kounsi|which|what)\\s+(dawai|dawa|medicine|medicines|tablet|tablets|drug|drugs|dosage)\\b|" +
  "\\b(dawai|dawa|medicine|medicines|tablet|tablets|drug|drugs)\\s+(leni|lena|khani|khana|suggest|prescribe|recommend)\\b|" +
  "\\b(suggest|prescribe|recommend)\\s+(me\\s+)?(a\\s+)?(medicine|drug|tablet)\\b",
  "i"
);

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

  // Check clinical / medical prescription request
  if (PRESCRIPTION_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: "AI decision system cannot prescribe medicines or drugs (dawai). For medical prescriptions or clinical diagnosis, please consult a qualified doctor or physician.",
    };
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

  // Check sentence structure / predicate presence (blocks word salads like 'career bad good happy nice')
  if (!hasSentenceStructure(trimmed)) {
    return {
      valid: false,
      error: "Please enter a complete, meaningful sentence or question (e.g., 'Should I switch jobs for higher pay?' or 'How should I invest between mutual funds and FD?').",
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

  // Check if query matches any OTHER domain
  const otherDomains = Object.values(DOMAINS).filter(
    (d) => d.key.toLowerCase() !== domain.toLowerCase()
  );
  const otherMatch = otherDomains.find((d) =>
    d.keywords.some((kw) => normalized.includes(kw))
  );

  // If another domain matches and current domain has NO matches, reject as domain mismatch
  if (otherMatch && !domainHit) {
    return false;
  }

  return true;
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
  "Validating decision query & security guard...",
  "Searching domain knowledge base & guidelines...",
  "Formulating targeted clarifying options with AI...",
  "Analyzing your answers & trade-offs...",
  "Synthesizing scenario simulations & risk matrices...",
  "Finalizing decision recommendation & action plan...",
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
