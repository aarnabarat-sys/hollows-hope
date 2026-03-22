import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import type { Principal } from "@dfinity/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  Clock,
  ShieldCheck,
  ShieldOff,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

type ApprovalStatus =
  | { approved: null }
  | { pending: null }
  | { rejected: null };

type UserApprovalInfo = {
  user: Principal;
  status: ApprovalStatus;
};

export function AdminPage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const {
    data: approvals,
    isLoading,
    isError,
  } = useQuery<UserApprovalInfo[]>({
    queryKey: ["adminApprovals"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await (actor.listApprovals() as Promise<UserApprovalInfo[]>);
      } catch {
        throw new Error("unauthorized");
      }
    },
    enabled: !!actor,
    refetchInterval: 10000,
    retry: false,
  });

  const setApproval = useMutation({
    mutationFn: async ({
      user,
      approve,
    }: { user: Principal; approve: boolean }) => {
      if (!actor) throw new Error("Not connected");
      const status: ApprovalStatus = approve
        ? { approved: null }
        : { rejected: null };
      return actor.setApproval(user, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminApprovals"] });
      toast.success("User status updated");
    },
    onError: () => toast.error("Failed to update user status"),
  });

  const getStatusLabel = (status: ApprovalStatus) => {
    if ("approved" in status)
      return {
        label: "Approved",
        color: "default" as const,
        icon: <CheckCircle className="h-3 w-3" />,
      };
    if ("rejected" in status)
      return {
        label: "Rejected",
        color: "destructive" as const,
        icon: <XCircle className="h-3 w-3" />,
      };
    return {
      label: "Pending",
      color: "secondary" as const,
      icon: <Clock className="h-3 w-3" />,
    };
  };

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
      ) : !approvals || approvals.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Clock className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>No users registered yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {approvals.map((item) => {
            const { label, color, icon } = getStatusLabel(item.status);
            return (
              <div
                key={item.user.toString()}
                className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3 gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-mono text-muted-foreground truncate">
                    {item.user.toString()}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge
                      variant={color}
                      className="text-xs flex items-center gap-1"
                    >
                      {icon} {label}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {!("approved" in item.status) && (
                    <Button
                      size="sm"
                      className="rounded-full text-xs h-7"
                      onClick={() =>
                        setApproval.mutate({ user: item.user, approve: true })
                      }
                      disabled={setApproval.isPending}
                    >
                      Approve
                    </Button>
                  )}
                  {!("rejected" in item.status) && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="rounded-full text-xs h-7"
                      onClick={() =>
                        setApproval.mutate({ user: item.user, approve: false })
                      }
                      disabled={setApproval.isPending}
                    >
                      Reject
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
