import {
  addNarrative as csAddNarrative,
  getNarrativeHistory as csGetNarrativeHistory,
  addConversation as csAddConversation,
  getConversationHistory as csGetConversationHistory,
  addChoice as csAddChoice,
  getChoices as csGetChoices,
  updatePlot as csUpdatePlot,
  getPlotStage as csGetPlotStage,
  getPlotSummary as csGetPlotSummary,
  summarizeHistory as csSummarizeHistory,
  getChapters as csGetChapters,
  beginNewChapter as csBeginNewChapter,
  getCurrentChapter as csGetCurrentChapter,
  addObjective as csAddObjective,
  completeObjective as csCompleteObjective,
  shouldAdvanceChapter as csShouldAdvanceChapter,
  addOrUpdateCharacter as csAddOrUpdateCharacter,
  getImportantCharacters as csGetImportantCharacters,
  updateCharacterTrait as csUpdateCharacterTrait,
  getCharacterTraits as csGetCharacterTraits,
  addTheme as csAddTheme,
  getThemes as csGetThemes,
} from "@utilities/CacheService.js";
import {
  IGameState,
  ConversationMessage,
  Chapter,
  Character,
  CharacterTrait,
} from "@utilities/IGameState.js";
import { StoryPaceKey } from "@utilities/GameService.js";

// Re-export interfaces from IGameState so importing code doesn't need to change
export { ConversationMessage, Chapter };

/**
 * @deprecated Use CacheService functions instead. This class remains for backward compatibility. I'll delete this in a future change right now want to leave the imports as is.
 */
export class GameState implements IGameState {
  theme: string | null = null;
  narrativeHistory: string[] = [];
  conversationHistory: ConversationMessage[] = [];
  choices: string[] = [];
  plotStage: number = 1;
  plotSummary: string = "";
  currentChapter: Chapter;
  chapters: Chapter[] = [];
  characters: Map<string, Character> = new Map();
  characterTraits: CharacterTrait[] = [];
  themes: Set<string> = new Set();
  readonly maxHistoryItems: number = 50;
  storyPace: StoryPaceKey = "FAST";
  [key: string]: any;

  constructor() {
    this.currentChapter = {
      title: "Chapter 1: The Beginning",
      summary: "Your adventure begins",
      arc: "introduction",
      completedObjectives: [],
      pendingObjectives: [],
      characters: [],
      locations: [],
      metadata: {},
    };
  }
  getStoryPace(): StoryPaceKey {
    return this.storyPace;
  }

  setStoryPace(pace: StoryPaceKey): void {
    this.storyPace = pace;
  }
  // Getters and Setters for theme.
  getTheme(): string | null {
    return null;
  }

  setTheme(theme: string): void {}

  addNarrative(narrative: string): void {
    csAddNarrative(narrative);
  }

  getNarrativeHistory(): string[] {
    return csGetNarrativeHistory();
  }

  addConversation(message: ConversationMessage): void {
    csAddConversation(message);
  }

  getConversationHistory(): ConversationMessage[] {
    return csGetConversationHistory();
  }

  addChoice(choice: string): void {
    csAddChoice(choice);
  }

  getChoices(): string[] {
    return csGetChoices();
  }

  updatePlot(newStage: number, newSummary: string): void {
    csUpdatePlot(newStage, newSummary);
  }

  getPlotStage(): number {
    return csGetPlotStage();
  }

  getPlotSummary(): string {
    return csGetPlotSummary();
  }

  summarizeHistory(): string {
    return csSummarizeHistory();
  }

  getChapters(): Chapter[] {
    return csGetChapters();
  }

  beginNewChapter(title: string, summary: string, arc: Chapter["arc"]): void {
    csBeginNewChapter(title, summary, arc);
  }

  getCurrentChapter(): Chapter {
    return csGetCurrentChapter();
  }

  addObjective(objective: string): void {
    csAddObjective(objective);
  }

  completeObjective(objective: string): void {
    csCompleteObjective(objective);
  }

  shouldAdvanceChapter(): boolean {
    return csShouldAdvanceChapter();
  }

  addOrUpdateCharacter(name: string, info: Partial<Character>): void {
    csAddOrUpdateCharacter(name, info);
  }

  getImportantCharacters(): Array<{
    name: string;
    relationship: string;
    lastSeen: string;
  }> {
    return csGetImportantCharacters();
  }

  updateCharacterTrait(trait: string, delta: number): void {
    csUpdateCharacterTrait(trait, delta);
  }

  getCharacterTraits(): CharacterTrait[] {
    return csGetCharacterTraits();
  }

  addTheme(theme: string): void {
    csAddTheme(theme);
  }

  getThemes(): string[] {
    return csGetThemes();
  }
}
