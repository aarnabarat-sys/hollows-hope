import type { UserApprovalInfo } from "@/backend";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, ShieldOff, Users } from "lucide-react";

export function AdminPage() {
  const { actor } = useActor();

  const {
    data: users,
    isLoading,
    isError,
  } = useQuery<UserApprovalInfo[]>({
    queryKey: ["registeredUsers"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.listApprovals();
      } catch {
        throw new Error("unauthorized");
      }
    },
    enabled: !!actor,
    refetchInterval: 10000,
    retry: false,
  });

  if (isError) {
    return (
      <main className="container mx-auto px-4 py-16 max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldOff className="h-7 w-7 text-destructive" />
          </div>
        </div>
        <h1 className="font-display text-xl font-bold text-foreground mb-2">
          Access Denied
        </h1>
        <p className="text-sm text-muted-foreground">
          You don't have permission to view this page.
        </p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck className="h-6 w-6 text-primary" />
        <h1 className="font-display text-2xl font-bold text-foreground">
          Registered Users
        </h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Everyone who has signed up for Hollows Hope.
      </p>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : !users || users.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="admin.users.empty_state"
        >
          <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>No users registered yet.</p>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="admin.users.list">
          {users.map((item, idx) => (
            <div
              key={item.user.toString()}
              data-ocid={`admin.users.item.${idx + 1}`}
              className="flex items-center bg-card border border-border rounded-xl px-4 py-3 gap-3"
            >
              <Users className="h-4 w-4 text-muted-foreground shrink-0" />
              <p className="text-xs font-mono text-muted-foreground truncate">
                {item.user.toString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
