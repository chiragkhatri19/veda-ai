import SkeletonCard from '@/components/shared/SkeletonCard';

export default function AssignmentsLoading() {
  return (
    <div className="px-5 sm:px-6 py-6 min-h-full">
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 rounded-full skeleton shrink-0" />
          <div className="skeleton h-7 w-32 rounded-lg" />
        </div>
        <div className="skeleton h-3.5 w-52 rounded mt-1 ml-4" />
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="skeleton h-10 w-28 rounded-2xl shrink-0" />
        <div className="skeleton h-10 flex-1 rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
