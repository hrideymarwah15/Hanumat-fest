import * as React from "react";
import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
      {...props}
    />
  );
}

// Sport Card Skeleton
function SportCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Skeleton className="aspect-sport-card w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
    </div>
  );
}

// Registration Card Skeleton
function RegistrationCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      <div className="flex gap-4">
        <Skeleton className="h-20 w-20 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  );
}

// Dashboard Stats Skeleton
function StatCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-16" />
    </div>
  );
}

// Notification Skeleton
function NotificationSkeleton() {
  return (
    <div className="flex gap-3 p-4 border-b">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}

// Table Row Skeleton
function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export {
  Skeleton,
  SportCardSkeleton,
  RegistrationCardSkeleton,
  StatCardSkeleton,
  NotificationSkeleton,
  TableRowSkeleton,
};
