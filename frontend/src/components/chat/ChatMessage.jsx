import React from "react";
import { User, Bot } from "lucide-react";
import { cn } from "../../lib/utils";

function ChatMessage({ role, text, timestamp }) {
  const isUser = role === "user";
  const timeStr = timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={cn(
      "flex w-full gap-3 mb-6 animate-fade-in",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <div className={cn(
        "flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-full border shadow-sm",
        isUser 
          ? "bg-slate-50 border-slate-200 text-slate-600" 
          : "bg-blue-600 border-blue-500 text-white shadow-blue-100"
      )}>
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>

      {/* Message Bubble */}
      <div className={cn(
        "flex max-w-[80%] flex-col gap-2",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "relative px-4 py-3 text-sm shadow-premium rounded-2xl transition-all duration-200",
          isUser 
            ? "bg-blue-600 text-white rounded-tr-none hover:bg-blue-700" 
            : "bg-white border border-slate-200 text-slate-700 rounded-tl-none hover:border-blue-200"
        )}>
          {text}
        </div>
        
        <span className="px-1 text-[10px] font-medium text-slate-400 uppercase tracking-widest">
          {timeStr}
        </span>
      </div>
    </div>
  );
}

export default ChatMessage;
