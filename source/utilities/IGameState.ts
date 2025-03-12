export interface ConversationMessage {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface Chapter {
  title: string;
  summary: string;
  arc:
    | "introduction"
    | "rising-action"
    | "climax"
    | "falling-action"
    | "resolution";
  completedObjectives: string[];
  pendingObjectives: string[];
  characters: string[];
}

export interface Character {
  description: string;
  relationship: string;
  lastSeen: string;
  importance: number;
}

export interface CharacterTrait {
  name: string;
  level: number;
  description: string;
}

export interface IGameState {
  theme: string | null;
  narrativeHistory: string[];
  conversationHistory: ConversationMessage[];
  choices: string[];
  plotStage: number;
  plotSummary: string;
  currentChapter: Chapter;
  chapters: Chapter[];
  characters: Map<string, Character>;
  characterTraits: CharacterTrait[];
  themes: Set<string>;
  maxHistoryItems?: number;
}

//TODO: Migration in progress
