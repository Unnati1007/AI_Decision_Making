const navItems = ["Dashboard", "Decisions", "History", "Tools", "Settings"];

function Sidebar({ activeTab, onTabChange }) {
  return (
    <aside className="w-full shrink-0 border-b border-slate-200/80 bg-white/85 p-4 backdrop-blur lg:h-screen lg:w-72 lg:border-b-0 lg:border-r">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 shadow-lg shadow-blue-200" />
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-blue-600">Admin Console</p>
          <h1 className="text-lg font-semibold text-slate-900">IntelliChoice</h1>
        </div>
      </div>

      <nav className="grid grid-cols-2 gap-2 md:grid-cols-5 lg:grid-cols-1">
        {navItems.map((item) => {
          const isActive = activeTab === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onTabChange(item)}
              className={`rounded-xl px-4 py-2 text-left text-sm font-medium transition ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-200"
                  : "bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              {item}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
