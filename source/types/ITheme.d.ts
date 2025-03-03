import { Language } from "@utilities/LanguageService";

/**
 * Interface for app themes that can be saved
 */
export type ITheme = {
  name: Record<Language, string>;
  prefix: string;
  primaryColor: string;
  secondaryColor: string;
  cursor: string;
  accentColor: string;
  backgroundColor: string;
  errorColor: string;
};
