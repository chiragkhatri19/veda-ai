export default function GroupsLoading() {
  return (
    <div className="px-6 py-6 space-y-6">
      {/* Header + button */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1.5">
          <div className="skeleton h-7 w-28 rounded-lg" />
          <div className="skeleton h-3.5 w-40 rounded" />
        </div>
        <div className="skeleton h-9 w-28 rounded-full" />
      </div>

      {/* Group card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-app-surface rounded-xl border border-app-border p-5 flex flex-col gap-4"
            style={{ borderTopWidth: 3 }}
          >
            {/* Row 1: icon + edit/delete buttons */}
            <div className="flex items-start justify-between gap-2">
              <div className="skeleton w-10 h-10 rounded-xl shrink-0" />
              <div className="flex gap-0.5">
                <div className="skeleton h-7 w-7 rounded-lg" />
                <div className="skeleton h-7 w-7 rounded-lg" />
              </div>
            </div>
            {/* Row 2: name + subject/grade */}
            <div className="space-y-1">
              <div className="skeleton h-3.5 w-36 rounded" />
              <div className="skeleton h-3 w-28 rounded" />
            </div>
            {/* Row 3: student count + date */}
            <div className="flex items-center justify-between pt-3 border-t border-app-border/70">
              <div className="skeleton h-3 w-24 rounded" />
              <div className="skeleton h-3 w-16 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


