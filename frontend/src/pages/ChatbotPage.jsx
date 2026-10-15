import { useState, useRef, useEffect } from "react";
import { Send, Brain, AlertCircle, Loader2, Sparkles, ChevronRight, User, Bot, CheckCircle2, ListFilter, HeartHandshake, RotateCcw, Lock, ExternalLink, FileText, X, BookOpen } from "lucide-react";
import { useApp } from "../context/AppContext";
import { validateQuery, matchQueryToDomain, thinkingSteps, isGibberish } from "../utils/aiUtils";
import { DOMAINS } from "../data/dummyData";
import { cn } from "../lib/utils";

export default function ChatPage() {
  const { currentUser, addArchiveEntry } = useApp();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [mcqFlow, setMcqFlow] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);
  const [sourceLoading, setSourceLoading] = useState(false);
  const [sourceContent, setSourceContent] = useState("");
  
  const isMcqActive = Boolean(mcqFlow);
  const isInputLocked = isThinking || isMcqActive;
  
  const messagesEndRef = useRef(null);
  const domain = currentUser?.domain;
  const domainInfo = DOMAINS[domain];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking, thinkingStep]);

  const handleSend = async (text = input) => {
    const query = text.trim();
    if (!query || isInputLocked) return;

    // Add user message
    const userMsg = { id: Date.now(), role: "user", text: query, type: "text" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Validation
    const validation = validateQuery(query, domain);
    if (!validation.valid) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "assistant",
            text: validation.error,
            type: "error",
          },
        ]);
      }, 600);
      return;
    }

    // AI Thinking Sequence
    setIsThinking(true);
    setThinkingStep(0);

    const stepInterval = setInterval(() => {
      setThinkingStep((prev) => (prev < 2 ? prev + 1 : prev));
    }, 1100);

    try {
      const res = await fetch("/api/query/turn1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          domain: domain ? domain.toLowerCase() : null,
          session_id: sessionId
        }),
      });
      clearInterval(stepInterval);
      setIsThinking(false);
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.detail || errJson?.message || "Turn 1 request failed");
      }
      const data = await res.json();
      if (data.session_id) {
        setSessionId(data.session_id);
      }

      if (data.is_crisis) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 2,
            role: "assistant",
            type: "crisis",
            text: data.message,
          },
        ]);
        return;
      }

      if (data.success === false) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 2,
            role: "assistant",
            type: "error",
            text: data.message || "Please enter a specific decision question or problem.",
          },
        ]);
        return;
      }

      if (data.mcqs && data.mcqs.length > 0) {
        const flowId = Date.now();
        const responseMode = data.mode || (data.llm_called ? "llm_generated" : "template_fallback");
        setMcqFlow({
          originalQuery: query,
          domain: data.domain || domain || "career",
          questions: data.mcqs,
          currentIndex: 0,
          answers: [],
          sources: data.sources || [],
          flowId,
          mode: responseMode,
          llm_called: Boolean(data.llm_called),
        });

        const firstQ = data.mcqs[0];
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 2,
            role: "assistant",
            type: "mcq",
            question: firstQ.question || firstQ.q,
            options: firstQ.options,
            flowId,
            mode: responseMode,
            llm_called: Boolean(data.llm_called),
          },
        ]);
        return;
      }
    } catch (err) {
      clearInterval(stepInterval);
      setIsThinking(false);
      console.error("Backend Turn 1 connection error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          role: "assistant",
          type: "error",
          text: err.message && err.message !== "Turn 1 request failed"
            ? err.message
            : "Unable to connect to the backend server. Please verify the server is running and try again.",
        },
      ]);
    }
  };

  const handleOpenSource = async (resource) => {
    setSelectedSource(resource);
    setSourceLoading(true);
    setSourceContent("");
    try {
      const params = new URLSearchParams();
      if (resource.source_file) params.append("path", resource.source_file);
      if (resource.title) params.append("title", resource.title);
      const res = await fetch(`/api/query/source-document?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSourceContent(data.content || "No document content available.");
        if (data.url && (!resource.url || resource.url === "#")) {
          setSelectedSource((prev) => ({ ...prev, url: data.url }));
        }
      } else {
        setSourceContent(
          resource.url && resource.url.startsWith("http")
            ? `External reference resource: ${resource.url}\n\nYou can access the full publication directly via the button above.`
            : "Reference framework content could not be loaded."
        );
      }
    } catch (e) {
      console.warn("Error fetching source document:", e);
      setSourceContent(
        resource.url && resource.url.startsWith("http")
          ? `External reference resource: ${resource.url}\n\nYou can access the full publication directly via the button above.`
          : "Reference framework content could not be loaded."
      );
    } finally {
      setSourceLoading(false);
    }
  };

  const showRecommendationFromTurn2 = (data, query) => {
    const decision = data.decision || {};
    const formattedResponse = {
      mode: data.mode || (data.llm_called ? "llm_generated" : "template_fallback"),
      llm_called: Boolean(data.llm_called),
      recommendation: decision.executive_summary || "Recommended Decision Path",
      reasoning: decision.tradeoffs ? (Array.isArray(decision.tradeoffs) ? decision.tradeoffs.map(t => typeof t === 'object' ? `${t.aspect || ''}: ${t.details || ''}` : str(t)) : [String(decision.tradeoffs)]) : [],
      risks: decision.scenario_simulation?.worst_case ? [decision.scenario_simulation.worst_case] : [],
      simulation: {
        best_case: decision.scenario_simulation?.best_case || "",
        timeline: decision.scenario_simulation?.baseline_case || "",
      },
      actionPlan: decision.action_plan || [],
      resources: (data.sources || []).map((s) => ({
        title: s.title || s.id,
        url: s.url && s.url !== "#" ? s.url : "",
        source_file: s.source_file || "",
        domain: s.domain || domain || "career",
        source_type: s.source_type || "ai_curated",
      })),
    };

    const assistantMsg = {
      id: Date.now() + 2,
      role: "assistant",
      type: "response",
      ...formattedResponse,
    };
    setMessages((prev) => [...prev, assistantMsg]);

    addArchiveEntry({
      query,
      domain: data.domain || domain,
      response: formattedResponse,
    });
  };

  const handleMCQAnswer = async (msgId, optionText) => {
    // Mark as answered
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, answered: true, selectedOption: optionText } : m))
    );

    // Add user's answer
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: "user",
        type: "text",
        text: optionText,
      },
    ]);

    if (!mcqFlow) return;

    const currentQ = mcqFlow.questions[mcqFlow.currentIndex];
    const newAnswers = [
      ...(mcqFlow.answers || []),
      { question: currentQ.question || currentQ.q, selected_option: optionText },
    ];

    const nextIndex = mcqFlow.currentIndex + 1;

    if (nextIndex < mcqFlow.questions.length) {
      // Show thinking indicator between questions for seamless feedback
      setIsThinking(true);
      setThinkingStep(2);
      setMcqFlow((prev) => ({ ...prev, currentIndex: nextIndex, answers: newAnswers }));
      const nextQ = mcqFlow.questions[nextIndex];

      setTimeout(() => {
        setIsThinking(false);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            role: "assistant",
            type: "mcq",
            question: nextQ.question || nextQ.q,
            options: nextQ.options,
            flowId: mcqFlow.flowId,
            mode: mcqFlow.mode,
            llm_called: mcqFlow.llm_called,
          },
        ]);
      }, 450);
    } else {
      // Finished all questions, call Turn 2 API
      const activeFlow = { ...mcqFlow, answers: newAnswers };
      setMcqFlow(null);
      setIsThinking(true);
      setThinkingStep(3);

      const turn2Interval = setInterval(() => {
        setThinkingStep((prev) => (prev < 5 ? prev + 1 : prev));
      }, 1400);

      try {
        const res = await fetch("/api/query/turn2", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: activeFlow.originalQuery,
            domain: activeFlow.domain || (domain ? domain.toLowerCase() : "career"),
            mcq_answers: newAnswers,
            session_id: sessionId
          }),
        });
        clearInterval(turn2Interval);
        setIsThinking(false);
        if (!res.ok) {
          const errJson = await res.json().catch(() => null);
          throw new Error(errJson?.detail || errJson?.message || "Turn 2 request failed");
        }
        const data = await res.json();
        if (data.session_id) {
          setSessionId(data.session_id);
        }

        if (data.is_crisis) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 2,
              role: "assistant",
              type: "crisis",
              text: data.message,
            },
          ]);
          return;
        }

        if (data.decision) {
          showRecommendationFromTurn2(data, activeFlow.originalQuery);
          return;
        }
      } catch (err) {
        clearInterval(turn2Interval);
        setIsThinking(false);
        console.error("Backend Turn 2 connection error:", err);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 2,
            role: "assistant",
            type: "error",
            text: err.message && err.message !== "Turn 2 request failed"
              ? err.message
              : "Unable to connect to the backend server. Please verify the server is running and try again.",
          },
        ]);
      }
    }
  };

  const handleResetDecision = async () => {
    if (sessionId) {
      try {
        await fetch(`/api/query/session/${sessionId}`, { method: "DELETE" });
      } catch (e) {
        console.warn("Session reset failed:", e);
      }
    }
    setSessionId(null);
    setMessages([]);
    setMcqFlow(null);
    setInput("");
  };

  return (
    <div className="flex h-[calc(100vh-80px)] flex-col bg-[var(--bg)] animate-fade-up">
      {/* Domain Header */}
      <div className="border-b border-[var(--border)] bg-[var(--surface)] px-6 py-2.5 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-${domainInfo?.color || 'blue'}-50 dark:bg-${domainInfo?.color || 'blue'}-500/10 text-${domainInfo?.color || 'blue'}-600 dark:text-${domainInfo?.color || 'blue'}-400`}>
            <Brain size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold leading-tight" style={{ color: "var(--text)" }}>AI {domainInfo?.label || "Decision"} Agent</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">System Ready</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {sessionId && (
            <button
              onClick={handleResetDecision}
              title="Start a new decision thread"
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1 text-xs font-semibold text-[var(--text-muted)] hover:text-blue-600 hover:border-blue-500/30 transition-all cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>New Decision</span>
            </button>
          )}
          <div className="hidden sm:flex items-center gap-2 rounded-lg bg-[var(--surface-2)] px-3 py-1.5">
              <ListFilter size={14} className="text-[var(--text-soft)]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Locked Domain: {domain || "General"}</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 max-w-4xl mx-auto">
             <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                <Sparkles size={28} />
             </div>
             <div className="space-y-1">
                <h3 className="text-lg font-bold" style={{ color: "var(--text)" }}>Knowledge Engine Active</h3>
                <p className="text-xs font-medium leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  I'm ready to assist with your <span className="font-bold text-blue-600">{domainInfo?.label}</span> decisions. Please describe your situation in detail.
                </p>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full pt-2">
                {domain === "Career" && (
                  <>
                    <button onClick={() => setInput("Should I pursue an MBA now or wait for 2 years?")} className="text-[10px] font-bold p-3 card hover:bg-[var(--surface-2)] text-left transition-colors border-dashed bg-transparent">"Should I pursue an MBA now or wait for 2 years?"</button>
                    <button onClick={() => setInput("Startup vs Corporate: which is better for skill growth?")} className="text-[10px] font-bold p-3 card hover:bg-[var(--surface-2)] text-left transition-colors border-dashed bg-transparent">"Startup vs Corporate: which is better for skill growth?"</button>
                    <button onClick={() => setInput("How do I transition from engineering to product management?")} className="text-[10px] font-bold p-3 card hover:bg-[var(--surface-2)] text-left transition-colors border-dashed bg-transparent">"How do I transition from engineering to product management?"</button>
                  </>
                )}
                {domain === "Finance" && (
                  <>
                    <button onClick={() => setInput("How should I diversify my portfolio for long term wealth?")} className="text-[10px] font-bold p-3 card hover:bg-[var(--surface-2)] text-left transition-colors border-dashed bg-transparent">"How should I diversify my portfolio for long term wealth?"</button>
                    <button onClick={() => setInput("Is it better to buy a house or continue renting in the current market?")} className="text-[10px] font-bold p-3 card hover:bg-[var(--surface-2)] text-left transition-colors border-dashed bg-transparent">"Is it better to buy a house or continue renting in the current market?"</button>
                    <button onClick={() => setInput("What are the best tax-saving investment options for salaried employees?")} className="text-[10px] font-bold p-3 card hover:bg-[var(--surface-2)] text-left transition-colors border-dashed bg-transparent">"What are the best tax-saving investment options for salaried employees?"</button>
                  </>
                )}
                {domain === "Legal" && (
                  <>
                    <button onClick={() => setInput("What are the legal steps to register a tech startup?")} className="text-[10px] font-bold p-3 card hover:bg-[var(--surface-2)] text-left transition-colors border-dashed bg-transparent">"What are the legal steps to register a tech startup?"</button>
                    <button onClick={() => setInput("How do I protect my intellectual property and source code?")} className="text-[10px] font-bold p-3 card hover:bg-[var(--surface-2)] text-left transition-colors border-dashed bg-transparent">"How do I protect my intellectual property and source code?"</button>
                    <button onClick={() => setInput("What clauses should I look out for in a co-founder agreement?")} className="text-[10px] font-bold p-3 card hover:bg-[var(--surface-2)] text-left transition-colors border-dashed bg-transparent">"What clauses should I look out for in a co-founder agreement?"</button>
                  </>
                )}
                {domain === "Wellbeing" && (
                  <>
                    <button onClick={() => setInput("How can I avoid burnout while working in a high-pressure tech job?")} className="text-[10px] font-bold p-3 card hover:bg-[var(--surface-2)] text-left transition-colors border-dashed bg-transparent">"How can I avoid burnout while working in a high-pressure tech job?"</button>
                    <button onClick={() => setInput("What are effective strategies for maintaining work-life balance while working remotely?")} className="text-[10px] font-bold p-3 card hover:bg-[var(--surface-2)] text-left transition-colors border-dashed bg-transparent">"What are effective strategies for maintaining work-life balance while working remotely?"</button>
                    <button onClick={() => setInput("How do I manage anxiety before an important performance review?")} className="text-[10px] font-bold p-3 card hover:bg-[var(--surface-2)] text-left transition-colors border-dashed bg-transparent">"How do I manage anxiety before an important performance review?"</button>
                  </>
                )}
             </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex w-full animate-fade-up", msg.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn("flex max-w-[85%] gap-4", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
              <div className={cn("flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-xl shadow-sm", 
                msg.role === "user" ? "bg-blue-600 text-white" : "bg-[var(--surface-2)] text-[var(--text-muted)]")}>
                {msg.role === "user" ? <User size={18} /> : <Brain size={18} />}
              </div>

              <div className="space-y-4">
                {msg.type === "text" && (
                   <div className={cn("rounded-2xl px-5 py-3 text-sm font-medium leading-relaxed shadow-sm",
                    msg.role === "user" ? "bg-blue-600 text-white" : "bg-[var(--surface)] border border-[var(--border)]")}>
                    {msg.text}
                  </div>
                )}

                {msg.type === "error" && (
                  <div className="rounded-2xl px-5 py-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex gap-3">
                    <AlertCircle size={18} className="text-amber-600 shrink-0" />
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">{msg.text}</p>
                  </div>
                )}

                {msg.type === "crisis" && (
                  <div className="rounded-2xl p-6 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm max-w-xl">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <HeartHandshake size={20} className="shrink-0" />
                      <span className="text-xs font-bold uppercase tracking-wider">Support & Compassion</span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed whitespace-pre-line text-[var(--text)]">
                      {msg.text}
                    </p>
                    <div className="pt-3 border-t border-[var(--border)] text-[10px] font-medium text-[var(--text-muted)]">
                      Disclaimer: This platform provides informational decision support only and cannot provide medical care or emergency crisis response.
                    </div>
                  </div>
                )}

                {msg.type === "response" && (
                  <div className="space-y-4">
                     {msg.mode === "template_fallback" && (
                       <div className="rounded-2xl px-5 py-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center gap-3">
                         <AlertCircle size={18} className="text-amber-600 shrink-0" />
                         <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                           Automated standard guidance applied (fallback template).
                         </p>
                       </div>
                     )}
                     <div className="card p-6 space-y-6">
                        <div className="space-y-2">
                           <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                              <Sparkles size={16} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Recommendation</span>
                           </div>
                           <p className="text-lg font-bold leading-tight" style={{ color: "var(--text)" }}>{msg.recommendation}</p>
                        </div>

                        {msg.reasoning && msg.reasoning.length > 0 && (
                          <div className="space-y-3">
                             <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-soft)]">Key Observations</h4>
                             <div className="space-y-2">
                                {msg.reasoning.map((r, i) => (
                                  <div key={i} className="flex gap-2 items-start text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                                     <CheckCircle2 size={14} className="mt-0.5 text-blue-500 shrink-0" />
                                     {r}
                                  </div>
                                ))}
                             </div>
                          </div>
                        )}

                        {(msg.risks.length > 0 || msg.simulation.best_case || msg.simulation.timeline) && (
                          <div className="grid sm:grid-cols-2 gap-4">
                             {msg.risks && msg.risks.length > 0 && (
                               <div className="rounded-xl bg-red-50 dark:bg-red-500/10 p-4 space-y-2">
                                  <h5 className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400">Risks Identified</h5>
                                  <ul className="space-y-1">
                                     {msg.risks.map((r, i) => (
                                       <li key={i} className="text-[11px] font-bold text-red-700/80 dark:text-red-400/80 flex items-center gap-1.5">• {r}</li>
                                     ))}
                                  </ul>
                               </div>
                             )}
                             {(msg.simulation.best_case || msg.simulation.timeline) && (
                                msg.simulation.best_case === "not in the knowledge base, check the official source" &&
                                msg.simulation.timeline === "not in the knowledge base, check the official source" ? (
                                  <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 p-4 space-y-1">
                                     <h5 className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Outcome Simulation</h5>
                                     <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                                       Outcome simulation details not in the knowledge base, check the official source.
                                     </p>
                                  </div>
                                ) : (
                                  <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 p-4 space-y-2">
                                     <h5 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Outcome Simulation</h5>
                                     {msg.simulation.best_case && (
                                       <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 leading-tight">
                                         <span className="opacity-60">Best:</span> {msg.simulation.best_case}
                                       </p>
                                     )}
                                     {msg.simulation.timeline && (
                                       <p className="text-[11px] font-bold opacity-70 text-emerald-700 dark:text-emerald-400">
                                         <span className="opacity-60">Timeline:</span> {msg.simulation.timeline}
                                       </p>
                                     )}
                                  </div>
                                )
                             )}
                          </div>
                        )}

                        {msg.resources && msg.resources.length > 0 && (
                            <div className="pt-5 border-t border-[var(--border)] mt-2">
                               <div className="flex items-center gap-2 mb-4">
                                  <div className="h-5 w-5 rounded-md bg-blue-600/10 text-blue-600 flex items-center justify-center">
                                     <ListFilter size={12} />
                                  </div>
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-soft)]">Sources & References</h4>
                               </div>
                               <div className="grid gap-3 sm:grid-cols-2">
                                  {msg.resources.map((resource, i) => {
                                     const hasExternalUrl = Boolean(resource.url && resource.url.startsWith("http"));
                                     return (
                                       <div 
                                         key={i} 
                                         onClick={() => handleOpenSource(resource)}
                                         className="group flex flex-col justify-between p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] hover:border-blue-500/40 hover:bg-[var(--surface)] transition-all duration-200 shadow-xs cursor-pointer"
                                       >
                                          <div>
                                             <div className="flex items-center justify-between gap-2 mb-1">
                                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:underline line-clamp-1">{resource.title}</span>
                                                {hasExternalUrl ? (
                                                   <a
                                                     href={resource.url}
                                                     target="_blank"
                                                     rel="noopener noreferrer"
                                                     onClick={(e) => e.stopPropagation()}
                                                     title="Open external website in new tab"
                                                     className="p-1 rounded-md text-[var(--text-soft)] hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                                                   >
                                                     <ExternalLink size={13} />
                                                   </a>
                                                ) : (
                                                   <ChevronRight size={14} className="text-[var(--text-soft)] group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                                                )}
                                             </div>
                                             <p className="text-[10px] text-[var(--text-muted)] line-clamp-1">
                                                {hasExternalUrl ? "Official Web Resource" : "Internal Decision Guide • Click to read"}
                                             </p>
                                          </div>
                                          <div className="flex items-center justify-between gap-2 pt-2 mt-2 border-t border-[var(--border)]/50">
                                             <span className="text-[9px] font-bold text-[var(--text-soft)] uppercase tracking-wider">
                                                {resource.domain || domain || "General"}
                                             </span>
                                             <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                                                {resource.source_type === "open_textbook" ? "Open textbook (NC-SA)" : resource.source_type === "official_gov" ? "Official" : resource.source_type === "wikipedia" ? "Wikipedia" : resource.source_type === "web_live" ? "Live web, unverified" : "Decision Framework"}
                                             </span>
                                          </div>
                                       </div>
                                     );
                                  })}
                               </div>
                            </div>
                         )}

                        <div className="pt-4 border-t border-[var(--border)] mt-4">
                           <p className="text-[11px] font-semibold text-[var(--text-muted)] italic">
                             This is an AI-generated decision recommendation, not formal legal, medical, or financial advice. Always verify statutory regulations, tax rates, and official terms with primary sources.
                           </p>
                        </div>
                     </div>
                  </div>
                )}

                {msg.type === "mcq" && (
                  <div className="space-y-4">
                     {msg.mode === "template_fallback" && (
                       <div className="rounded-2xl px-5 py-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center gap-3">
                         <AlertCircle size={18} className="text-amber-600 shrink-0" />
                         <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                           Automated standard guidance applied (fallback template).
                         </p>
                       </div>
                     )}
                     <div className="card p-6 space-y-4">
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                           <Brain size={16} />
                           <span className="text-[10px] font-black uppercase tracking-widest">Clarification Needed</span>
                        </div>
                        <p className="text-sm font-bold leading-tight" style={{ color: "var(--text)" }}>{msg.question}</p>
                        <div className="grid grid-cols-1 gap-2 pt-2">
                           {msg.options.map((opt, i) => (
                             <button 
                               key={i} 
                               onClick={() => !msg.answered && handleMCQAnswer(msg.id, opt)}
                               disabled={msg.answered}
                               className={cn(
                                 "text-xs font-semibold p-3 rounded-xl border text-left transition-all",
                                 msg.answered 
                                   ? msg.selectedOption === opt 
                                     ? "bg-blue-600 text-white border-blue-600" 
                                     : "bg-[var(--surface-2)] border-transparent opacity-50 text-[var(--text-muted)] cursor-not-allowed"
                                   : "bg-[var(--surface)] border-[var(--border)] hover:bg-[var(--surface-2)] hover:border-blue-500/30 text-[var(--text)] cursor-pointer"
                               )}
                             >
                               {opt}
                             </button>
                           ))}
                        </div>
                     </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex w-full justify-start animate-fade-up my-3">
            <div className="flex gap-3.5 max-w-lg items-start">
               <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 text-blue-500 shadow-sm shadow-blue-500/10">
                  <Brain size={18} className="animate-pulse" />
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                  </span>
               </div>
               <div className="flex flex-col gap-1.5">
                  <div className="bg-[var(--surface)] border border-blue-500/20 dark:border-blue-500/30 shadow-md shadow-blue-500/5 rounded-2xl px-5 py-3.5 flex items-center gap-3.5">
                     <Loader2 size={16} className="animate-spin text-blue-500 shrink-0" />
                     <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                           <Sparkles size={11} className="text-blue-500" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">
                             AI Decision Engine
                           </span>
                        </div>
                        <span className="text-xs font-semibold text-[var(--text)] transition-all duration-300">
                          {thinkingSteps[thinkingStep] || "Processing decision context..."}
                        </span>
                     </div>
                     <div className="flex gap-1 ml-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce"></span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}



        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-[var(--border)] bg-[var(--surface)] p-4 lg:px-8">
        {isMcqActive && (
          <div className="mx-auto max-w-4xl mb-3 flex items-center justify-between rounded-xl bg-blue-50/80 dark:bg-blue-500/10 border border-blue-200/70 dark:border-blue-500/20 py-2.5 px-4 text-xs text-blue-700 dark:text-blue-300 animate-fade-in shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600/10 dark:bg-blue-400/20 text-blue-600 dark:text-blue-400">
                <Lock size={13} />
              </span>
              <span className="font-semibold">
                Clarification in progress — Please select an option above to continue.
              </span>
            </div>
            {mcqFlow?.questions && (
              <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-500/20 px-2.5 py-1 rounded-md text-blue-700 dark:text-blue-300 shrink-0">
                Question {(mcqFlow?.currentIndex ?? 0) + 1} of {mcqFlow?.questions?.length || 1}
              </span>
            )}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!isInputLocked) handleSend();
          }}
          className="mx-auto max-w-4xl relative"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isMcqActive
                ? "Locked: Please select an option from the choices above..."
                : isThinking
                ? "AI is analyzing your decision context..."
                : `Ask about ${domainInfo?.label || 'anything'}...`
            }
            disabled={isInputLocked}
            readOnly={isInputLocked}
            className={cn(
              "input pr-12 h-12 bg-[var(--surface-2)] border-none focus:bg-[var(--surface)] focus:ring-2 focus:ring-blue-500/10 text-sm font-medium shadow-inner transition-all",
              isInputLocked && "opacity-60 cursor-not-allowed select-none bg-[var(--surface-2)]/80"
            )}
          />
          <button
            type="submit"
            disabled={!input.trim() || isInputLocked}
            title={isMcqActive ? "Text input locked during MCQ clarification" : undefined}
            className={cn(
              "absolute right-1.5 top-1.5 h-9 w-9 flex items-center justify-center rounded-lg transition-all",
              isMcqActive
                ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                : input.trim() && !isInputLocked
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:-rotate-12 cursor-pointer"
                : "text-[var(--text-soft)] cursor-not-allowed"
            )}
          >
            {isThinking ? (
              <Loader2 size={18} className="animate-spin" />
            ) : isMcqActive ? (
              <Lock size={16} />
            ) : (
              <Send size={18} />
            )}
          </button>
        </form>
        <p className="mt-2 text-center text-[9px] font-bold text-[var(--text-soft)] uppercase tracking-widest opacity-60">
           AI responses can vary. Always verify high-stakes decisions.
        </p>
        {domain?.toLowerCase() === "wellbeing" && (
          <p className="mt-1.5 text-center text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
            Disclaimer: This platform provides informational decision support only and is not a substitute for professional medical, psychological, or crisis healthcare services.
          </p>
        )}
      {/* Source Document Reader Modal */}
      {selectedSource && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedSource(null)}
        >
          <div 
            className="card max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-[var(--border)] overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-[var(--border)] flex items-start justify-between gap-3 bg-[var(--surface)]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600">
                    <BookOpen size={14} />
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {selectedSource.source_type === "open_textbook" ? "Open Textbook Reference" : "Knowledge Base Source"}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[var(--text)] leading-snug">
                  {selectedSource.title}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedSource(null)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* External URL Banner if available */}
            {selectedSource.url && selectedSource.url.startsWith("http") && (
              <div className="px-5 py-2.5 bg-blue-50/80 dark:bg-blue-500/10 border-b border-blue-200/50 dark:border-blue-500/20 flex items-center justify-between gap-3">
                <span className="text-xs text-blue-700 dark:text-blue-300 font-medium truncate">
                  External URL: {selectedSource.url}
                </span>
                <a
                  href={selectedSource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shrink-0"
                >
                  <span>Visit Website</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            )}

            {/* Document Content */}
            <div className="p-5 overflow-y-auto flex-1 text-xs leading-relaxed text-[var(--text)] space-y-3 font-normal whitespace-pre-wrap selection:bg-blue-500/20">
              {sourceLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-[var(--text-muted)]">
                  <Loader2 size={24} className="animate-spin text-blue-500" />
                  <span className="text-xs font-semibold">Loading document content...</span>
                </div>
              ) : (
                sourceContent || "No document text available for preview."
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-between">
              <span className="text-[10px] text-[var(--text-muted)]">
                IntelliChoice Decision Support Corpus
              </span>
              <button
                onClick={() => setSelectedSource(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer text-[var(--text)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
