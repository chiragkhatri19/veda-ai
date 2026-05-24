export default function RubricLoading() {
  return (
    <div className="px-6 py-6 max-w-5xl space-y-6">
      {/* Back link */}
      <div className="skeleton h-4 w-28 rounded" />

      {/* Header */}
      <div className="space-y-1.5">
        <div className="skeleton h-7 w-56 rounded-lg" />
        <div className="skeleton h-3.5 w-80 rounded" />
      </div>

      {/* Form card */}
      <div className="bg-app-surface rounded-xl p-5 space-y-4 shadow-card">
        <div className="skeleton h-4 w-36 rounded" />

        {/* Topic field */}
        <div className="space-y-1.5">
          <div className="skeleton h-3 w-20 rounded" />
          <div className="skeleton h-10 w-full rounded-lg" />
        </div>

        {/* 3-col row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="skeleton h-3 w-20 rounded" />
              <div className="skeleton h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>

        {/* 2-col narrow row */}
        <div className="grid grid-cols-2 gap-4 max-w-xs">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="skeleton h-3 w-20 rounded" />
              <div className="skeleton h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>

        {/* Submit button */}
        <div className="pt-1">
          <div className="skeleton h-10 w-36 rounded-full" />
        </div>
      </div>
    </div>
  );
}


