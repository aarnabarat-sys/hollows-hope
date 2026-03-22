import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActor } from "@/hooks/useActor";
import { useProfileContext } from "@/hooks/useProfileContext";
import { CheckCircle2, Loader2, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

export function ProfilePage() {
  const { actor } = useActor();
  // Use the shared context as the single source of truth for the name
  const { displayName, setDisplayName } = useProfileContext();

  const [name, setName] = useState(() => displayName || "");
  const [age, setAge] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!actor) return;
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Please enter a name.");
      return;
    }
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
      // Build profile object -- only include age if it was provided
      const profile: { name: string; age?: number } = { name: trimmed };
      if (ageNum !== undefined) profile.age = ageNum;

      await actor.saveCallerUserProfile(profile);

      // Update shared context + localStorage immediately so Dashboard shows it right away
      setDisplayName(trimmed);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      toast.success("Profile saved! Your name will now show on the dashboard.");
    } catch (err) {
      console.error("Save profile error:", err);
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
                This name appears on your dashboard greeting.
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : saved ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Saved!
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
