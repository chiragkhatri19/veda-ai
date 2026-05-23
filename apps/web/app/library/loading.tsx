export default function LibraryLoading() {
  return (
    <div className="px-6 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="skeleton h-7 w-28 rounded-lg" />
        <div className="skeleton h-3.5 w-40 rounded" />
      </div>

      {/* Filters: search + subject */}
      <div className="flex flex-wrap gap-3">
        <div className="skeleton h-9 w-48 rounded-lg" />
        <div className="skeleton h-9 w-32 rounded-lg" />
      </div>

      {/* PaperCard grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-app-surface rounded-xl border border-app-border p-5 flex flex-col gap-4">
            {/* Row 1: icon + ready badge */}
            <div className="flex items-start justify-between">
              <div className="skeleton w-9 h-9 rounded-lg" />
              <div className="skeleton h-5 w-12 rounded-full" />
            </div>
            {/* Row 2: title + subject/grade */}
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3.5 w-full rounded" />
              <div className="skeleton h-3.5 w-3/4 rounded" />
              <div className="skeleton h-3 w-28 rounded mt-0.5" />
            </div>
            {/* Row 3: Qs · marks · date */}
            <div className="flex items-center gap-2 pt-3 border-t border-app-border/60">
              <div className="skeleton h-3 w-10 rounded" />
              <div className="skeleton h-3 w-2 rounded" />
              <div className="skeleton h-3 w-16 rounded" />
              <div className="skeleton h-3 w-16 rounded ml-auto" />
            </div>
            {/* Row 4: View + PDF buttons */}
            <div className="flex gap-2">
              <div className="skeleton h-8 flex-1 rounded-lg" />
              <div className="skeleton h-8 flex-1 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


