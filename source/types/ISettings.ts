import { Language } from "../utilities/LanguageService";
import { ITheme } from "../utilities/ThemingService";

/**
 * Interface for app settings
 */
export interface ISettings {
  language: Language;
  theme: ITheme;
}
