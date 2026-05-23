export default function SkeletonCard() {
  return (
    <div className="bg-app-surface rounded-2xl border border-app-border p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-1.5">
          <div className="h-4 rounded w-44 skeleton" />
          <div className="h-3.5 rounded w-28 skeleton" />
        </div>
        <div className="w-7 h-7 rounded-lg skeleton shrink-0" />
      </div>
      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="h-3 rounded w-32 skeleton" />
        <div className="h-3 rounded w-24 skeleton" />
      </div>
    </div>
  );
}
