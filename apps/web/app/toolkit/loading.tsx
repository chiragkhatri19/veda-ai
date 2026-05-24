export default function ToolkitLoading() {
  return (
    <div className="px-6 py-6 space-y-8">
      {/* Header with sparkle icon */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="skeleton w-5 h-5 rounded" />
          <div className="skeleton h-7 w-44 rounded-lg" />
        </div>
        <div className="skeleton h-3.5 w-72 rounded" />
      </div>

      {/* Tool cards — 2-col on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-app-surface rounded-2xl p-6 flex flex-col gap-5 shadow-card">
            {/* Icon + badge */}
            <div className="flex items-start justify-between gap-3">
              <div className="skeleton w-12 h-12 rounded-2xl shrink-0" />
              <div className="skeleton h-5 w-14 rounded-full" />
            </div>
            {/* Title + description */}
            <div className="flex-1 space-y-2.5">
              <div className="skeleton h-5 w-52 rounded" />
              <div className="skeleton h-3.5 w-full rounded" />
              <div className="skeleton h-3.5 w-full rounded" />
              <div className="skeleton h-3.5 w-2/3 rounded" />
            </div>
            {/* Stats chips + Open button */}
            <div className="flex items-end justify-between gap-4">
              <div className="flex gap-2">
                <div className="skeleton h-6 w-24 rounded-full" />
                <div className="skeleton h-6 w-28 rounded-full" />
                <div className="skeleton h-6 w-20 rounded-full" />
              </div>
              <div className="skeleton h-4 w-14 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* "More tools" banner */}
      <div className="bg-app-surface-2 rounded-xl p-5 space-y-1.5 shadow-card">
        <div className="skeleton h-3.5 w-40 rounded" />
        <div className="skeleton h-3 w-72 rounded" />
      </div>
    </div>
  );
}


