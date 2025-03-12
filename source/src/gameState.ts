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

// All functionality has been fully migrated to CacheService.ts
// TODO: Still havent finished migrating it so it is not yet deleted
export class GameState {
  private theme: string | null;
  private narrativeHistory: string[];
  private conversationHistory: ConversationMessage[];
  private choices: string[];
  private plotStage: number;
  private plotSummary: string;
  private currentChapter!: Chapter;
  private chapters: Chapter[] = [];
  private characters: Map<
    string,
    {
      description: string;
      relationship: string;
      lastSeen: string;
      importance: number;
    }
  > = new Map();
  private characterTraits: Array<{
    name: string;
    level: number;
    description: string;
  }> = [];
  private themes: Set<string> = new Set();

  // Limit for how many history entries to store.
  private readonly maxHistoryItems: number = 50;
  constructor() {
    this.theme = null;
    this.narrativeHistory = [];
    this.conversationHistory = [];
    this.choices = [];
    this.plotStage = 1;
    this.plotSummary = "";

    // Initialize the first chapter in the constructor
    this.beginNewChapter(
      "Chapter 1: The Beginning",
      "Your adventure begins",
      "introduction"
    );
  }

  // Getters and Setters for theme.
  getTheme(): string | null {
    return this.theme;
  }
  setTheme(theme: string): void {
    this.theme = theme;
  }

  // Add a narrative entry.
  addNarrative(narrative: string): void {
    this.narrativeHistory.push(narrative);
    if (this.narrativeHistory.length > this.maxHistoryItems) {
      this.narrativeHistory.shift();
    }
  }
  getNarrativeHistory(): string[] {
    return this.narrativeHistory;
  }

  // Add a conversation message.
  addConversation(message: ConversationMessage): void {
    this.conversationHistory.push(message);
    if (this.conversationHistory.length > this.maxHistoryItems) {
      this.conversationHistory.shift();
    }
  }
  getConversationHistory(): ConversationMessage[] {
    return this.conversationHistory;
  }

  // Add a choice.
  addChoice(choice: string): void {
    this.choices.push(choice);
  }
  getChoices(): string[] {
    return this.choices;
  }

  // Update plot stage and summary.
  updatePlot(newStage: number, newSummary: string): void {
    this.plotStage = newStage;
    this.plotSummary = newSummary;
  }
  getPlotStage(): number {
    return this.plotStage;
  }
  getPlotSummary(): string {
    return this.plotSummary;
  }

  // Optionally, generate a summary from the last few narrative entries.
  summarizeHistory(): string {
    const summaryCount = 3;
    return this.narrativeHistory.slice(-summaryCount).join("\n");
  }

  // Chapter management

  getChapters(): Chapter[] {
    return [...this.chapters];
  }

  beginNewChapter(title: string, summary: string, arc: Chapter["arc"]): void {
    if (this.currentChapter) {
      this.chapters.push(this.currentChapter);
    }
    this.currentChapter = {
      title,
      summary,
      arc,
      completedObjectives: [],
      pendingObjectives: [],
      characters: [],
    };
  }

  getCurrentChapter(): Chapter {
    // Initialize a default chapter if none exists
    if (!this.currentChapter) {
      this.beginNewChapter(
        "Chapter 1: The Beginning",
        "Your adventure begins",
        "introduction"
      );
    }
    return this.currentChapter;
  }

  addObjective(objective: string): void {
    if (!this.currentChapter) {
      this.beginNewChapter(
        "Chapter 1",
        "Your adventure begins",
        "introduction"
      );
    }
    this.currentChapter.pendingObjectives.push(objective);
  }

  completeObjective(objective: string): void {
    if (!this.currentChapter) return;

    const index = this.currentChapter.pendingObjectives.findIndex(
      (obj) => obj === objective
    );
    if (index !== -1) {
      const completed = this.currentChapter.pendingObjectives.splice(
        index,
        1
      )[0];
      this.currentChapter.completedObjectives.push(completed);
    }
  }

  shouldAdvanceChapter(): boolean {
    // Logic to determine if chapter should advance
    // Example: if 75% of objectives are complete or N choices made since chapter start
    if (!this.currentChapter) return false;

    const totalObjectives =
      this.currentChapter.pendingObjectives.length +
      this.currentChapter.completedObjectives.length;

    if (totalObjectives === 0) return false;

    const completionRate =
      this.currentChapter.completedObjectives.length / totalObjectives;
    return completionRate >= 0.75;
  }

  // Character management
  addOrUpdateCharacter(
    name: string,
    info: Partial<{
      description: string;
      relationship: string;
      lastSeen: string;
      importance: number;
    }>
  ): void {
    const existing = this.characters.get(name) || {
      description: "",
      relationship: "neutral",
      lastSeen: "",
      importance: 5,
    };
    this.characters.set(name, { ...existing, ...info });

    // Add to chapter characters if important
    if (
      (info.importance || existing.importance) > 7 &&
      this.currentChapter &&
      !this.currentChapter.characters.includes(name)
    ) {
      this.currentChapter.characters.push(name);
    }
  }

  getImportantCharacters(): Array<{
    name: string;
    relationship: string;
    lastSeen: string;
  }> {
    return Array.from(this.characters.entries())
      .filter(([_, info]) => info.importance > 6)
      .map(([name, info]) => ({
        name,
        relationship: info.relationship,
        lastSeen: info.lastSeen,
      }));
  }

  // Character trait management
  updateCharacterTrait(trait: string, delta: number): void {
    const existing = this.characterTraits.find(
      (t) => t.name.toLowerCase() === trait.toLowerCase()
    );

    if (existing) {
      existing.level = Math.max(1, Math.min(10, existing.level + delta));
    } else {
      this.characterTraits.push({
        name: trait,
        level: 5 + delta,
        description: `Your character has demonstrated ${trait}`,
      });
    }
  }

  getCharacterTraits(): Array<{
    name: string;
    level: number;
    description: string;
  }> {
    return this.characterTraits;
  }

  // Theme management
  addTheme(theme: string): void {
    this.themes.add(theme);
  }

  getThemes(): string[] {
    return Array.from(this.themes);
  }
}
