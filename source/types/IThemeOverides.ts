import { Language } from "../utilities/LanguageService";

/**
 * Interface for app theme overrides that can be used to override the standard theme values, and therefore have optional properties
 */
export type IThemeOverride = {
  name: Record<Language, string>;
  prefix?: string;
  primaryColor?: string;
  secondaryColor?: string;
  cursor?: string;
  accentColor?: string;
  backgroundColor?: string;
  errorColor?: string;
};
