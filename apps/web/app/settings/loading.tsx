export default function SettingsLoading() {
  return (
    <div className="px-6 py-6 max-w-2xl space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="skeleton h-7 w-24 rounded-lg" />
        <div className="skeleton h-3.5 w-64 rounded" />
      </div>

      {/* Avatar banner */}
      <div className="bg-app-surface rounded-xl p-5 flex items-center gap-4 shadow-card">
        <div className="skeleton w-14 h-14 rounded-full shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="skeleton h-4 w-36 rounded" />
          <div className="skeleton h-3 w-48 rounded" />
          <div className="skeleton h-3 w-40 rounded" />
        </div>
      </div>

      {/* Form card */}
      <div className="bg-app-surface rounded-xl overflow-hidden shadow-card">
        {/* Profile section header */}
        <div className="px-5 py-4 border-b border-app-border bg-app-surface-2/50 space-y-1">
          <div className="skeleton h-3.5 w-36 rounded" />
          <div className="skeleton h-3 w-56 rounded" />
        </div>

        {/* 4 profile fields */}
        <div className="px-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3.5 border-b border-app-border/60 last:border-0"
            >
              <div className="flex items-center gap-2.5 sm:w-44 shrink-0">
                <div className="skeleton w-3.5 h-3.5 rounded" />
                <div className="skeleton h-3 w-24 rounded" />
              </div>
              <div className="skeleton h-9 flex-1 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Teaching prefs section header */}
        <div className="px-5 py-4 border-t border-app-border bg-app-surface-2/50 mt-2 space-y-1">
          <div className="skeleton h-3.5 w-40 rounded" />
          <div className="skeleton h-3 w-64 rounded" />
        </div>

        {/* 2 preference fields */}
        <div className="px-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3.5 border-b border-app-border/60 last:border-0"
            >
              <div className="flex items-center gap-2.5 sm:w-44 shrink-0">
                <div className="skeleton w-3.5 h-3.5 rounded" />
                <div className="skeleton h-3 w-28 rounded" />
              </div>
              <div className="skeleton h-9 flex-1 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Footer with buttons */}
        <div className="px-5 py-4 border-t border-app-border flex items-center justify-end gap-2.5">
          <div className="skeleton h-9 w-20 rounded-lg" />
          <div className="skeleton h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Version text */}
      <div className="skeleton h-3 w-48 rounded mx-auto" />
    </div>
  );
}


