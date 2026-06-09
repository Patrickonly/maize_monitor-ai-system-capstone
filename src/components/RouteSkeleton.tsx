import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export const RouteSkeleton = () => {
  return (
    <div className="min-h-screen bg-background p-5 md:p-7">
      <motion.div
        initial={{ opacity: 0.4 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-6xl space-y-6"
      >
        <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/70 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border/60 bg-card/70 p-4">
              <Skeleton className="mb-4 h-9 w-9 rounded-lg" />
              <Skeleton className="mb-2 h-6 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-card/70 p-5">
            <Skeleton className="mb-4 h-5 w-40" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/70 p-5">
            <Skeleton className="mb-4 h-5 w-44" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
