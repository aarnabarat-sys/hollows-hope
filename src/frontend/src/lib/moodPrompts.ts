import { Mood } from "../backend.d";

export const MOOD_PROMPTS: Record<Mood, string[]> = {
  [Mood.happy]: [
    "What made you feel happy today?",
    "How can you spread your happiness to others?",
    "Reflect on a moment of joy from your day.",
    "What are you grateful for right now?",
  ],
  [Mood.sad]: [
    "What's been weighing on your heart?",
    "Who can you reach out to for comfort?",
    "Describe a positive memory to uplift your spirits.",
    "What would you say to a friend feeling the same way?",
  ],
  [Mood.anxious]: [
    "What's causing you to feel worried?",
    "What strategies help you calm your mind?",
    "Reflect on a time when things worked out better than expected.",
    "What's one small thing you can control right now?",
  ],
  [Mood.calm]: [
    "What activities help you relax?",
    "How can you maintain your sense of calm throughout the day?",
    "Describe a peaceful moment you experienced recently.",
    "What does your ideal restful day look like?",
  ],
  [Mood.angry]: [
    "What's causing your frustration?",
    "How can you express your anger in a healthy way?",
    "Reflect on ways to let go of negative emotions.",
    "What would help you feel heard right now?",
  ],
  [Mood.neutral]: [
    "What's something you'd like to accomplish today?",
    "How can you add positivity to your routine?",
    "Reflect on your goals and aspirations.",
    "What's one thing you're looking forward to this week?",
  ],
  [Mood.excited]: [
    "What are you looking forward to?",
    "How can you prepare for upcoming opportunities?",
    "Who do you want to share your excitement with?",
    "What does this excitement tell you about what matters to you?",
  ],
  [Mood.grateful]: [
    "What are you thankful for today?",
    "How can you express gratitude to others?",
    "Who has made a difference in your life recently?",
    "What simple thing brought you joy today?",
  ],
};
