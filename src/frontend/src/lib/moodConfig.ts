import { Mood } from "../backend.d";

export const MOOD_CONFIG: Record<
  Mood,
  { emoji: string; label: string; color: string }
> = {
  [Mood.happy]: { emoji: "😊", label: "Happy", color: "#22c55e" },
  [Mood.sad]: { emoji: "😢", label: "Sad", color: "#6b89ff" },
  [Mood.anxious]: { emoji: "😰", label: "Anxious", color: "#f97316" },
  [Mood.calm]: { emoji: "😌", label: "Calm", color: "#3E8F90" },
  [Mood.angry]: { emoji: "😠", label: "Angry", color: "#ef4444" },
  [Mood.neutral]: { emoji: "😐", label: "Neutral", color: "#94a3b8" },
  [Mood.excited]: { emoji: "🤩", label: "Excited", color: "#f59e0b" },
  [Mood.grateful]: { emoji: "🙏", label: "Grateful", color: "#a855f7" },
};
