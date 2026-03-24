function Navbar({ title, subtitle, hideSearch = false, onLogout }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200/80 bg-white/85 px-5 py-4 shadow-sm backdrop-blur">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      <div className="flex items-center gap-2">
        {!hideSearch ? (
          <input
            type="text"
            placeholder="Search..."
            className="w-44 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 sm:w-56"
          />
        ) : null}
        <button
          type="button"
          className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
        >
          Profile
        </button>
        {onLogout ? (
          <button
            type="button"
            onClick={onLogout}
            className="rounded-full bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Logout
          </button>
        ) : null}
      </div>
    </header>
  );
}

export default Navbar;
