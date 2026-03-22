import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ChatMessage,
  DiaryEntry,
  MoodCount,
  UserProfile,
} from "../backend.d";
import { EntryMode, Mood } from "../backend.d";
import { useActor } from "./useActor";

export type { DiaryEntry, MoodCount, ChatMessage, UserProfile };
export { Mood, EntryMode };

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useEntries() {
  const { actor, isFetching } = useActor();
  return useQuery<DiaryEntry[]>({
    queryKey: ["entries"],
    queryFn: async () => {
      if (!actor) return [];
      const entries = await actor.getEntriesForCaller();
      return [...entries].sort((a, b) => Number(b.createdAt - a.createdAt));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      title: string;
      body: string;
      mood: Mood;
      aiPrompt: string | null;
      mode: EntryMode;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createEntry(
        params.title,
        params.body,
        params.mood,
        params.aiPrompt,
        params.mode,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
  });
}

export function useDeleteEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entryId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteEntry(entryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
  });
}

export function useUpdateEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      entryId: bigint;
      title: string;
      body: string;
      mood: Mood;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateEntry(
        params.entryId,
        params.title,
        params.body,
        params.mood,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
  });
}

export function useMoodPrompts(mood: Mood | null) {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["moodPrompts", mood],
    queryFn: async () => {
      if (!actor || !mood) return [];
      return actor.getPromptsForMood(mood);
    },
    enabled: !!actor && !isFetching && !!mood,
  });
}

export function useWeeklyMoodAnalysis() {
  const { actor, isFetching } = useActor();
  return useQuery<MoodCount[]>({
    queryKey: ["weeklyMood"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWeeklyMoodAnalysis();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useChatHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<ChatMessage[]>({
    queryKey: ["chatHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getChatHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (message: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.sendMessageToCompanion(message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatHistory"] });
    },
  });
}

export function useEndChatSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.endChatSession();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatHistory"] });
    },
  });
}
