import Navbar from "../components/layout/Navbar";
import { adminSettingsData } from "../data/dummyData";

function AdminSettingsPage() {
  return (
    <div className="space-y-5">
      <Navbar title="Settings" subtitle="Environment controls and notification preferences" />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-700">Environment Profiles</h3>
        <div className="grid gap-3 md:grid-cols-3">
          {adminSettingsData.environments.map((env) => (
            <article key={env.name} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <h4 className="text-sm font-semibold text-slate-900">{env.name}</h4>
              <p className="mt-2 text-xs text-slate-600">Model: {env.model}</p>
              <p className="text-xs text-slate-600">Guard: {env.guardLevel}</p>
              <p className="text-xs text-slate-600">Cache: {env.cache}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-700">Notification Channels</h3>
        <div className="space-y-3">
          {adminSettingsData.notificationChannels.map((channel) => (
            <div key={channel.channel} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-sm text-slate-700">{channel.channel}</p>
              <span
                className={`rounded-full px-2 py-1 text-xs ${
                  channel.enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                }`}
              >
                {channel.enabled ? "Enabled" : "Disabled"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdminSettingsPage;
