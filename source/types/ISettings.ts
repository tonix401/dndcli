import { Language } from "../utilities/LanguageService.js";
import { ITheme } from "../types/ITheme.js";

/**
 * Interface for app settings
 */
export interface ISettings {
  language: Language;
  theme: ITheme;
  password: string;
}
