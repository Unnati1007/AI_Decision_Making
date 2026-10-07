# ============================================================
# IntelliChoice — Multi-Turn RAG Pipeline (Turn 1 & Turn 2)
# ============================================================

import os
import json
import logging
import httpx
from typing import Dict, Any, List, Optional
from openai import OpenAI

from backend.config import LLM_MODEL_NAME
from backend.services.guard import guard_pipeline, GuardResult
from backend.services.domain_router import detect_domain
from backend.retrieval.retriever import retrieve_context

logger = logging.getLogger("intellichoice.rag_pipeline")

openai_api_key = os.getenv("OPENAI_API_KEY")
llm_client = OpenAI(api_key=openai_api_key, http_client=httpx.Client()) if openai_api_key else None


# ── Domain Fallback MCQs for Turn 1 ─────────────────────────
DEFAULT_DOMAIN_MCQS = {
    "career": [
        {
            "id": "q1",
            "question": "What is your current career stage?",
            "options": ["Student / Fresh Graduate", "Early Career (1-3 yrs)", "Mid-Career (4-8 yrs)", "Senior / Executive (9+ yrs)"]
        },
        {
            "id": "q2",
            "question": "What is your primary priority in this career decision?",
            "options": ["Higher Salary & Benefits", "Work-Life Balance", "Skill Development & Fast Growth", "Job Security & Stability"]
        },
        {
            "id": "q3",
            "question": "What is your timeline for executing this decision?",
            "options": ["Immediately (within 1 month)", "Short term (1-3 months)", "Medium term (3-6 months)", "Long term (6+ months)"]
        }
    ],
    "finance": [
        {
            "id": "q1",
            "question": "What is your primary investment / financial horizon?",
            "options": ["Short-term (< 1 year)", "Medium-term (1-5 years)", "Long-term (5+ years)", "Emergency liquidity (Immediate)"]
        },
        {
            "id": "q2",
            "question": "What is your risk tolerance for this decision?",
            "options": ["Conservative (Capital preservation priority)", "Moderate (Balanced growth)", "Aggressive (High growth/high risk)"]
        },
        {
            "id": "q3",
            "question": "What proportion of your liquid savings does this decision impact?",
            "options": ["Less than 10%", "10% to 30%", "30% to 60%", "More than 60%"]
        }
    ],
    "legal": [
        {
            "id": "q1",
            "question": "What jurisdiction / region does this legal matter pertain to?",
            "options": ["India / Indian Union Law", "United States (Federal/State)", "European Union", "Other / General Legal Principles"]
        },
        {
            "id": "q2",
            "question": "What is the primary objective of your legal inquiry?",
            "options": ["Preventative (Contract/Agreement drafting)", "Dispute resolution / Litigation", "Compliance & Regulatory alignment", "Property / Inheritance structuring"]
        },
        {
            "id": "q3",
            "question": "Are formal legal proceedings or documents currently active?",
            "options": ["No, early information gathering phase", "Yes, active notices / court filings present", "Under negotiation / pre-notice phase"]
        }
    ],
    "wellbeing": [
        {
            "id": "q1",
            "question": "What is your primary health & wellbeing focus area?",
            "options": ["Physical fitness & exercise routines", "Nutritional balance & diet management", "Ergonomics & posture optimization", "Mental wellness & anxiety management"]
        },
        {
            "id": "q2",
            "question": "How much time per week can you consistently commit to this goal?",
            "options": ["Less than 2 hours/week", "2-5 hours/week", "5-10 hours/week", "10+ hours/week"]
        },
        {
            "id": "q3",
            "question": "Do you have any existing physical conditions or medical advice to account for?",
            "options": ["No existing conditions", "Minor joint / back discomfort", "Active medical treatment / guidance", "Chronic condition needing customization"]
        }
    ]
}


