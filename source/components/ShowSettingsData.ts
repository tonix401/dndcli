import chalk from "chalk";
import {
  getLanguage,
  getTheme,
  setLanguage,
  setTheme,
} from "../utilities/CacheService.js";
import { themedInput, themedSelect } from "../utilities/ConsoleService.js";
import { getTerm, Language } from "../utilities/LanguageService.js";
import { Separator } from "@inquirer/prompts";
import config from "../utilities/Config.js";

export async function showSettingsData() {
  let theme = getTheme();
  let language = getLanguage();

  const menuOptions = [
    {
      name: getTerm("language") + ": " + getTerm(language),
      value: "language",
    },
    new Separator(config.SELECT_SEPARATOR),
    {
      name: getTerm("cursor") + ": '" + theme.cursor + "'",
      value: "cursor",
    },
    {
      name: getTerm("prefix") + ": '" + theme.prefix + "'",
      value: "prefix",
    },
    new Separator(config.SELECT_SEPARATOR),
    new Separator(" " + getTerm("theme") + ":"),
    {
      name:
        getTerm("primaryColor") +
        ": " +
        chalk.hex(theme.primaryColor)(theme.primaryColor),
      value: "primaryColor",
    },
    {
      name:
        getTerm("secondaryColor") +
        ": " +
        chalk.hex(theme.secondaryColor)(theme.secondaryColor),
      value: "secondaryColor",
    },
    {
      name:
        getTerm("accentColor") +
        ": " +
        chalk.hex(theme.accentColor)(theme.accentColor),
      value: "accentColor",
    },
    {
      name:
        getTerm("backgroundColor") +
        ": " +
        chalk.hex(theme.backgroundColor)(theme.backgroundColor),
      value: "backgroundColor",
    },
    {
      name:
        getTerm("errorColor") +
        ": " +
        chalk.hex(theme.errorColor)(theme.errorColor),
      value: "errorColor",
    },
    new Separator(config.SELECT_SEPARATOR),
    { name: getTerm("goBack"), value: "goBack" },
  ];
  while (true) {
    theme = getTheme();
    language = getLanguage();
    const choice = await themedSelect({
      message: chalk.hex(getTheme().primaryColor)(getTerm("showSettingsData")),
      choices: menuOptions,
    });
    if (choice === "goBack") return;
    await changeSettingsScreen(choice);
  }
}

async function changeSettingsScreen(choice: string) {
  let changeSettingFunction: (input: any) => void;
  let functionToValidate: (input: string) => boolean | string = () => true;
  const colorRegex = /^#[0-9A-F]{6}$/i;
  const languageRegex = /^(en|de)$/;

  switch (choice) {
    case "language":
      changeSettingFunction = (input: Language) => setLanguage(input);
      functionToValidate = (input: string) =>
        languageRegex.test(input) ? true : getTerm("invalidLanguage");
      break;
    case "prefix":
    case "cursor":
      const maxLength = 5;
      changeSettingFunction = (input: string) =>
        setTheme({
          ...getTheme(),
          [choice]: input,
          name: { de: "Benutzerdefiniert", en: "Custom" },
        });
      functionToValidate = (input: string) =>
        input.length <= maxLength ? true : getTerm("tooLong") + maxLength;
      break;
    case "accentColor":
    case "backgroundColor":
    case "errorColor":
    case "primaryColor":
    case "secondaryColor":
      changeSettingFunction = (input: string) =>
        setTheme({
          ...getTheme(),
          [choice]: input,
          name: { de: "Benutzerdefiniert", en: "Custom" },
        });
      functionToValidate = (input: string) =>
        colorRegex.test(input) ? true : getTerm("invalidColor");
      break;
    default:
      return;
  }

  const newValue = await themedInput({
    message: getTerm(choice),
    validate: functionToValidate,
  });

  changeSettingFunction(newValue);
}
