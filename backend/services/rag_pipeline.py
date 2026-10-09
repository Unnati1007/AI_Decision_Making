# ============================================================
# IntelliChoice — Multi-Turn RAG Pipeline (Turn 1 & Turn 2)
# ============================================================

import os
import json
import logging
import httpx
from typing import Dict, Any, List, Optional, Tuple
from openai import OpenAI

from backend.config import (
    LLM_MODEL_NAME,
    TOP_K_DEFAULT,
    MAX_TOKEN_BUDGET,
    MAX_CHUNKS_PER_FILE,
    RELEVANCE_THRESHOLD,
    TAVILY_API_KEY
)
from backend.services.guard import guard_pipeline, GuardResult
from backend.services.domain_router import detect_domain
from backend.retrieval.retriever import retrieve_context

from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)
load_dotenv(override=True)

logger = logging.getLogger("intellichoice.rag_pipeline")

def get_llm_client() -> Tuple[Optional[OpenAI], str]:
    env_path = Path(__file__).resolve().parent.parent / ".env"
    load_dotenv(dotenv_path=env_path, override=True)
    load_dotenv(override=True)
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    openai_key = os.getenv("OPENAI_API_KEY", "").strip()
    model_env = os.getenv("LLM_MODEL_NAME", "").strip()
    
    if gemini_key:
        model = model_env if (model_env and "gpt" not in model_env) else "gemini-3.5-flash-lite"
        return OpenAI(
            api_key=gemini_key,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
            http_client=httpx.Client()
        ), model
    elif openai_key:
        model = model_env if model_env else "gpt-4o-mini"
        return OpenAI(api_key=openai_key, http_client=httpx.Client()), model
    return None, "gpt-4o-mini"


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
        domain = "career"

    # Step 3: RAG Retrieval
    rag_context, sources, raw_results = retrieve_context(query, domain=domain, top_k=TOP_K_DEFAULT, max_token_budget=MAX_TOKEN_BUDGET)

    # Check relevance threshold (Placeholder: RELEVANCE_THRESHOLD = 0.20)
    best_score = raw_results[0][2] if raw_results else 0.0
    if best_score < RELEVANCE_THRESHOLD and not any(s.get("source") == "Tavily Live Web Search" for s in sources):
        logger.info(f"Turn 1 query low relevance score ({best_score:.4f} < {RELEVANCE_THRESHOLD}). Skipping LLM call.")
        return {
            "success": True,
            "query": query,
            "domain": domain,
            "mcqs": DEFAULT_DOMAIN_MCQS.get(domain, DEFAULT_DOMAIN_MCQS["career"]),
            "sources": sources,
            "raw_results": raw_results,
            "low_relevance": True,
            "warning": "Low relevance score in Knowledge Base."
        }

    # Step 4: Turn 1 LLM Generation (Clarifying MCQs)
    mcqs = None
    warning = guard_res.warning

    llm_client, active_model = get_llm_client()
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
                model=active_model,
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

    llm_was_called = bool(llm_client and mcqs and warning is None)
    return {
        "success": True,
        "query": query,
        "domain": domain,
        "mcqs": mcqs,
        "sources": sources,
        "raw_results": raw_results,
        "llm_called": llm_was_called,
        "mode": "llm_generated" if llm_was_called else "template_fallback",
        "warning": warning
    }