# ============================================================
# TURN 1 — MCQ Generation Pipeline
# ============================================================
def execute_turn_1(query: str, domain_override: Optional[str] = None) -> Dict[str, Any]:
    """
    Executes Guard Check, Domain Detection, RAG Context Retrieval,
    and Turn 1 LLM MCQ Generation.
    """
    # Step 1: Guard Pipeline Check
    guard_res: GuardResult = guard_pipeline(query)
    if not guard_res.passed:
        return {
            "success": False,
            "error_layer": guard_res.layer,
            "message": guard_res.message,
            "reason": guard_res.reason
        }

    # Step 2: Domain Detection
    domain = domain_override or detect_domain(query)
    if domain not in DEFAULT_DOMAIN_MCQS:
        domain = "career" # Safe default fallback

    # Step 3: RAG Retrieval
    rag_context, sources, raw_results = retrieve_context(query, domain=domain, top_k=5, max_token_budget=1800)

    # Step 4: Turn 1 LLM Generation (Clarifying MCQs)
    mcqs = None
    warning = guard_res.warning

    if llm_client:
        prompt = f"""You are an AI Decision Advisor for the '{domain.title()}' domain.
Analyze the user's query and the retrieved reference context below.
Generate 3 to 4 targeted Multiple-Choice Questions (MCQs) that collect crucial missing parameters (budget, timeline, risk, goal, constraints) to provide a personalized decision recommendation.

User Query: "{query}"

Retrieved Context:
{rag_context[:3000]}

Return strictly a valid JSON object matching this exact schema:
{{
  "questions": [
    {{
      "id": "q1",
      "question": "Clear question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"]
    }}
  ]
}}
Do NOT output markdown formatting or backticks, return ONLY valid raw JSON."""

        try:
            response = llm_client.chat.completions.create(
                model=LLM_MODEL_NAME,
                messages=[
                    {"role": "system", "content": "You are a precise decision intelligence generator that responds strictly in valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            raw_json = response.choices[0].message.content
            parsed = json.loads(raw_json)
            if "questions" in parsed and isinstance(parsed["questions"], list) and len(parsed["questions"]) > 0:
                mcqs = parsed["questions"]
        except Exception as e:
            logger.warning(f"Turn 1 LLM call failed or quota exceeded ({e}). Using rule-based fallback MCQs.")
            warning = f"Turn 1 LLM skipped ({str(e)}). Serving dynamic domain-matched questions."

    if not mcqs:
        mcqs = DEFAULT_DOMAIN_MCQS.get(domain, DEFAULT_DOMAIN_MCQS["career"])

    return {
        "success": True,
        "query": query,
        "domain": domain,
        "mcqs": mcqs,
        "sources": sources,
        "warning": warning
    }


# ============================================================
# TURN 2 — Decision Support Generation Pipeline
# ============================================================
def execute_turn_2(
    query: str,
    domain: str,
    mcq_answers: List[Dict[str, Any]],
    context_sources: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Executes Turn 2 Decision Support Generation combining user query,
    domain RAG context, and user MCQ answers.
    """
    # Step 1: Re-retrieve RAG Context
    rag_context, sources, _ = retrieve_context(query, domain=domain, top_k=5, max_token_budget=1800)
    if context_sources:
        # Merge sources preserving uniqueness
        seen = {s["title"] for s in sources}
        for s in context_sources:
            if s.get("title") not in seen:
                sources.append(s)
                seen.add(s["title"])

    formatted_answers = ""
    for ans in mcq_answers:
        q_text = ans.get("question", ans.get("id", "Question"))
        a_text = ans.get("selected_option", ans.get("answer", "Not specified"))
        formatted_answers += f"- {q_text}: {a_text}\n"

    warning = None

    if llm_client:
        prompt = f"""You are IntelliChoice, a world-class Decision Support AI.
Synthesize a structured, actionable decision recommendation based on the user's query, their specific context/preferences, and retrieved knowledge context.

User Original Query: "{query}"
Target Domain: {domain.title()}

User Context & MCQ Choices:
{formatted_answers}

Retrieved Knowledge Context:
{rag_context[:4000]}

Format your response as a valid JSON object with the following schema:
{{
  "executive_summary": "Core recommendation statement in 2-3 sentences.",
  "tradeoffs": [
    {{"aspect": "Pros / Advantages", "details": "Key benefit description"}},
    {{"aspect": "Cons / Risks", "details": "Key risk or cost description"}}
  ],
  "action_plan": [
    {{"step": 1, "title": "Step title", "description": "Actionable detail"}}
  ],
  "scenario_simulation": {{
    "baseline_case": "Expected outcome",
    "best_case": "Optimistic outcome",
    "worst_case": "Pessimistic risk mitigation"
  }}
}}
Return ONLY valid JSON without markdown formatting."""

        try:
            response = llm_client.chat.completions.create(
                model=LLM_MODEL_NAME,
                messages=[
                    {"role": "system", "content": "You are a expert decision engine responding in JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.4,
                response_format={"type": "json_object"}
            )
            raw_json = response.choices[0].message.content
            decision_payload = json.loads(raw_json)

            return {
                "success": True,
                "query": query,
                "domain": domain,
                "decision": decision_payload,
                "sources": sources,
                "warning": warning
            }
        except Exception as e:
            logger.warning(f"Turn 2 LLM call failed ({e}). Generating rule-based synthesis.")
            warning = f"Turn 2 LLM skipped ({str(e)}). Generated fallback decision structure."

    # Rule-Based Fallback Decision Generator if LLM unavailable
    fallback_decision = {
        "executive_summary": f"Based on your inquiry regarding '{query}' in the {domain.title()} domain and your selected preferences ({', '.join([a.get('selected_option', '') for a in mcq_answers[:2]])}), we recommend a structured, phased implementation prioritizing risk mitigation.",
        "tradeoffs": [
            {"aspect": "Primary Advantage", "details": f"Aligns with your preference: {mcq_answers[0].get('selected_option', 'default preference') if mcq_answers else 'structured roadmap'}."},
            {"aspect": "Consideration / Risk", "details": "Requires consistent monitoring and periodic re-evaluation based on changing context."}
        ],
        "action_plan": [
            {"step": 1, "title": "Assessment & Baseline Setup", "description": f"Gather initial data and establish metrics aligned with {query}."},
            {"step": 2, "title": "Phased Execution", "description": "Implement initial phase with minimum capital/time commitment to validate assumptions."},
            {"step": 3, "title": "Review & Scale", "description": "Assess results against initial targets after 30-60 days."}
        ],
        "scenario_simulation": {
            "baseline_case": "Steady progress achieving 80-90% of target objectives over specified timeline.",
            "best_case": "Accelerated results exceeding performance expectations with minimal friction.",
            "worst_case": "Minor delays requiring adjustment of timeline, fully protected by initial risk buffers."
        }
    }

    return {
        "success": True,
        "query": query,
        "domain": domain,
        "decision": fallback_decision,
        "sources": sources,
        "warning": warning
    }