import { useMemo, useRef, useState } from "react";
import ChatInput from "../components/chat/ChatInput";
import ChatMessage from "../components/chat/ChatMessage";
import RecommendationCard from "../components/chat/RecommendationCard";
import ResourceCard from "../components/chat/ResourceCard";
import {
  dummyResponse,
  userDummyInsights,
  userQuickPrompts,
  userRecentDomainActivity,
  userTopics,
} from "../data/dummyData";

function ChatbotPage({ onLogout }) {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [chat, setChat] = useState([]);
  const [decisionStage, setDecisionStage] = useState("idle");
  const [followUpIndex, setFollowUpIndex] = useState(-1);
  const [followUpPlan, setFollowUpPlan] = useState([]);
  const [followUpTargetCount, setFollowUpTargetCount] = useState(3);
  const [followUpAnswers, setFollowUpAnswers] = useState([]);
  const [draftMainQuestion, setDraftMainQuestion] = useState("");
  const [savedCurrentSessionId, setSavedCurrentSessionId] = useState("");
  const [history, setHistory] = useState([]);
  const [isHistoryReadOnly, setIsHistoryReadOnly] = useState(false);
  const [profile, setProfile] = useState({ name: "Demo User", email: "user@intellichoice.ai" });
  const panelRef = useRef(null);

  const activeResponse = selectedTopic ? dummyResponse[selectedTopic] : null;
  const userTabs = ["Dashboard", "Decisions", "History", "Settings"];

  const selectedTopicLabel = useMemo(() => {
    const found = userTopics.find((topic) => topic.key === selectedTopic);
    return found?.label ?? "";
  }, [selectedTopic]);

  const getAdaptiveQuestion = (question, answer, step) => {
    if (!answer) return question;
    const shortAnswer = answer.length > 60 ? `${answer.slice(0, 60)}...` : answer;
    if (step === 0) return `${question} (Noted: "${shortAnswer}")`;
    if (step === 1) return `Got it. ${question}`;
    return `Thanks, one last thing: ${question}`;
  };

  const getFollowUpCount = (query) => {
    const text = query.toLowerCase();
    const detailSignals = [
      "budget",
      "timeline",
      "goal",
      "experience",
      "salary",
      "risk",
      "deadline",
      "cgpa",
    ];
    const vagueSignals = ["help", "suggest", "advice", "what to do", "not sure", "confused"];

    const detailScore =
      (text.length > 90 ? 2 : 0) +
      (/\d/.test(text) ? 1 : 0) +
      detailSignals.reduce((sum, term) => sum + (text.includes(term) ? 1 : 0), 0);

    const vagueScore =
      (text.length < 22 ? 2 : 0) +
      vagueSignals.reduce((sum, term) => sum + (text.includes(term) ? 1 : 0), 0);

    if (detailScore >= 3) return 3;
    if (vagueScore >= 3) return 7;
    if (vagueScore === 2) return 6;
    if (detailScore >= 1) return 4;
    return 5;
  };

  const buildQuestionPlan = (query, domain) => {
    const target = getFollowUpCount(query);
    const bank = domain.questionBank ?? [];
    const lowered = query.toLowerCase();
    const prioritized = bank.filter(
      (item) =>
        lowered.includes("budget") ||
        lowered.includes("salary") ||
        lowered.includes("stress") ||
        lowered.includes("legal") ||
        lowered.includes("study")
          ? true
          : true
    );
    return prioritized.slice(0, Math.min(target, 7));
  };

  const startDecision = (topic) => {
    setSelectedTopic(topic.key);
    setDecisionStage("awaitingMain");
    setFollowUpIndex(-1);
    setFollowUpPlan([]);
    setFollowUpTargetCount(3);
    setFollowUpAnswers([]);
    setDraftMainQuestion("");
    setSavedCurrentSessionId("");
    setIsHistoryReadOnly(false);
    setInput("");
    setChat([
      {
        role: "assistant",
        text: `Hi! Great to see you. You selected ${topic.label}. What decision are you trying to make today?`,
      },
    ]);
    setActiveTab("Decisions");
  };

  const handleSend = () => {
    if (!input.trim() || isThinking || !selectedTopic || !activeResponse || activeTab !== "Decisions") return;
    const message = input.trim();
    setInput("");

    if (decisionStage === "awaitingMain") {
      setChat((prev) => [...prev, { role: "user", text: message }]);
      setDraftMainQuestion(message);
      setIsThinking(true);
      setTimeout(() => {
        const questionPlan = buildQuestionPlan(message, activeResponse);
        const firstQuestion = getAdaptiveQuestion(questionPlan[0].question, message, 0);
        setChat((prev) => [
          ...prev,
          {
            role: "assistant", text: `Thanks. I will ask ${questionPlan.length} quick follow-up MCQs.`,
          },
          { role: "assistant", text: firstQuestion },
        ]);
        setFollowUpPlan(questionPlan);
        setFollowUpTargetCount(questionPlan.length);
        setDecisionStage("followups");
        setFollowUpIndex(0);
        setIsThinking(false);
      }, 600);
      return;
    }
  };

  const handleFollowUpOptionSelect = (option) => {
    if (decisionStage !== "followups" || followUpIndex < 0) return;
    const prompt = followUpPlan[followUpIndex]?.question ?? "";
    const updatedAnswers = [...followUpAnswers, { question: prompt, answer: option }];
    const updatedChat = [...chat, { role: "user", text: option }];
    setFollowUpAnswers(updatedAnswers);
    setChat(updatedChat);
    const isLast = followUpIndex >= followUpPlan.length - 1;

    if (!isLast) {
      const nextIdx = followUpIndex + 1;
      const nextQuestion = getAdaptiveQuestion(followUpPlan[nextIdx].question, option, nextIdx);
      setIsThinking(true);
      setTimeout(() => {
        setChat((prev) => [...prev, { role: "assistant", text: nextQuestion }]);
        setFollowUpIndex(nextIdx);
        setIsThinking(false);
      }, 500);
    } else {
      setDecisionStage("complete");
      setChat((prev) => [
        ...prev,
        { role: "assistant", text: "Perfect. Your recommendation is now ready with reasoning and research references." },
      ]);
      if (!savedCurrentSessionId) {
        const newSession = {
          id: `session-${Date.now()}`,
          topicKey: selectedTopic,
          topicLabel: activeResponse.label,
          mainQuestion: draftMainQuestion,
          followUpAnswers: updatedAnswers,
          recommendation: activeResponse.recommendation,
          reasoning: activeResponse.reasoning,
          resources: activeResponse.resources,
          futureOutlook:
            "If you stay consistent in this direction, your future outcomes are likely to remain stable and positive.",
          createdAt: new Date().toLocaleString(),
          transcript: updatedChat,
        };
        setHistory((prev) => [newSession, ...prev]);
        setSavedCurrentSessionId(newSession.id);
      }
    }
    panelRef.current?.scrollTo({ top: panelRef.current.scrollHeight, behavior: "smooth" });
  };

  const handleNewDecision = () => {
    setSelectedTopic("");
    setDecisionStage("idle");
    setChat([]);
    setInput("");
    setFollowUpIndex(-1);
    setFollowUpPlan([]);
    setFollowUpTargetCount(3);
    setFollowUpAnswers([]);
    setDraftMainQuestion("");
    setSavedCurrentSessionId("");
    setIsHistoryReadOnly(false);
    setActiveTab("Dashboard");
  };

  const renderDashboard = () => (
    <section className="rounded-3xl border border-[#e6e6f1] bg-[#f9f9fd] p-5 md:p-7">
      <div className="rounded-2xl bg-gradient-to-r from-[#2f3f98] via-[#4558c5] to-[#06b6d4] p-5 text-white shadow-md">
        <h2 className="text-xl font-semibold">Choose your aspect</h2>
        <p className="mt-1 text-sm text-blue-100">Select a path to continue</p>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {userTopics.map((topic) => (
          <button
            key={topic.key}
            type="button"
            onClick={() => startDecision(topic)}
            className="group rounded-2xl border border-[#e3e3ef] bg-white px-4 py-5 text-left transition hover:-translate-y-0.5 hover:border-[#cfd2f7] hover:shadow-md"
          >
            <p className="text-base font-semibold text-[#2f3f98]">{topic.label}</p>
            <p className="mt-1 text-xs text-slate-500">Start decision analysis</p>
            <p className="mt-4 text-xs font-medium text-[#2f3f98] opacity-0 transition group-hover:opacity-100">
              Continue -&gt;
            </p>
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-[#e3e3ef] bg-white p-5">
          <h3 className="text-sm font-semibold text-[#2f3f98]">Trending Insights</h3>
          <div className="mt-3 space-y-2">
            {userDummyInsights.map((insight) => (
              <p key={insight} className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {insight}
              </p>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-[#e3e3ef] bg-white p-5">
          <h3 className="text-sm font-semibold text-[#2f3f98]">Quick Start Prompts</h3>
          <div className="mt-3 space-y-2">
            {userQuickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => {
                  const firstTopic = userTopics[0];
                  startDecision(firstTopic);
                  setInput(prompt);
                }}
                className="block w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                {prompt}
              </button>
            ))}
          </div>
        </article>
      </div>

      <article className="mt-4 rounded-2xl border border-[#e3e3ef] bg-white p-5">
        <h3 className="text-sm font-semibold text-[#2f3f98]">Domain Activity (Dummy)</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {userRecentDomainActivity.map((item) => (
            <div key={item.domain} className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">{item.domain}</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{item.sessions} sessions</p>
              <p className="text-xs text-emerald-700">Completion: {item.completion}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );

  const renderDecisions = () => (
    <section className="rounded-3xl border border-[#e6e6f1] bg-[#f9f9fd] p-4 md:p-6">
      {!selectedTopic ? (
        <div className="rounded-2xl border border-dashed border-[#d7d9ef] bg-white p-8 text-center">
          <h3 className="text-lg font-semibold text-[#2f3f98]">No path selected</h3>
          <p className="mt-2 text-sm text-slate-600">Go to Dashboard, select one aspect, and continue.</p>
        </div>
      ) : (
        <>
          <div ref={panelRef} className="space-y-4 overflow-y-auto md:max-h-[58vh]">
            <div className="rounded-2xl border border-[#dfe3ff] bg-[#3347b9] px-4 py-3 text-sm text-white shadow-sm">
              Selected Path: <span className="font-semibold">{selectedTopicLabel}</span>
            </div>
            {chat.map((message, index) => (
              <ChatMessage key={`${message.role}-${index}`} role={message.role} text={message.text} />
            ))}

            {isThinking ? (
              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:120ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-blue-300 [animation-delay:240ms]" />
                AI is thinking...
              </div>
            ) : null}

            {decisionStage === "complete" && activeResponse ? (
              <div className="space-y-4 rounded-2xl border border-[#e5e6f4] bg-white p-5">
                <RecommendationCard
                  recommendation={activeResponse.recommendation}
                  reasoning={activeResponse.reasoning}
                />
                <div>
                  <h4 className="mb-2 text-lg font-semibold text-[#2f3f98]">Research Papers & Data</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    {activeResponse.resources.map((resource) => (
                      <ResourceCard key={resource.title} {...resource} />
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  If you keep moving in this direction, your future outcomes are likely to remain stable and strong.
                </div>
              </div>
            ) : null}
          </div>
          {!isHistoryReadOnly && decisionStage === "awaitingMain" ? (
            <div className="mt-4">
              <ChatInput
                value={input}
                onChange={setInput}
                onSend={handleSend}
                disabled={isThinking}
                placeholder="Tell me your decision..."
              />
            </div>
          ) : null}

          {!isHistoryReadOnly && decisionStage === "followups" && followUpPlan[followUpIndex] ? (
            <div className="mt-4 rounded-2xl border border-[#e5e6f4] bg-white p-4">
              <p className="text-sm font-medium text-slate-600">
                Follow-up {followUpIndex + 1} / {followUpTargetCount}
              </p>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {followUpPlan[followUpIndex].options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleFollowUpOptionSelect(option)}
                    className="rounded-xl border border-[#dfe3ff] bg-[#f6f8ff] px-3 py-2 text-left text-sm text-[#2f3f98] transition hover:bg-[#edf1ff]"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}
    </section>
  );

  const renderHistory = () => (
    <section className="rounded-3xl border border-[#e6e6f1] bg-[#f9f9fd] p-5 md:p-7">
      <h2 className="text-xl font-semibold text-[#2f3f98]">History</h2>
      <p className="mt-1 text-sm text-slate-600">Open any completed decision as full chat.</p>
      <div className="mt-4 space-y-3">
        {history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d7d9ef] bg-white p-4 text-sm text-slate-500">
            No completed decisions yet.
          </div>
        ) : (
          history.map((item) => (
            <article key={item.id} className="rounded-2xl border border-[#e3e3ef] bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2f3f98]">{item.topicLabel}</p>
              <p className="mt-1 text-sm text-slate-700">{item.mainQuestion}</p>
              <p className="mt-2 text-xs text-slate-500">{item.createdAt}</p>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTopic(item.topicKey);
                    setChat(item.transcript);
                    setDecisionStage("complete");
                    setIsHistoryReadOnly(true);
                    setActiveTab("Decisions");
                  }}
                  className="rounded-lg bg-[#2f3f98] px-3 py-1.5 text-xs font-medium text-white"
                >
                  View
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );

  const renderSettings = () => (
    <section className="rounded-3xl border border-[#e6e6f1] bg-[#f9f9fd] p-5 md:p-7">
      <h2 className="text-xl font-semibold text-[#2f3f98]">Profile Edit</h2>
      <p className="mt-1 text-sm text-slate-600">Update your profile information.</p>
      <div className="mt-5 grid max-w-lg gap-4">
        <div>
          <label htmlFor="profile-name" className="mb-1 block text-sm text-slate-600">
            Name
          </label>
          <input
            id="profile-name"
            type="text"
            value={profile.name}
            onChange={(event) => setProfile((prev) => ({ ...prev, name: event.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 outline-none focus:border-blue-400"
          />
        </div>
        <div>
          <label htmlFor="profile-email" className="mb-1 block text-sm text-slate-600">
            Email
          </label>
          <input
            id="profile-email"
            type="email"
            value={profile.email}
            onChange={(event) => setProfile((prev) => ({ ...prev, email: event.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 outline-none focus:border-blue-400"
          />
        </div>
        <button
          type="button"
          className="w-fit rounded-xl bg-[#2f3f98] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#25317a]"
        >
          Save Profile
        </button>
      </div>
    </section>
  );

  const renderProfileSummary = () => (
    <div className="mt-auto rounded-2xl border border-[#d9ddff] bg-white p-3">
      <p className="text-xs text-slate-500">Profile</p>
      <p className="text-sm font-semibold text-slate-800">{profile.name}</p>
      <button type="button" onClick={() => setActiveTab("Settings")} className="mt-2 text-xs font-medium text-[#2f3f98]">
        Edit Profile
      </button>
    </div>
  );

  return (
    <div className="flex min-h-[92vh] overflow-hidden rounded-[28px] border border-slate-200 bg-[#f2f2f8] shadow-xl shadow-slate-200">
      <aside className="hidden w-64 border-r border-[#e4e4ef] bg-[#ececf6] p-5 lg:flex lg:flex-col">
        <div>
          <h1 className="text-xl font-semibold text-[#2f3f98]">IntelliChoice</h1>
          <p className="bg-gradient-to-r from-[#3445ac] via-[#5a67d8] to-[#06b6d4] bg-clip-text text-[11px] font-semibold uppercase tracking-[0.2em] text-transparent">
            Your Intelligent Choice
          </p>
        </div>
        <button
          type="button"
          onClick={handleNewDecision}
          className="mt-6 rounded-2xl bg-white px-4 py-3 text-left text-sm font-semibold text-[#2f3f98] shadow-sm"
        >
          + New Decision
        </button>
        <div className="mt-6 space-y-2 text-sm">
          {userTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`block w-full rounded-xl px-3 py-2 text-left transition ${
                activeTab === tab
                  ? "bg-[#dfe3ff] font-semibold text-[#2f3f98]"
                  : "text-slate-600 hover:bg-white/80 hover:text-slate-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {renderProfileSummary()}
        <button
          type="button"
          onClick={onLogout}
          className="mt-3 text-left text-sm font-medium text-slate-700 hover:text-slate-950"
        >
          Logout
        </button>
      </aside>

      <div className="flex w-full flex-col p-4 md:p-6">
        <header className="flex items-center justify-between">
          <nav className="flex gap-5 text-sm">
            {userTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`pb-1 ${
                  activeTab === tab
                    ? "border-b-2 border-[#2f3f98] font-semibold text-[#2f3f98]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-full bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm lg:hidden"
          >
            Logout
          </button>
        </header>

        <div className="mt-6 flex-1">
          {activeTab === "Dashboard" ? renderDashboard() : null}
          {activeTab === "Decisions" ? renderDecisions() : null}
          {activeTab === "History" ? renderHistory() : null}
          {activeTab === "Settings" ? renderSettings() : null}
        </div>
      </div>
    </div>
  );
}

export default ChatbotPage;
