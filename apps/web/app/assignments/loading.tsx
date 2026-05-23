export default function AssignmentsLoading() {
  return (
    <div className="px-5 sm:px-6 py-6 min-h-full">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 rounded-full skeleton shrink-0" />
          <div className="skeleton h-7 w-32 rounded-lg" />
        </div>
        <div className="skeleton h-3.5 w-52 rounded mt-1 ml-4" />
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="skeleton h-10 w-28 rounded-xl shrink-0" />
        <div className="skeleton h-10 flex-1 rounded-xl" />
      </div>

      {/* Assignment card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-app-surface rounded-2xl border border-app-border p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-1.5">
                <div className="skeleton h-4 w-44 rounded" />
                <div className="skeleton h-3.5 w-32 rounded" />
              </div>
              <div className="skeleton h-7 w-7 rounded-lg shrink-0" />
            </div>
            <div className="flex items-center justify-between mt-auto pt-1">
              <div className="skeleton h-3 w-32 rounded" />
              <div className="skeleton h-3 w-24 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
