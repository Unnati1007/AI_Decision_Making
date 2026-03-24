function ChatInput({ value, onChange, onSend, disabled, placeholder = "Ask your question..." }) {
  return (
    <div className="rounded-2xl border border-[#e4e4ef] bg-[#f4f4fb] p-2 shadow-sm">
      <div className="mx-auto flex max-w-4xl items-center gap-2 rounded-xl bg-white px-3 py-2">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onSend();
          }}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
        />
        <button
          type="button"
          onClick={onSend}
          disabled={disabled}
          className="rounded-xl bg-[#2f3f98] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#25317a] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          &gt;
        </button>
      </div>
    </div>
  );
}

export default ChatInput;
