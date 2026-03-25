import { UserRole } from "@/backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, ShieldCheck, ShieldOff, Star, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const TEAM_KEY = "hollows_hope_team_members";

function loadTeam(): Set<string> {
  try {
    const raw = localStorage.getItem(TEAM_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveTeam(set: Set<string>) {
  localStorage.setItem(TEAM_KEY, JSON.stringify([...set]));
}

export function AdminPage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [teamMembers, setTeamMembers] = useState<Set<string>>(loadTeam);
  const [grantPrincipal, setGrantPrincipal] = useState("");

  const { data: isAdmin, isLoading: roleLoading } = useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor,
  });

  const { data: users, isLoading: usersLoading } = useQuery<Principal[]>({
    queryKey: ["registeredUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRegisteredUsers();
    },
    enabled: !!actor && isAdmin === true,
    refetchInterval: 15000,
    retry: false,
  });

  const claimAdminMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.claimAdminFirstCaller();
    },
    onSuccess: (becameAdmin) => {
      if (becameAdmin) {
        toast.success("You are now the admin!");
        queryClient.invalidateQueries({ queryKey: ["isCallerAdmin"] });
      } else {
        toast.error("Admin has already been claimed by another account.");
      }
    },
    onError: () => {
      toast.error("Something went wrong. Try again.");
    },
  });

  const grantAdminMutation = useMutation({
    mutationFn: async (principalStr: string) => {
      if (!actor) throw new Error("Not connected");
      const p = Principal.fromText(principalStr);
      await actor.assignCallerUserRole(p, UserRole.admin);
    },
    onSuccess: () => {
      toast.success("Admin access granted!");
      setGrantPrincipal("");
    },
    onError: () => {
      toast.error("Failed to grant admin. Check the principal ID.");
    },
  });

  const toggleTeam = (principal: string) => {
    setTeamMembers((prev) => {
      const next = new Set(prev);
      if (next.has(principal)) next.delete(principal);
      else next.add(principal);
      saveTeam(next);
      return next;
    });
  };

  const copyPrincipal = (p: string) => {
    navigator.clipboard.writeText(p);
    toast.success("Copied!");
  };

  if (roleLoading) {
    return (
      <main className="container mx-auto px-4 py-16 max-w-md">
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="container mx-auto px-4 py-16 max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldOff className="h-7 w-7 text-destructive" />
            </div>
          </div>
          <h1 className="font-display text-xl font-bold text-foreground mb-2">
            Claim Admin Access
          </h1>
          <p className="text-sm text-muted-foreground">
            The first person to click the button below becomes the admin.
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <Button
            className="w-full rounded-full"
            disabled={claimAdminMutation.isPending}
            onClick={() => claimAdminMutation.mutate()}
          >
            {claimAdminMutation.isPending ? "Claiming..." : "Become Admin"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            If admin has already been claimed, this will not work.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck className="h-6 w-6 text-primary" />
        <h1 className="font-display text-2xl font-bold text-foreground">
          Admin Panel
        </h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        View all registered users and grant admin access by principal ID.
      </p>

      <div className="bg-card border border-border rounded-2xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" /> Grant Admin by
          Principal ID
        </h2>
        <div className="flex gap-2">
          <Input
            placeholder="Paste principal ID here"
            value={grantPrincipal}
            onChange={(e) => setGrantPrincipal(e.target.value)}
            className="font-mono text-xs"
          />
          <Button
            size="sm"
            className="shrink-0"
            disabled={!grantPrincipal.trim() || grantAdminMutation.isPending}
            onClick={() => grantAdminMutation.mutate(grantPrincipal.trim())}
          >
            {grantAdminMutation.isPending ? "..." : "Grant"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Copy a principal ID from the list below and paste it here to give that
          user admin access.
        </p>
      </div>

      {usersLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : !users || users.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>No users registered yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground mb-3">
            {users.length} registered user{users.length !== 1 ? "s" : ""}
          </p>
          {users.map((principal, idx) => {
            const principalStr = principal.toString();
            const isTeam = teamMembers.has(principalStr);
            return (
              <div
                key={principalStr}
                className="flex items-center bg-card border border-border rounded-xl px-4 py-3 gap-3"
              >
                <span className="text-xs text-muted-foreground shrink-0">
                  #{idx + 1}
                </span>
                <p className="text-xs font-mono text-muted-foreground truncate flex-1">
                  {principalStr}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="shrink-0 h-7 w-7 p-0"
                  title="Copy principal ID"
                  onClick={() => copyPrincipal(principalStr)}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="shrink-0 h-7 w-7 p-0"
                  title={isTeam ? "Remove from team" : "Mark as team member"}
                  onClick={() => toggleTeam(principalStr)}
                >
                  <Star
                    className={`h-4 w-4 ${
                      isTeam
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
