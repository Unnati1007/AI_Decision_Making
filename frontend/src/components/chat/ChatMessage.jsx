function ChatMessage({ role, text }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-[fadeIn_0.3s_ease-out]`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
          isUser ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-700"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

export default ChatMessage;
