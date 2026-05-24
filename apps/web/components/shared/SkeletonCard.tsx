export default function SkeletonCard() {
  return (
    <div className="bg-app-surface rounded-2xl border border-app-border/60 p-5 flex flex-col gap-3 shadow-card">
      {/* tags + menu row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <div className="h-5 w-16 rounded-md skeleton" />
          <div className="h-5 w-14 rounded-md skeleton" />
        </div>
        <div className="h-5 w-12 rounded-full skeleton" />
      </div>
      {/* title */}
      <div className="space-y-1.5">
        <div className="h-4 rounded w-11/12 skeleton" />
        <div className="h-4 rounded w-2/3 skeleton" />
      </div>
      {/* footer dates */}
      <div className="flex items-center justify-between mt-auto pt-1 border-t border-app-border/40">
        <div className="h-3 rounded w-28 skeleton" />
        <div className="h-3 rounded w-24 skeleton" />
      </div>
    </div>
  );
}
