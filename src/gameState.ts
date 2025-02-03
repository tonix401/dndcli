export class GameState {
  theme: string | null;
  narrativeHistory: string[];
  choices: string[];

  constructor() {
    this.theme = null;
    this.narrativeHistory = [];
    this.choices = [];
  }

  addNarrative(narrative: string): void {
    this.narrativeHistory.push(narrative);
  }

  addChoice(choice: string): void {
    this.choices.push(choice);
  }
}
