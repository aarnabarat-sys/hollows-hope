import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActor } from "@/hooks/useActor";
import { useUserProfile } from "@/hooks/useQueries";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function ProfilePage() {
  const { data: profile, isLoading } = useUserProfile();
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setAge(profile.age != null ? String(profile.age) : "");
    }
  }, [profile]);

  async function handleSave() {
    if (!actor) return;
    setSaving(true);
    try {
      const ageNum = age.trim() !== "" ? Number(age) : undefined;
      if (
        ageNum !== undefined &&
        (Number.isNaN(ageNum) || ageNum < 1 || ageNum > 120)
      ) {
        toast.error("Please enter a valid age between 1 and 120.");
        setSaving(false);
        return;
      }
      await actor.saveCallerUserProfile({
        name: name.trim(),
        age: ageNum,
      });
      await queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main
      className="container mx-auto px-4 py-8 max-w-lg"
      data-ocid="profile.page"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-accent">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              My Profile
            </h1>
            <p className="text-sm text-muted-foreground">
              Update your name and age
            </p>
          </div>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Personal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    placeholder="What should we call you?"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={50}
                    data-ocid="profile.input"
                  />
                  <p className="text-xs text-muted-foreground">
                    This name appears on your dashboard and diary.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Your age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    min={1}
                    max={120}
                    data-ocid="profile.input"
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional. Helps personalise your experience.
                  </p>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={saving || name.trim() === ""}
                  className="w-full rounded-full bg-primary text-primary-foreground hover:opacity-90"
                  data-ocid="profile.primary_button"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Saving...
                    </>
                  ) : saved ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Saved!
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