# ============================================================
# TURN 2 — Decision Support Generation Pipeline
# ============================================================
def execute_turn_2(
    query: str,
    domain: str,
    mcq_answers: List[Dict[str, Any]],
    turn1_raw_results: Optional[List[Tuple[str, Dict[str, Any], float]]] = None
) -> Dict[str, Any]:
    """
    Executes Turn 2 Decision Support Generation:
    Reuses Turn 1 chunks/results + retrieves fresh context for combined query,
    merges, dedupes by chunk text, caps at TOP_K_DEFAULT * 2, and enforces MAX_CHUNKS_PER_FILE.
    """
    # Step 1: Build combined Turn 2 query
    ans_summary = " ".join([f"{a.get('question', a.get('id', ''))}: {a.get('selected_option', a.get('answer', ''))}" for a in mcq_answers])
    turn2_query = f"{query} {ans_summary}".strip()

    # Step 2: Fresh RAG retrieval for combined query
    rag_context_t2, sources_t2, raw_results_t2 = retrieve_context(
        turn2_query,
        domain=domain,
        top_k=TOP_K_DEFAULT * 2,
        max_token_budget=MAX_TOKEN_BUDGET
    )

    # Merge Turn 1 and Turn 2 results
    combined_results = list(raw_results_t2)
    if turn1_raw_results:
        combined_results.extend(turn1_raw_results)

    # Deduplicate by chunk text
    seen_chunks = set()
    deduped_results: List[Tuple[str, Dict[str, Any], float]] = []
    for chunk_text, meta, score in combined_results:
        chunk_key = chunk_text.strip()
        if chunk_key not in seen_chunks:
            seen_chunks.add(chunk_key)
            deduped_results.append((chunk_text, meta, score))

    # Cap at TOP_K_DEFAULT * 2
    deduped_results = deduped_results[:TOP_K_DEFAULT * 2]

    # Filter with MAX_CHUNKS_PER_FILE limit (max 2 chunks per file)
    final_results: List[Tuple[str, Dict[str, Any], float]] = []
    file_chunk_counts: Dict[str, int] = {}

    for chunk_text, meta, score in deduped_results:
        source_file = meta.get("source_file", meta.get("title", "unknown"))
        count = file_chunk_counts.get(source_file, 0)
        if count >= MAX_CHUNKS_PER_FILE:
            continue
        file_chunk_counts[source_file] = count + 1
        final_results.append((chunk_text, meta, score))

    # Assemble final context and sources (Rule B4: title only if url empty)
    context_chunks: List[str] = []
    sources: List[Dict[str, Any]] = []
    seen_sources = set()

    for idx, (chunk_text, meta, score) in enumerate(final_results, 1):
        source_name = meta.get("source", "Unknown Document")
        title = meta.get("title", source_name)
        url = meta.get("url", "").strip()
        doc_domain = meta.get("domain", "")

        header = f"[Source {idx}: {title} | Domain: {doc_domain}]"
        context_chunks.append(f"{header}\n{chunk_text}\n")

        source_key = (title, url)
        if source_key not in seen_sources:
            seen_sources.add(source_key)
            src_item = {
                "id": f"Source-{len(sources)+1}",
                "title": title,
                "domain": doc_domain,
                "similarity_score": round(score, 4)
            }
            if url:
                src_item["url"] = url
                src_item["source"] = source_name
            sources.append(src_item)

    final_context = "\n---\n".join(context_chunks)
    best_score = final_results[0][2] if final_results else 0.0

    # Rule B3: Low score handling (< RELEVANCE_THRESHOLD)
    if best_score < RELEVANCE_THRESHOLD and not any(s.get("source") == "Tavily Live Web Search" for s in sources):
        logger.info(f"Turn 2 best score ({best_score:.4f}) < threshold ({RELEVANCE_THRESHOLD}). Returning no-answer payload without calling LLM.")
        no_answer_decision = {
            "executive_summary": "I do not have enough relevant information in the knowledge base to answer this query confidently.",
            "tradeoffs": [],
            "action_plan": [],
            "scenario_simulation": {
                "baseline_case": "Insufficient information to project baseline outcome.",
                "best_case": "Insufficient information to project optimistic outcome.",
                "worst_case": "Insufficient information to project risk mitigation."
            }
        }
        return {
            "success": True,
            "query": query,
            "domain": domain,
            "decision": no_answer_decision,
            "sources": sources,
            "llm_called": False,
            "warning": "Low relevance score in Knowledge Base. LLM call skipped."
        }

    formatted_answers = ""
    for ans in mcq_answers:
        q_text = ans.get("question", ans.get("id", "Question"))
        a_text = ans.get("selected_option", ans.get("answer", "Not specified"))
        formatted_answers += f"- {q_text}: {a_text}\n"

    warning = None
    llm_called = False

    llm_client, active_model = get_llm_client()
    if llm_client:
        llm_called = True
        prompt = f"""You are IntelliChoice, a world-class Decision Support AI.
Synthesize a structured, actionable decision recommendation based on the user's query, their specific context/preferences, and retrieved knowledge context.

User Original Query: "{query}"
Target Domain: {domain.title()}

User Context & MCQ Choices:
{formatted_answers}

Retrieved Knowledge Context:
{final_context[:4000]}

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
CRITICAL RULE (B5): Do NOT invent numerical figures or percentages in the scenario simulation or trade-offs. Use qualitative descriptions unless exact figures are explicitly present in the retrieved context.
Return ONLY valid JSON without markdown formatting."""

        try:
            response = llm_client.chat.completions.create(
                model=active_model,
                messages=[
                    {"role": "system", "content": "You are an expert decision engine responding in JSON. Use only facts present in the provided context. If the context does not contain a law, number, rate, section or time limit, say 'not in the knowledge base, check the official source' instead of stating it. Never state legal limits, tax exemption amounts or formulas from memory. Reflect the user's MCQ answers in the decision."},
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
                "llm_called": True,
                "mode": "llm_generated",
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
            "baseline_case": "Steady progress achieving qualitative target objectives over specified timeline.",
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
        "llm_called": False,
        "mode": "template_fallback",
        "warning": warning
    }