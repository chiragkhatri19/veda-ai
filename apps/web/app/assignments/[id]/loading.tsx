export default function AssignmentDetailLoading() {
  return (
    <div className="px-6 py-6">
      {/* Back link */}
      <div className="skeleton h-4 w-24 rounded mb-6" />

      {/* Progress card */}
      <div className="max-w-lg bg-app-surface rounded-2xl p-8 space-y-6 shadow-card">
        <div className="space-y-2">
          <div className="skeleton h-5 w-48 rounded" />
          <div className="skeleton h-4 w-64 rounded" />
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="skeleton h-2 w-full rounded-full" />
          <div className="flex justify-between">
            <div className="skeleton h-3 w-20 rounded" />
            <div className="skeleton h-3 w-10 rounded" />
          </div>
        </div>

        {/* Step nodes */}
        <div className="flex items-center gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 flex-1 last:flex-none">
              <div className="skeleton w-8 h-8 rounded-full shrink-0" />
              {i < 3 && <div className="skeleton h-px flex-1" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
