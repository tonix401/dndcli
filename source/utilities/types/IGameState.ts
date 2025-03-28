import { StoryPaceKey } from "@utilities/GameService.js";

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
  locations: string[];
  metadata: {
    lastIntent?: string;
    lastTone?: string;
    [key: string]: any;
  };
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

/**
 * Interface for just the data structure of game state (no methods)
 * Used for configuration defaults and serialization
 */
export interface IGameStateData {
  theme: string | null;
  narrativeHistory: string[];
  conversationHistory: ConversationMessage[];
  choices: string[];
  plotStage: number;
  plotSummary: string;
  currentChapter: Chapter;
  chapters: Chapter[];
  characters: Map<string, Character> | Record<string, Character>; // Allow regular objects in config
  characterTraits: CharacterTrait[];
  themes: Set<string> | string[]; // Allow arrays in config
  maxHistoryItems?: number;
  storyPace: StoryPaceKey;
}

/**
 * Complete game state interface with methods and data
 */
export interface IGameState
  extends Omit<IGameStateData, "characters" | "themes"> {
  // Ensure these are the proper types in the full interface
  characters: Map<string, Character>;
  themes: Set<string>;

  // Methods
  addNarrative(narrative: string): void;

  getNarrativeHistory(): string[];

  addConversation(message: ConversationMessage): void;

  getConversationHistory(): ConversationMessage[];

  getImportantCharacters(): Array<{
    name: string;
    relationship: string;
    lastSeen?: string;
  }>;

  addChoice(choice: string): void;

  getChoices(): string[];

  updatePlot(newStage: number, newSummary: string): void;

  getPlotStage(): number;

  getPlotSummary(): string;

  summarizeHistory(): string;

  getCurrentChapter(): Chapter;

  beginNewChapter(title: string, summary: string, arc: Chapter["arc"]): void;

  addObjective(objective: string): void;

  completeObjective(objective: string): void;

  removeObjective(objective: string): void;

  shouldAdvanceChapter(): boolean;

  setStoryPace(pace: StoryPaceKey): void;

  getTheme(): string | null;

  setTheme(theme: string): void;

  getChapters(): Chapter[];

  addOrUpdateCharacter(name: string, info: Partial<Character>): void;

  updateCharacterTrait(trait: string, delta: number): void;

  getCharacterTraits(): CharacterTrait[];

  addTheme(theme: string): void;

  getThemes(): string[];

  getStoryPace(): StoryPaceKey;

  // Allow other properties for flexibility
  [key: string]: any;
}
