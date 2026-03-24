function DashboardCard({ label, value, hint }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-sm text-slate-500">{label}</p>
      <h3 className="mt-2 text-2xl font-semibold text-slate-900">{value}</h3>
      <p className="mt-2 text-xs text-blue-600">{hint}</p>
    </article>
  );
}

export default DashboardCard;
