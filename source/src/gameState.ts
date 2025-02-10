export class GameState {
  theme: string | null;
  narrativeHistory: string[];
  conversationHistory: any[];
  choices: string[];
  plotStage: number;
  plotSummary: string;

  constructor() {
    this.theme = null;
    this.narrativeHistory = [];
    this.conversationHistory = [];
    this.choices = [];
    this.plotStage = 1;
    this.plotSummary =
      "Your journey begins in the ancient kingdom of Lysoria. Rumors of a dark power are stirring...";
  }

  addNarrative(narrative: string): void {
    this.narrativeHistory.push(narrative);
  }

  addChoice(choice: string): void {
    this.choices.push(choice);
  }

  updatePlot(newStage: number, newSummary: string): void {
    this.plotStage = newStage;
    this.plotSummary = newSummary;
  }
}
