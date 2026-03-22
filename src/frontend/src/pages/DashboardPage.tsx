import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfileContext } from "@/hooks/useProfileContext";
import { useEntries } from "@/hooks/useQueries";
import { MOOD_CONFIG } from "@/lib/moodConfig";
import { Link } from "@tanstack/react-router";
import {
  BarChart2,
  BookOpen,
  ChevronRight,
  MessageCircleHeart,
  PenLine,
} from "lucide-react";
import { motion } from "motion/react";

const QUICK_CARDS = [
  {
    to: "/new-entry",
    icon: PenLine,
    title: "Write Today's Entry",
    desc: "Capture your thoughts and feelings",
    color: "text-primary",
    bg: "bg-accent",
    ocid: "dashboard.primary_button",
  },
  {
    to: "/diary",
    icon: BookOpen,
    title: "View Diary",
    desc: "Browse all your past entries",
    color: "text-chart-2",
    bg: "bg-chart-2/10",
    ocid: "dashboard.secondary_button",
  },
  {
    to: "/analysis",
    icon: BarChart2,
    title: "Weekly Analysis",
    desc: "Understand your mood patterns",
    color: "text-chart-3",
    bg: "bg-chart-3/10",
    ocid: "dashboard.secondary_button",
  },
  {
    to: "/chat",
    icon: MessageCircleHeart,
    title: "Chat with Companion",
    desc: "Talk to your supportive AI friend",
    color: "text-chart-5",
    bg: "bg-chart-5/10",
    ocid: "dashboard.secondary_button",
  },
];

function formatDate(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DashboardPage() {
  const { displayName } = useProfileContext();
  const { data: entries, isLoading: entriesLoading } = useEntries();

  const greeting = displayName || "Friend";
  const recentEntries = (entries || []).slice(0, 3);

  return (
    <main className="container mx-auto px-4 py-8" data-ocid="dashboard.page">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mb-8"
      >
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
          Welcome back, <span className="text-primary">{greeting}</span> 🌿
        </h1>
        <p className="text-muted-foreground mt-1">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </motion.div>

      <section className="mb-10">
        <h2 className="font-display text-xl font-semibold text-foreground mb-4">
          Quick Access
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_CARDS.map((card, i) => (
            <motion.div
              key={card.to}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link to={card.to} className="block" data-ocid={card.ocid}>
                <Card className="h-full hover:shadow-card-hover transition-shadow duration-200 cursor-pointer border-border">
                  <CardContent className="p-5">
                    <div
                      className={`inline-flex p-3 rounded-xl ${card.bg} mb-3`}
                    >
                      <card.icon className={`h-5 w-5 ${card.color}`} />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {card.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{card.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section data-ocid="dashboard.section">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Recent Entries
          </h2>
          <Link to="/diary">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary"
              data-ocid="dashboard.link"
            >
              View all <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>

        {entriesLoading ? (
          <div className="space-y-3" data-ocid="dashboard.loading_state">
            {[1, 2, 3].map((n) => (
              <Skeleton key={n} className="h-24 w-full" />
            ))}
          </div>
        ) : recentEntries.length === 0 ? (
          <Card
            className="border-dashed border-2 border-border"
            data-ocid="dashboard.empty_state"
          >
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <PenLine className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="font-medium text-foreground mb-1">No entries yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Start your journey by writing your first diary entry.
              </p>
              <Link to="/new-entry">
                <Button
                  className="rounded-full bg-primary text-primary-foreground"
                  data-ocid="dashboard.primary_button"
                >
                  Write First Entry
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentEntries.map((entry, i) => {
              const mc = MOOD_CONFIG[entry.mood];
              return (
                <motion.div
                  key={entry.id.toString()}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  data-ocid={`dashboard.item.${i + 1}`}
                >
                  <Card className="border-border hover:shadow-card transition-shadow">
                    <CardContent className="p-4 flex items-start gap-3">
                      <span className="text-2xl mt-0.5">{mc?.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-semibold text-foreground truncate">
                            {entry.title}
                          </h3>
                          <Badge
                            variant="secondary"
                            className="shrink-0 text-xs"
                          >
                            {mc?.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {entry.body}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(entry.createdAt)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
