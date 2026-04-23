import { useState, useRef, useEffect } from "react";
import { Send, Brain, AlertCircle, Loader2, Sparkles, ChevronRight, User, Bot, CheckCircle2, ListFilter } from "lucide-react";
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
  const [pendingResponse, setPendingResponse] = useState(null);
  const [mcqFlow, setMcqFlow] = useState(null);
  
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
    if (!query || isThinking) return;

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

    for (let i = 0; i < 3; i++) {
      setThinkingStep(i);
      await new Promise((r) => setTimeout(r, 600));
    }

    // Match Query
    const response = matchQueryToDomain(query, domain);
    setIsThinking(false);

    if (response) {
      if (response.followUps && response.followUps.length > 0) {
        // Start MCQ Flow
        const flowId = Date.now();
        setMcqFlow({
          response,
          originalQuery: query,
          questions: response.followUps,
          currentIndex: 0,
          flowId
        });
        
        const firstQ = response.followUps[0];
        setMessages(prev => [...prev, {
          id: Date.now() + 2,
          role: "assistant",
          type: "mcq",
          question: firstQ.q,
          options: firstQ.options,
          flowId
        }]);
      } else {
        showRecommendation(response, query);
      }
    }
  };

  const showRecommendation = (response, query) => {
    const assistantMsg = {
      id: Date.now() + 2,
      role: "assistant",
      type: "response",
      ...response,
    };
    setMessages((prev) => [...prev, assistantMsg]);
    setPendingResponse(response);
    
    // Save to archive
    addArchiveEntry({
      query,
      domain,
      response,
    });
  };

  const handleMCQAnswer = (msgId, optionText) => {
    // Mark as answered
    setMessages(prev => prev.map(m => 
      m.id === msgId ? { ...m, answered: true, selectedOption: optionText } : m
    ));

    // Add user's answer
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: "user",
      type: "text",
      text: optionText,
    }]);

    if (!mcqFlow) return;

    const nextIndex = mcqFlow.currentIndex + 1;

    if (nextIndex < mcqFlow.questions.length) {
      // Show next question
      setMcqFlow(prev => ({ ...prev, currentIndex: nextIndex }));
      const nextQ = mcqFlow.questions[nextIndex];
      
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now(),
          role: "assistant",
          type: "mcq",
          question: nextQ.q,
          options: nextQ.options,
          flowId: mcqFlow.flowId
        }]);
      }, 500);
    } else {
      // Finished all questions, show conclusion
      setMcqFlow(null);
      setTimeout(() => {
        setIsThinking(true);
        setThinkingStep(4); // "Generating recommendation..."
        
        setTimeout(() => {
            setIsThinking(false);
            showRecommendation(mcqFlow.response, mcqFlow.originalQuery);
        }, 1500);
      }, 500);
    }
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
        <div className="hidden sm:flex items-center gap-2 rounded-lg bg-[var(--surface-2)] px-3 py-1.5">
            <ListFilter size={14} className="text-[var(--text-soft)]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Locked Domain: {domain || "General"}</span>
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

                {msg.type === "response" && (
                  <div className="space-y-4">
                     <div className="card p-6 space-y-6">
                        <div className="space-y-2">
                           <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                              <Sparkles size={16} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Recommendation</span>
                           </div>
                           <p className="text-lg font-bold leading-tight" style={{ color: "var(--text)" }}>{msg.recommendation}</p>
                        </div>

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

                        <div className="grid sm:grid-cols-2 gap-4">
                           <div className="rounded-xl bg-red-50 dark:bg-red-500/10 p-4 space-y-2">
                              <h5 className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400">Risks Identified</h5>
                              <ul className="space-y-1">
                                 {msg.risks.map((r, i) => (
                                   <li key={i} className="text-[11px] font-bold text-red-700/80 dark:text-red-400/80 flex items-center gap-1.5">• {r}</li>
                                 ))}
                              </ul>
                           </div>
                           <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 p-4 space-y-2">
                              <h5 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Outcome Simulation</h5>
                              <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 leading-tight">
                                <span className="opacity-60">Best:</span> {msg.simulation.best_case}
                              </p>
                              <p className="text-[11px] font-bold opacity-70 text-emerald-700 dark:text-emerald-400">
                                <span className="opacity-60">Timeline:</span> {msg.simulation.timeline}
                              </p>
                           </div>
                        </div>

                        {msg.resources && msg.resources.length > 0 && (
                           <div className="pt-5 border-t border-[var(--border)] mt-2">
                              <div className="flex items-center gap-2 mb-4">
                                 <div className="h-5 w-5 rounded-md bg-blue-600/10 text-blue-600 flex items-center justify-center">
                                    <ListFilter size={12} />
                                 </div>
                                 <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-soft)]">Strategic Resources</h4>
                              </div>
                              <div className="grid gap-3 sm:grid-cols-2">
                                 {msg.resources.map((resource, i) => (
                                    <a 
                                      key={i} 
                                      href={resource.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="group flex flex-col p-3 rounded-xl bg-[var(--surface-2)] border border-transparent hover:border-blue-500/30 hover:bg-[var(--surface)] transition-all duration-300 shadow-sm"
                                    >
                                       <div className="flex items-center justify-between gap-2 mb-1">
                                          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform truncate">{resource.title}</span>
                                          <ChevronRight size={14} className="text-[var(--text-soft)] group-hover:text-blue-500 transition-colors" />
                                       </div>
                                       <p className="text-[9px] font-medium text-[var(--text-muted)] line-clamp-1 opacity-60">Source: External Repository</p>
                                    </a>
                                 ))}
                              </div>
                           </div>
                        )}
                     </div>
                  </div>
                )}

                {msg.type === "mcq" && (
                  <div className="space-y-4">
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
          <div className="flex w-full justify-start animate-fade-up">
            <div className="flex gap-4">
               <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-2)] text-blue-600 animate-pulse">
                  <Brain size={18} />
               </div>
               <div className="flex flex-col gap-2">
                  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-5 py-3 flex items-center gap-3">
                     <Loader2 size={16} className="animate-spin text-blue-600" />
                     <span className="text-sm font-bold text-[var(--text-muted)]">{thinkingSteps[thinkingStep]}</span>
                  </div>
               </div>
            </div>
          </div>
        )}



        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-[var(--border)] bg-[var(--surface)] p-4 lg:px-8">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="mx-auto max-w-4xl relative"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about ${domainInfo?.label || 'anything'}...`}
            disabled={isThinking}
            className="input pr-12 h-12 bg-[var(--surface-2)] border-none focus:bg-[var(--surface)] focus:ring-2 focus:ring-blue-500/10 text-sm font-medium shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className={cn(
              "absolute right-1.5 top-1.5 h-9 w-9 flex items-center justify-center rounded-lg transition-all",
              input.trim() ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:-rotate-12" : "text-[var(--text-soft)]"
            )}
          >
            {isThinking ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
        <p className="mt-2 text-center text-[9px] font-bold text-[var(--text-soft)] uppercase tracking-widest opacity-60">
           AI responses can vary. Always verify high-stakes decisions.
        </p>
      </div>
    </div>
  );
}
