export interface ConversationMessage {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp?: string;
}

/// TODO: MIGRATION TO CACHE SERVICE ///
export class GameState {
  private theme: string | null;
  private narrativeHistory: string[];
  private conversationHistory: ConversationMessage[];
  private choices: string[];
  private plotStage: number;
  private plotSummary: string;

  // Limit for how many history entries to store.
  private readonly maxHistoryItems: number = 50;

  constructor() {
    this.theme = null;
    this.narrativeHistory = [];
    this.conversationHistory = [];
    this.choices = [];
    this.plotStage = 1;
    this.plotSummary = "";
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
}
