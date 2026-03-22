import Time "mo:core/Time";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Order "mo:core/Order";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Mood = {
    #happy;
    #sad;
    #anxious;
    #calm;
    #angry;
    #neutral;
    #excited;
    #grateful;
  };

  module Mood {
    public func compare(mood1 : Mood, mood2 : Mood) : Order.Order {
      switch (mood1, mood2) {
        case (#happy, #happy) { #equal };
        case (#happy, _) { #less };
        case (_, #happy) { #greater };
        case (#sad, #sad) { #equal };
        case (#sad, _) { #less };
        case (_, #sad) { #greater };
        case (#anxious, #anxious) { #equal };
        case (#anxious, _) { #less };
        case (_, #anxious) { #greater };
        case (#calm, #calm) { #equal };
        case (#calm, _) { #less };
        case (_, #calm) { #greater };
        case (#angry, #angry) { #equal };
        case (#angry, _) { #less };
        case (_, #angry) { #greater };
        case (#neutral, #neutral) { #equal };
        case (#neutral, _) { #less };
        case (_, #neutral) { #greater };
        case (#excited, #excited) { #equal };
        case (#excited, _) { #less };
        case (_, #excited) { #greater };
        case (#grateful, #grateful) { #equal };
      };
    };
  };

  type EntryMode = {
    #freeWrite;
    #aiPrompted;
  };

  module EntryMode {
    public func compare(mode1 : EntryMode, mode2 : EntryMode) : Order.Order {
      switch (mode1, mode2) {
        case (#freeWrite, #freeWrite) { #equal };
        case (#freeWrite, _) { #less };
        case (_, #freeWrite) { #greater };
        case (#aiPrompted, #aiPrompted) { #equal };
      };
    };
  };

  type DiaryEntry = {
    id : Nat;
    title : Text;
    body : Text;
    mood : Mood;
    aiPrompt : ?Text;
    createdAt : Time.Time;
    mode : EntryMode;
  };

  module DiaryEntry {
    public func compare(entry1 : DiaryEntry, entry2 : DiaryEntry) : Order.Order {
      if (entry1.id < entry2.id) { return #less };
      if (entry1.id > entry2.id) { return #greater };
      #equal;
    };

    public func compareByTitle(entry1 : DiaryEntry, entry2 : DiaryEntry) : Order.Order {
      Text.compare(entry1.title, entry2.title);
    };
  };

  type MoodCount = {
    mood : Mood;
    count : Nat;
  };

  type ChatMessage = {
    fromUser : Bool;
    message : Text;
  };

  public type UserProfile = {
    name : Text;
  };

  var nextEntryId = 0;
  var responseIndex = 0;
  let diaryEntries = Map.empty<Principal, Map.Map<Nat, DiaryEntry>>();
  let chatSessions = Map.empty<Principal, List.List<ChatMessage>>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Companion responses: gentle, direct, warm -- speaks first, ends with one question
  let companionResponses : [Text] = [
    "Thank you for sharing that with me. It takes real courage to put your feelings into words, and I want you to know that whatever you're carrying right now, you don't have to hold it alone. You're allowed to feel exactly what you're feeling -- there's no rush to fix it or move past it. What's been weighing on you most today?",
    "I hear you. And I want you to know that showing up and being honest with yourself, even when it's hard, is something a lot of people never do. You're doing it right now, and that matters. I'm here with you fully. What do you think is at the heart of what you're feeling?",
    "What you're feeling is real, and it belongs here. You don't have to minimize it or explain it away. Sometimes just sitting with a feeling, instead of rushing past it, is the most honest thing we can do. I'm glad you're here. What's one feeling you haven't fully let yourself acknowledge yet?",
    "I want you to know that everything you bring here is safe. There's no judgment, no pressure to feel differently than you do. Your emotions are yours, and they make sense -- even when they feel tangled or hard to name. What feels the most unsettled in you right now?",
    "Being open about how you feel, even just to yourself, takes quiet strength. A lot of people spend years avoiding that. You're choosing something different, and I think that says a lot about you. What's one thing you wish someone truly understood about what you're going through?",
    "You don't have to rush through this or come out the other side with answers. Being present with what you're feeling is enough for right now. I'm here, and I'm not going anywhere. Is there something you've been holding inside that you haven't said out loud yet?",
    "Sometimes the hardest part is feeling like no one around you really gets it. I want to understand -- not just respond, but actually be with you in this. What you share here matters to me. What part of this is hardest to explain to the people around you?",
    "There's a quiet strength in the fact that you keep going, even on the heavy days. You might not feel it from the inside, but it's there. The fact that you're still here, still reflecting -- that's not small. What do you think has kept you going through the harder moments?",
    "Healing isn't a straight line. There are good days and hard ones, and both are part of the process. You're not behind, and you're not broken. You're just human, doing your best with what you have. What does a good day feel like for you lately?",
    "I'm glad you have a place to come and sort through things, even a little at a time. I care about how you're really doing -- not in a surface way, but in the way where the details matter. What would you most want me to understand about what you're going through right now?",
    "You deserve space to feel things without having to fix them right away. Sadness, anger, confusion -- they're not problems. They're signals worth listening to. I want to give you that space. Which emotion have you been trying hardest to push away lately?",
    "There's something meaningful about being honest with yourself instead of just pushing through. The messy, complicated, hard-to-name parts of how you feel belong here too. I'm listening. What's the one thought that keeps coming back to you, no matter how much you try to quiet it?",
    "The bravest thing sometimes is just admitting that something hurts -- not dramatizing it, not minimizing it, just letting it be real. That's what you're doing right now. I see it, even if it doesn't feel like bravery from the inside. What do you most need right now, even if you haven't let yourself ask for it?",
    "People who take time to really reflect on how they're feeling tend to understand themselves in a way that's quietly powerful. It doesn't always feel that way from the inside, I know. But you're building something real here, one conversation at a time. What's something about yourself you've come to understand more lately?",
    "I just want to be here with you for a moment, without rushing to say the right thing. Sometimes presence is more valuable than advice. You're not talking into a void -- I'm genuinely here, and what you share matters. What's the one thing you'd say right now if you knew someone was truly listening?",
  ];

  func getCompanionResponse(messageLen : Nat) : Text {
    let idx = (responseIndex + messageLen) % companionResponses.size();
    responseIndex := (responseIndex + 1) % companionResponses.size();
    companionResponses[idx];
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Diary Entry CRUD
  public shared ({ caller }) func createEntry(title : Text, body : Text, mood : Mood, aiPrompt : ?Text, mode : EntryMode) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create diary entries");
    };

    let entry : DiaryEntry = {
      id = nextEntryId;
      title;
      body;
      mood;
      aiPrompt;
      createdAt = Time.now();
      mode;
    };

    switch (diaryEntries.get(caller)) {
      case (null) {
        let userEntries = Map.empty<Nat, DiaryEntry>();
        userEntries.add(nextEntryId, entry);
        diaryEntries.add(caller, userEntries);
      };
      case (?userEntries) {
        userEntries.add(nextEntryId, entry);
      };
    };

    nextEntryId += 1;
    entry.id;
  };

  public query ({ caller }) func getEntriesForUser(user : Principal) : async [DiaryEntry] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own diary entries");
    };

    switch (diaryEntries.get(user)) {
      case (null) { [] };
      case (?userEntries) { userEntries.values().toArray().sort() };
    };
  };

  public query ({ caller }) func getEntriesForCaller() : async [DiaryEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view diary entries");
    };

    switch (diaryEntries.get(caller)) {
      case (null) { [] };
      case (?userEntries) { userEntries.values().toArray().sort() };
    };
  };

  public shared ({ caller }) func updateEntry(entryId : Nat, newTitle : Text, newBody : Text, newMood : Mood) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update diary entries");
    };

    switch (diaryEntries.get(caller)) {
      case (null) { Runtime.trap("Entry not found") };
      case (?userEntries) {
        switch (userEntries.get(entryId)) {
          case (null) { Runtime.trap("Entry not found") };
          case (?entry) {
            let updatedEntry : DiaryEntry = {
              id = entry.id;
              title = newTitle;
              body = newBody;
              mood = newMood;
              aiPrompt = entry.aiPrompt;
              createdAt = entry.createdAt;
              mode = entry.mode;
            };
            userEntries.add(entryId, updatedEntry);
          };
        };
      };
    };
  };

  public shared ({ caller }) func deleteEntry(entryId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete diary entries");
    };

    switch (diaryEntries.get(caller)) {
      case (null) { Runtime.trap("Entry not found") };
      case (?userEntries) {
        if (not userEntries.containsKey(entryId)) {
          Runtime.trap("Entry not found");
        };
        userEntries.remove(entryId);
      };
    };
  };

  // Weekly Mood Analysis
  public query ({ caller }) func getWeeklyMoodAnalysis() : async [MoodCount] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view mood analysis");
    };

    switch (diaryEntries.get(caller)) {
      case (null) { [] };
      case (?userEntries) {
        let now = Time.now();
        let weekAgo = now - 7 * 24 * 60 * 60 * 1000000000;

        let moods = userEntries.values().toArray().filter(
          func(entry) { entry.createdAt >= weekAgo }
        ).map(func(entry) { entry.mood });

        let moodArray = [#happy, #sad, #anxious, #calm, #angry, #neutral, #excited, #grateful];
        moodArray.map(
          func(mood) {
            let count = moods.filter(func(m) { Mood.compare(m, mood) == #equal }).size();
            { mood; count };
          }
        );
      };
    };
  };

  // Chat with AI Companion
  public query ({ caller }) func getChatHistory() : async [ChatMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view chat history");
    };

    switch (chatSessions.get(caller)) {
      case (null) { [] };
      case (?messages) { messages.toArray() };
    };
  };

  public shared ({ caller }) func sendMessageToCompanion(message : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can chat with companion");
    };

    let userMessage : ChatMessage = {
      fromUser = true;
      message;
    };

    let messages = switch (chatSessions.get(caller)) {
      case (null) { List.empty<ChatMessage>() };
      case (?msgs) { msgs };
    };
    messages.add(userMessage);
    chatSessions.add(caller, messages);

    let response = getCompanionResponse(message.size());

    let aiMessage : ChatMessage = {
      fromUser = false;
      message = response;
    };

    messages.add(aiMessage);
    chatSessions.add(caller, messages);

    response;
  };

  public shared ({ caller }) func endChatSession() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can end chat sessions");
    };
    chatSessions.remove(caller);
  };

  // Mood-Based Prompt Suggestions
  public query ({ caller }) func getPromptsForMood(mood : Mood) : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get mood-based prompts");
    };

    switch (mood) {
      case (#happy) {
        [
          "What made you feel happy today?",
          "How can you spread your happiness to others?",
          "Reflect on a moment of joy from your day.",
          "What are you grateful for right now?",
        ];
      };
      case (#sad) {
        [
          "What's been weighing on your heart?",
          "Who can you reach out to for comfort?",
          "Describe a positive memory to uplift your spirits.",
        ];
      };
      case (#anxious) {
        [
          "What's causing you to feel worried?",
          "What strategies help you calm your mind?",
          "Reflect on a time when things worked out better than expected.",
        ];
      };
      case (#calm) {
        [
          "What activities help you relax?",
          "How can you maintain your sense of calm throughout the day?",
          "Describe a peaceful moment you experienced recently.",
        ];
      };
      case (#angry) {
        [
          "What's causing your frustration?",
          "How can you express your anger in a healthy way?",
          "Reflect on ways to let go of negative emotions.",
        ];
      };
      case (#neutral) {
        [
          "What's something you'd like to accomplish today?",
          "How can you add positivity to your routine?",
          "Reflect on your goals and aspirations.",
        ];
      };
      case (#excited) {
        [
          "What are you looking forward to?",
          "How can you prepare for upcoming opportunities?",
        ];
      };
      case (#grateful) {
        [
          "What are you thankful for today?",
          "How can you express gratitude to others?",
        ];
      };
    };
  };

  // Admin-only: Get all diary entries
  public shared ({ caller }) func getAllEntries() : async [DiaryEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all entries");
    };

    diaryEntries.values().toArray().map(
        func(userEntries) {
          userEntries.values().toArray();
        }
      ).flatten();
  };

  // Admin-only: Get all diary entries sorted by title
  public shared ({ caller }) func getAllEntriesSortedByTitle() : async [DiaryEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all entries");
    };

    (await getAllEntries()).sort(DiaryEntry.compareByTitle);
  };
};
