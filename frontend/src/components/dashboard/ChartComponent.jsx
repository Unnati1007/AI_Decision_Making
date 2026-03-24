function LineChart({ data }) {
  const width = 440;
  const height = 210;
  const maxValue = Math.max(...data.map((item) => item.value));
  const points = data
    .map((item, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - (item.value / maxValue) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-slate-700">Queries Over Time</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-48 w-full">
        <polyline fill="none" stroke="#2563eb" strokeWidth="3" points={points} />
      </svg>
      <div className="mt-3 grid grid-cols-7 text-center text-xs text-slate-500">
        {data.map((item) => (
          <span key={item.day}>{item.day}</span>
        ))}
      </div>
    </div>
  );
}

function PieChart({ data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulative = 0;

  const circles = data.map((item) => {
    const percentage = item.value / total;
    const dashArray = `${percentage * 100} ${100 - percentage * 100}`;
    const dashOffset = -cumulative * 100;
    cumulative += percentage;

    return (
      <circle
        key={item.label}
        r="16"
        cx="20"
        cy="20"
        fill="transparent"
        stroke={item.color}
        strokeWidth="5"
        strokeDasharray={dashArray}
        strokeDashoffset={dashOffset}
      />
    );
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-slate-700">Query Categories</h3>
      <div className="flex flex-col items-center gap-3 md:flex-row md:items-start">
        <svg viewBox="0 0 40 40" className="h-36 w-36 -rotate-90">
          {circles}
          <circle r="10" cx="20" cy="20" fill="white" />
        </svg>
        <div className="w-full space-y-2">
          {data.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                {item.label}
              </div>
              <span className="font-medium text-slate-900">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChartComponent({ type, data }) {
  if (type === "line") return <LineChart data={data} />;
  return <PieChart data={data} />;
}

export default ChartComponent;
