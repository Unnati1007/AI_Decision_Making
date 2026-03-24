function ResourceCard({ title, description, citation }) {
  return (
    <article className="rounded-xl border border-[#ececf6] bg-[#fcfcff] p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{title}</p>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      <a
        href={citation}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-block text-xs font-semibold text-[#2f3f98] transition hover:text-[#25317a]"
      >
        View Citation
      </a>
    </article>
  );
}

export default ResourceCard;
