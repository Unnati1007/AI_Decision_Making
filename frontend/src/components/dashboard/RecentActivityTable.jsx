function RecentActivityTable({ rows }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-slate-700">Recent Activity</h3>
      <div className="overflow-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="pb-2 font-medium">User</th>
              <th className="pb-2 font-medium">Query</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.user}-${row.time}`} className="border-t border-slate-100">
                <td className="py-3 pr-4 text-slate-700">{row.user}</td>
                <td className="py-3 pr-4 text-slate-900">{row.query}</td>
                <td className="py-3 pr-4">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      row.status === "Passed"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="py-3 text-slate-500">{row.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default RecentActivityTable;
