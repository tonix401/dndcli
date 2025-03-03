/**
 * Interface representing contextual data for story management.
 * @interface IContextData
 * @property {string} story - The current story or narrative content.
 * @property {string} lastPrompt - The most recent prompt or input provided.
 */
export interface IContext {
  story: string;
  lastPrompt: string;
}
