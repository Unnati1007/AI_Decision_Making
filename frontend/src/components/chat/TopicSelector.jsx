function TopicSelector({ topics, selectedTopic, onSelect }) {
  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Step 1</p>
        <h3 className="text-lg font-semibold text-slate-900">Pick a decision area</h3>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {topics.map((topic) => {
          const isActive = selectedTopic === topic.key;
          return (
            <button
              key={topic.key}
              type="button"
              onClick={() => onSelect(topic)}
              className={`group rounded-2xl border px-4 py-3 text-left transition ${
                isActive
                  ? "border-blue-400 bg-blue-50 shadow-sm"
                  : "border-slate-200 bg-slate-50/80 hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
              <p className={`text-sm font-semibold ${isActive ? "text-blue-700" : "text-slate-800"}`}>
                {topic.label}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {isActive ? "Selected category" : "Choose this to get relevant follow-up questions"}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default TopicSelector;
