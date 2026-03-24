import Navbar from "../components/layout/Navbar";
import { adminToolMetrics } from "../data/dummyData";

function AdminToolsPage() {
  return (
    <div className="space-y-5">
      <Navbar title="Tools" subtitle="Operational tool status and performance metrics" />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {adminToolMetrics.map((tool) => (
          <article key={tool.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">{tool.name}</h3>
            <p className="mt-2 text-sm text-slate-500">Uptime: {tool.uptime}</p>
            <p className="text-sm text-slate-500">Latency: {tool.latency}</p>
            <span
              className={`mt-3 inline-block rounded-full px-2 py-1 text-xs ${
                tool.status === "Healthy" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              }`}
            >
              {tool.status}
            </span>
          </article>
        ))}
      </section>
    </div>
  );
}

export default AdminToolsPage;
