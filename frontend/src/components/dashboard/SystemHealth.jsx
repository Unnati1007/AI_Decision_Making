function SystemHealth({ cacheLabel }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">System Health</h3>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            cacheLabel === "Cache Hit" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          {cacheLabel}
        </span>
      </div>
      <div className="grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-slate-500">Guard Failures</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">6</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-slate-500">Average Latency</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">320ms</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-slate-500">Cache Hits vs Misses</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">78 / 22</p>
        </div>
      </div>
    </section>
  );
}

export default SystemHealth;
