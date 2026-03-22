import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface DiaryEntry {
    id: bigint;
    title: string;
    body: string;
    mode: EntryMode;
    mood: Mood;
    createdAt: Time;
    aiPrompt?: string;
}
export interface MoodCount {
    mood: Mood;
    count: bigint;
}
export interface ChatMessage {
    message: string;
    fromUser: boolean;
}
export interface UserProfile {
    name: string;
}
export interface http_header {
    value: string;
    name: string;
}
export enum EntryMode {
    aiPrompted = "aiPrompted",
    freeWrite = "freeWrite"
}
export enum Mood {
    sad = "sad",
    anxious = "anxious",
    happy = "happy",
    angry = "angry",
    calm = "calm",
    grateful = "grateful",
    excited = "excited",
    neutral = "neutral"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export type ApprovalStatus =
    | { approved: null }
    | { pending: null }
    | { rejected: null };
export interface UserApprovalInfo {
    user: Principal;
    status: ApprovalStatus;
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createEntry(title: string, body: string, mood: Mood, aiPrompt: string | null, mode: EntryMode): Promise<bigint>;
    deleteEntry(entryId: bigint): Promise<void>;
    endChatSession(): Promise<void>;
    getAllEntries(): Promise<Array<DiaryEntry>>;
    getAllEntriesSortedByTitle(): Promise<Array<DiaryEntry>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChatHistory(): Promise<Array<ChatMessage>>;
    getEntriesForCaller(): Promise<Array<DiaryEntry>>;
    getEntriesForUser(user: Principal): Promise<Array<DiaryEntry>>;
    getPromptsForMood(mood: Mood): Promise<Array<string>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWeeklyMoodAnalysis(): Promise<Array<MoodCount>>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    requestApproval(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessageToCompanion(message: string): Promise<string>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateEntry(entryId: bigint, newTitle: string, newBody: string, newMood: Mood): Promise<void>;
}
