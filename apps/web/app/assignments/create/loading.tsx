export default function CreateAssignmentLoading() {
  return (
    <div className="flex justify-center px-4 sm:px-6 py-6">
      <div className="w-full max-w-2xl space-y-6">
        <div className="space-y-1">
          <div className="skeleton h-7 w-44 rounded-lg" />
          <div className="skeleton h-3.5 w-64 rounded ml-4" />
        </div>

        <div className="bg-app-surface rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(16,24,40,0.08),0_8px_28px_rgba(16,24,40,0.12),0_20px_56px_-8px_rgba(16,24,40,0.10)]">
          <div className="px-6 py-5 border-b border-app-border space-y-1">
            <div className="skeleton h-4 w-36 rounded" />
            <div className="skeleton h-3 w-56 rounded" />
          </div>
          <div className="p-6 space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="skeleton h-3 w-20 rounded" />
                <div className="skeleton h-10 w-full rounded-lg" />
              </div>
            ))}
            <div className="skeleton h-28 w-full rounded-2xl" />
            <div className="space-y-1.5">
              <div className="skeleton h-3 w-24 rounded" />
              <div className="skeleton h-10 w-40 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="skeleton h-10 w-28 rounded-full" />
          <div className="skeleton h-10 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}
