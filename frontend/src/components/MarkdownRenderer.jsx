import React from "react";

/**
 * Parses inline markdown elements: **bold**, *italic*, `code`, and [links](url)
 */
function parseInline(text) {
  if (!text) return null;

  // Pattern matches: [link](url), **bold**, *italic*, `code`
  const regex = /(\[.*?\]\(.*?\)|\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Link: [text](url)
    if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        const [, label, url] = match;
        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 font-semibold underline hover:text-blue-700 transition-colors"
          >
            {label}
          </a>
        );
      }
    }

    // Bold: **text**
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={index} className="font-bold text-[var(--text)]">
          {parseInline(part.slice(2, -2))}
        </strong>
      );
    }

    // Italic: *text*
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      return (
        <em key={index} className="italic text-[var(--text-muted)]">
          {parseInline(part.slice(1, -1))}
        </em>
      );
    }

    // Inline Code: `code`
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-mono text-[11px]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    return part;
  });
}

/**
 * Renders full markdown text with typography, headings, lists, and callouts
 */
export default function MarkdownRenderer({ content, className = "" }) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements = [];
  let currentList = null;

  const flushList = () => {
    if (currentList) {
      if (currentList.type === "ul") {
        elements.push(
          <ul key={`ul-${elements.length}`} className="my-2.5 space-y-2 pl-1">
            {currentList.items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm leading-relaxed text-[var(--text)]">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                <span className="flex-1">{parseInline(item)}</span>
              </li>
            ))}
          </ul>
        );
      } else if (currentList.type === "ol") {
        elements.push(
          <ol key={`ol-${elements.length}`} className="my-2.5 space-y-2 pl-1">
            {currentList.items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm leading-relaxed text-[var(--text)]">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/50 text-[11px] font-bold text-blue-700 dark:text-blue-300">
                  {idx + 1}
                </span>
                <span className="flex-1">{parseInline(item)}</span>
              </li>
            ))}
          </ol>
        );
      }
      currentList = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      flushList();
      continue;
    }

    // Horizontal Rule: --- or ***
    if (line === "---" || line === "***" || line === "___") {
      flushList();
      elements.push(<hr key={i} className="my-4 border-t border-[var(--border)]" />);
      continue;
    }

    // Headings
    if (line.startsWith("# ")) {
      flushList();
      elements.push(
        <h1 key={i} className="text-lg md:text-xl font-black tracking-tight text-[var(--text)] pt-3 pb-2 border-b border-[var(--border)] mb-3">
          {parseInline(line.slice(2))}
        </h1>
      );
      continue;
    }

    if (line.startsWith("## ")) {
      flushList();
      elements.push(
        <h2 key={i} className="text-base font-bold text-[var(--text)] pt-4 pb-1 mb-2 flex items-center gap-2">
          {parseInline(line.slice(3))}
        </h2>
      );
      continue;
    }

    if (line.startsWith("### ")) {
      flushList();
      elements.push(
        <h3 key={i} className="text-xs font-black uppercase tracking-wider text-[var(--text-soft)] pt-3 mb-1.5">
          {parseInline(line.slice(4))}
        </h3>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      flushList();
      elements.push(
        <blockquote
          key={i}
          className="my-3 p-3 rounded-xl border-l-4 border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-xs italic text-[var(--text-muted)] leading-relaxed"
        >
          {parseInline(line.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Unordered List Items: - or *
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const itemText = line.slice(2);
      if (!currentList || currentList.type !== "ul") {
        flushList();
        currentList = { type: "ul", items: [itemText] };
      } else {
        currentList.items.push(itemText);
      }
      continue;
    }

    // Ordered List Items: 1. 2. etc.
    const orderedMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      const itemText = orderedMatch[2];
      if (!currentList || currentList.type !== "ol") {
        flushList();
        currentList = { type: "ol", items: [itemText] };
      } else {
        currentList.items.push(itemText);
      }
      continue;
    }

    // Regular Paragraph
    flushList();
    elements.push(
      <p key={i} className="text-sm font-medium leading-relaxed text-[var(--text-muted)] my-2">
        {parseInline(line)}
      </p>
    );
  }

  flushList();

  return <div className={`space-y-1.5 ${className}`}>{elements}</div>;
}
