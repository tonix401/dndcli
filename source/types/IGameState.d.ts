/**
 * Interface representing the current state of the game.
 */
export interface IGameState {
  theme: string | null;
  narrativeHistory: string[];
  conversationHistory: ConversationMessage[];
  choices: string[];
  plotStage: number;
  plotSummary: string;
}