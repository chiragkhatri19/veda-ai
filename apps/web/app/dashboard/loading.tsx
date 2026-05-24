export default function DashboardLoading() {
  return (
    <div className="px-6 py-6 space-y-7">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-2">
          <div className="skeleton h-7 w-52 rounded-lg" />
          <div className="skeleton h-3.5 w-72 rounded" />
        </div>
        <div className="skeleton h-9 w-36 rounded-full shrink-0" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-app-surface rounded-xl p-5 flex flex-col gap-3 shadow-card">
            <div className="skeleton h-9 w-9 rounded-lg" />
            <div className="space-y-2">
              <div className="skeleton h-8 w-12 rounded" />
              <div className="skeleton h-3 w-28 rounded" />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="skeleton h-2.5 w-24 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-app-surface rounded-xl p-4 flex items-center justify-between shadow-card">
              <div className="space-y-1.5">
                <div className="skeleton h-3.5 w-28 rounded" />
                <div className="skeleton h-3 w-36 rounded" />
              </div>
              <div className="skeleton h-4 w-4 rounded" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="skeleton h-2.5 w-28 rounded" />
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-app-surface rounded-2xl px-5 py-4 flex items-center gap-4 shadow-card">
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="skeleton h-3.5 w-48 rounded" />
                <div className="skeleton h-3 w-28 rounded" />
              </div>
              <div className="skeleton h-5 w-16 rounded-full shrink-0" />
              <div className="skeleton h-3.5 w-20 rounded shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
