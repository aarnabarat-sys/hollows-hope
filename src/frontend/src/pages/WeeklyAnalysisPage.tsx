import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWeeklyMoodAnalysis } from "@/hooks/useQueries";
import { Mood } from "@/hooks/useQueries";
import { MOOD_CONFIG } from "@/lib/moodConfig";
import { motion } from "motion/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const MOOD_MESSAGES: Record<Mood, string> = {
  [Mood.happy]:
    "You've been radiating joy this week! Keep nurturing what brings you happiness. 🌟",
  [Mood.sad]:
    "It's okay to feel sad sometimes. Be gentle with yourself — brighter days are ahead. 💙",
  [Mood.anxious]:
    "You've been carrying some worry lately. Try slow, deep breaths and remember you're capable. 🌿",
  [Mood.calm]: "Such a serene week! Your inner peace is your superpower. 🍃",
  [Mood.angry]:
    "Some strong feelings this week. Anger can signal what matters to us — channel it wisely. 🔥",
  [Mood.neutral]:
    "A steady, balanced week. Sometimes calm waters are exactly what we need. ⚖️",
  [Mood.excited]:
    "What a high-energy, vibrant week! Channel that excitement into your dreams. ✨",
  [Mood.grateful]:
    "A week full of gratitude — you've been counting your blessings. That's beautiful. 🙏",
};

export function WeeklyAnalysisPage() {
  const { data: moodStats, isLoading } = useWeeklyMoodAnalysis();

  const chartData = (moodStats || [])
    .map((mc) => ({
      mood: MOOD_CONFIG[mc.mood]?.label || mc.mood,
      moodKey: mc.mood,
      emoji: MOOD_CONFIG[mc.mood]?.emoji || "",
      count: Number(mc.count),
      fill: MOOD_CONFIG[mc.mood]?.color || "#3E8F90",
    }))
    .sort((a, b) => b.count - a.count);

  const dominantMood = chartData[0];
  const totalEntries = chartData.reduce((s, d) => s + d.count, 0);

  return (
    <main
      className="container mx-auto px-4 py-8 max-w-3xl"
      data-ocid="analysis.page"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <h1 className="font-display text-3xl font-bold text-foreground mb-1">
          Weekly Mood Analysis
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          Your emotional journey over the past 7 days
        </p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4" data-ocid="analysis.loading_state">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : chartData.length === 0 ? (
        <Card
          className="border-dashed border-2 border-border"
          data-ocid="analysis.empty_state"
        >
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-5xl mb-3">📊</span>
            <p className="font-medium text-foreground mb-1">No data yet</p>
            <p className="text-sm text-muted-foreground">
              Start writing diary entries to see your mood analysis.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {dominantMood && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <Card className="border-primary/30 bg-accent/40 shadow-card">
                <CardContent className="p-6 flex items-center gap-5">
                  <span className="text-5xl">{dominantMood.emoji}</span>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Dominant mood this week
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="font-display text-2xl font-bold text-foreground">
                        {dominantMood.mood}
                      </h2>
                      <Badge className="bg-primary text-primary-foreground">
                        {dominantMood.count} entries
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground/80">
                      {MOOD_MESSAGES[dominantMood.moodKey as Mood] ||
                        "Keep journaling to understand yourself better."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-border shadow-card">
              <CardHeader>
                <CardTitle className="font-display text-lg">
                  Mood Distribution ({totalEntries} total entries)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 8, right: 16, left: -16, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-30"
                    />
                    <XAxis
                      dataKey="mood"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(val, i) =>
                        `${chartData[i]?.emoji ?? ""} ${val}`
                      }
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number) => [value, "Entries"]}
                      labelFormatter={(label, payload) => {
                        const item = payload?.[0]?.payload;
                        return item ? `${item.emoji} ${label}` : label;
                      }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid oklch(0.88 0.030 196)",
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry) => (
                        <Cell key={entry.moodKey} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {chartData.map((item, i) => (
              <motion.div
                key={item.moodKey}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                data-ocid={`analysis.item.${i + 1}`}
              >
                <Card className="border-border text-center">
                  <CardContent className="py-4">
                    <span className="text-2xl block mb-1">{item.emoji}</span>
                    <p className="text-xs text-muted-foreground">{item.mood}</p>
                    <p className="font-bold text-foreground mt-1">
                      {item.count}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
