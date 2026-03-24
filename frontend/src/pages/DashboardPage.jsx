import { useMemo } from "react";
import ChartComponent from "../components/dashboard/ChartComponent";
import DashboardCard from "../components/dashboard/DashboardCard";
import RecentActivityTable from "../components/dashboard/RecentActivityTable";
import SystemHealth from "../components/dashboard/SystemHealth";
import Navbar from "../components/layout/Navbar";
import { dashboardStats, queryCategories, queryTrend, recentActivity } from "../data/dummyData";

function DashboardPage() {
  const cards = useMemo(
    () => [
      { label: "Total Decisions", value: dashboardStats.totalDecisions, hint: "+12% this month" },
      { label: "Active Users", value: dashboardStats.activeUsers, hint: "+5 users this week" },
      { label: "Cache Hit Rate", value: `${dashboardStats.cacheHits}%`, hint: "Optimized response path" },
      { label: "LLM Usage", value: `${dashboardStats.llmUsage}k tokens`, hint: "Daily average load" },
    ],
    []
  );

  const cacheLabel = Math.random() > 0.5 ? "Cache Hit" : "Cache Miss";

  return (
    <div className="space-y-5">
      <Navbar
        title="Admin Dashboard"
        subtitle="System analytics, guard monitoring, and operational insights"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <DashboardCard key={card.label} label={card.label} value={card.value} hint={card.hint} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ChartComponent type="line" data={queryTrend} />
        <ChartComponent type="pie" data={queryCategories} />
      </section>

      <RecentActivityTable rows={recentActivity} />
      <SystemHealth cacheLabel={cacheLabel} />
    </div>
  );
}

export default DashboardPage;
