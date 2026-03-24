function QuestionCard({ index, question }) {
  return (
    <article className="rounded-xl border border-[#ececf6] bg-[#f6f6fc] p-3 text-sm text-slate-700 transition hover:bg-[#f0f0fa]">
      <span className="mr-2 font-semibold text-[#2f3f98]">{String(index).padStart(2, "0")}.</span>
      <span>{question}</span>
    </article>
  );
}

export default QuestionCard;
