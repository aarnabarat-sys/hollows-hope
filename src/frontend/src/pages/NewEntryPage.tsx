import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EntryMode, Mood, useCreateEntry } from "@/hooks/useQueries";
import { MOOD_CONFIG } from "@/lib/moodConfig";
import { MOOD_PROMPTS } from "@/lib/moodPrompts";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Loader2, PenLine, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const MOODS = Object.values(Mood);

export function NewEntryPage() {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [mode, setMode] = useState<"free" | "prompts">("free");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  const prompts = selectedMood ? MOOD_PROMPTS[selectedMood] : [];
  const createEntry = useCreateEntry();

  const handleSave = async () => {
    if (!selectedMood) {
      toast.error("Please select a mood first.");
      return;
    }
    if (!title.trim()) {
      toast.error("Please add a title.");
      return;
    }
    if (!body.trim()) {
      toast.error("Please write something in your entry.");
      return;
    }

    try {
      await createEntry.mutateAsync({
        title: title.trim(),
        body: body.trim(),
        mood: selectedMood,
        aiPrompt: selectedPrompt,
        mode: mode === "prompts" ? EntryMode.aiPrompted : EntryMode.freeWrite,
      });
      toast.success("Entry saved! 🌿");
      navigate({ to: "/diary" });
    } catch (e) {
      toast.error("Failed to save entry.");
      console.error(e);
    }
  };

  return (
    <main
      className="container mx-auto px-4 py-8 max-w-2xl"
      data-ocid="new_entry.page"
    >
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            data-ocid="new_entry.button"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
          New Entry
        </h1>
      </div>

      <Card className="mb-5 border-border shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg">
            How are you feeling?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {MOODS.map((mood) => {
              const mc = MOOD_CONFIG[mood];
              return (
                <button
                  type="button"
                  key={mood}
                  className={`mood-emoji-btn ${selectedMood === mood ? "selected" : ""}`}
                  onClick={() => setSelectedMood(mood)}
                  data-ocid="new_entry.toggle"
                >
                  <span className="text-2xl">{mc.emoji}</span>
                  <span className="text-xs text-muted-foreground">
                    {mc.label}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-5 border-border shadow-card">
        <CardContent className="pt-5">
          <p className="text-sm font-medium text-foreground mb-3">
            Choose your writing mode:
          </p>
          <div className="flex gap-3">
            <Button
              variant={mode === "free" ? "default" : "outline"}
              onClick={() => setMode("free")}
              className="flex-1 rounded-full gap-2"
              data-ocid="new_entry.toggle"
            >
              <PenLine className="h-4 w-4" /> Free Write
            </Button>
            <Button
              variant={mode === "prompts" ? "default" : "outline"}
              onClick={() => setMode("prompts")}
              className="flex-1 rounded-full gap-2"
              disabled={!selectedMood}
              data-ocid="new_entry.toggle"
            >
              <Sparkles className="h-4 w-4" /> AI Prompts
            </Button>
          </div>
        </CardContent>
      </Card>

      {mode === "prompts" && selectedMood && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
        >
          <Card className="border-primary/30 bg-accent/50 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base text-primary">
                Writing Prompts for Your Mood
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {prompts.map((prompt, i) => (
                <button
                  type="button"
                  key={prompt}
                  className={`w-full text-left text-sm px-4 py-3 rounded-xl border-2 transition-all duration-150 ${
                    selectedPrompt === prompt
                      ? "border-primary bg-card text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                  onClick={() => {
                    setSelectedPrompt(
                      selectedPrompt === prompt ? null : prompt,
                    );
                    if (selectedPrompt !== prompt && !body)
                      setBody(`${prompt}\n\n`);
                  }}
                  data-ocid={`new_entry.item.${i + 1}`}
                >
                  ✨ {prompt}
                </button>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Card className="mb-6 border-border shadow-card">
        <CardContent className="pt-5 space-y-4">
          <div>
            <Label
              htmlFor="entry-title"
              className="text-sm font-medium text-foreground block mb-1.5"
            >
              Entry Title
            </Label>
            <Input
              id="entry-title"
              placeholder="Give your entry a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl"
              data-ocid="new_entry.input"
            />
          </div>
          <div>
            <Label
              htmlFor="entry-body"
              className="text-sm font-medium text-foreground block mb-1.5"
            >
              Your Thoughts
            </Label>
            <Textarea
              id="entry-body"
              placeholder="Write freely... this is your safe space."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="rounded-xl min-h-[200px] resize-y"
              data-ocid="new_entry.textarea"
            />
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={createEntry.isPending}
        className="w-full rounded-full bg-primary text-primary-foreground py-6 text-base hover:opacity-90"
        data-ocid="new_entry.submit_button"
      >
        {createEntry.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
          </>
        ) : (
          "Save Entry 🌿"
        )}
      </Button>
    </main>
  );
}
