import { Skeleton } from "../ui/skeleton";

export function PackageSkeleton() {
  return (
    <div className="bg-card text-card-foreground rounded-xl p-6 border space-y-6">
      <Skeleton className="h-6 w-32" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-6 w-12" />
        <Skeleton className="h-6 w-32" />
      </div>
    </div>
  );
}
