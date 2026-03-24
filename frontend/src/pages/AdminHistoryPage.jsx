import Navbar from "../components/layout/Navbar";
import { adminAuditHistory } from "../data/dummyData";

function AdminHistoryPage() {
  return (
    <div className="space-y-5">
      <Navbar title="Audit History" subtitle="System audit and moderation timeline" />
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-700">Recent Audit Events</h3>
        <div className="space-y-3">
          {adminAuditHistory.map((item) => (
            <article key={item.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">{item.event}</p>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    item.severity === "High"
                      ? "bg-red-100 text-red-700"
                      : item.severity === "Medium"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {item.severity}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {item.id} - {item.actor} - {item.time}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdminHistoryPage;
