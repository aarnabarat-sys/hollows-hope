import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { Navigate } from "@tanstack/react-router";
import { type ReactNode, useEffect } from "react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching } = useActor();

  // Fire-and-forget: register user in the approval list so admin can see who signed up
  useEffect(() => {
    if (actor && !isFetching && identity) {
      actor.requestApproval().catch(() => {
        // Silently ignore -- already registered or not supported
      });
    }
  }, [actor, isFetching, identity]);

  if (isInitializing) {
    return (
      <div className="container mx-auto p-8 space-y-4">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!identity) {
    return <Navigate to="/auth" />;
  }

  return <>{children}</>;
}
