import { Language } from "../utilities/LanguageService";

/**
 * Interface for app settings
 */
export interface ISettings {
  language: Language;
  primaryColor: string,
  secondaryColor: string
};
