function RecommendationCard({ recommendation, reasoning }) {
  return (
    <section className="rounded-2xl border border-[#ececf6] bg-[#f7f7fd] p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Recommended Decision</h3>
      <p className="mt-2 text-xl font-semibold text-[#2f3f98]">{recommendation}</p>
      <h4 className="mt-5 text-sm font-semibold uppercase tracking-wider text-slate-600">Why I Reached This Solution</h4>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
        {reasoning.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export default RecommendationCard;
