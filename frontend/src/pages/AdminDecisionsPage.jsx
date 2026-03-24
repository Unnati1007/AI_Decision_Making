import Navbar from "../components/layout/Navbar";
import { adminDecisionQueue } from "../data/dummyData";

function AdminDecisionsPage() {
  return (
    <div className="space-y-5">
      <Navbar title="Decision Management" subtitle="Live decision queue and guard review status" />
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-700">Active Decisions</h3>
        <div className="overflow-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-2 font-medium">ID</th>
                <th className="pb-2 font-medium">Domain</th>
                <th className="pb-2 font-medium">Risk</th>
                <th className="pb-2 font-medium">Guard</th>
                <th className="pb-2 font-medium">Owner</th>
                <th className="pb-2 font-medium">Updated</th>
                <th className="pb-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {adminDecisionQueue.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="py-3">{item.id}</td>
                  <td className="py-3">{item.domain}</td>
                  <td className="py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{item.risk}</span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        item.guard === "Passed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {item.guard}
                    </span>
                  </td>
                  <td className="py-3">{item.owner}</td>
                  <td className="py-3 text-slate-500">{item.updated}</td>
                  <td className="py-3">
                    <button type="button" className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white">
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default AdminDecisionsPage;
