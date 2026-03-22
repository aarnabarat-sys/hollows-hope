import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteEntry, useEntries } from "@/hooks/useQueries";
import type { DiaryEntry } from "@/hooks/useQueries";
import { MOOD_CONFIG } from "@/lib/moodConfig";
import { BookOpen, ChevronDown, ChevronUp, Search, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

function formatDate(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function EntryCard({ entry, index }: { entry: DiaryEntry; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const deleteEntry = useDeleteEntry();
  const mc = MOOD_CONFIG[entry.mood];

  const handleDelete = async () => {
    try {
      await deleteEntry.mutateAsync(entry.id);
      toast.success("Entry deleted.");
    } catch {
      toast.error("Failed to delete entry.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      data-ocid={`diary.item.${index + 1}`}
    >
      <Card className="border-border hover:shadow-card transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <span className="text-3xl mt-1">{mc?.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-display font-semibold text-foreground">
                  {entry.title}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {mc?.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {formatDate(entry.createdAt)}
              </p>
              <p
                className={`text-sm text-muted-foreground ${expanded ? "" : "line-clamp-2"}`}
              >
                {entry.body}
              </p>
              {entry.aiPrompt && expanded && (
                <p className="text-xs text-primary mt-2 bg-accent/50 rounded-lg px-3 py-2">
                  ✨ Prompt: {entry.aiPrompt}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded((e) => !e)}
              className="text-xs text-muted-foreground"
              data-ocid={`diary.toggle.${index + 1}`}
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Collapse
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Read more
                </>
              )}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-destructive ml-auto"
                  data-ocid={`diary.delete_button.${index + 1}`}
                >
                  <Trash2 className="h-3 w-3 mr-1" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent data-ocid="diary.dialog">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Entry?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this diary entry. This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-ocid="diary.cancel_button">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground"
                    data-ocid="diary.confirm_button"
                  >
                    {deleteEntry.isPending ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function DiaryFeedPage() {
  const { data: entries, isLoading } = useEntries();
  const [search, setSearch] = useState("");

  const filtered = (entries || []).filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.body.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <main
      className="container mx-auto px-4 py-8 max-w-2xl"
      data-ocid="diary.page"
    >
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-foreground mb-1">
          My Diary
        </h1>
        <p className="text-muted-foreground text-sm">
          {(entries || []).length} entries written
        </p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search entries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 rounded-full"
          data-ocid="diary.search_input"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4" data-ocid="diary.loading_state">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-32 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card
          className="border-dashed border-2 border-border"
          data-ocid="diary.empty_state"
        >
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="font-medium text-foreground mb-1">
              {search ? "No entries found" : "Your diary is empty"}
            </p>
            <p className="text-sm text-muted-foreground">
              {search
                ? "Try a different search term"
                : "Start writing to fill these pages with your story."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((entry, i) => (
              <EntryCard key={entry.id.toString()} entry={entry} index={i} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </main>
  );
}
