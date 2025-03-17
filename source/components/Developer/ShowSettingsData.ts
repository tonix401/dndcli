import chalk from "chalk";
import {
  getLanguage,
  getTheme,
  setLanguage,
  setTheme,
} from "@utilities/CacheService.js";
import { primaryColor, totalClear } from "@utilities/ConsoleService.js";
import { getTerm, Language } from "@utilities/LanguageService.js";
import { Separator } from "@inquirer/prompts";
import config from "@utilities/Config.js";
import { themedSelectInRoom } from "@components/ThemedSelectInRoom.js";
import { themedInput } from "@components/ThemedInput.js";

const getSettingsOptions = () => {
  const theme = getTheme();
  const language = getLanguage();

  return [
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
    new Separator(
      " " + getTerm("theme") + ": " + getTheme().name[getLanguage()]
    ),
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
    { name: getTerm("saveAndGoBack"), value: "goBack" },
  ];
};

export async function showSettingsData() {
  while (true) {
    totalClear();
    const choice = await themedSelectInRoom({
      canGoBack: true,
      message: primaryColor(getTerm("settingsData")),
      choices: getSettingsOptions(),
    });
    if (choice === "goBack") return;
    await changeSettingsScreen(choice);
  }
}

async function changeSettingsScreen(choice: string) {
  let changeSettingFunction: (input: any) => void;
  let functionToValidate: (input: string) => boolean | string = () => true;
  let defaultValue: string = "";
  const colorRegex = /^#[0-9A-F]{6}$/i;
  const languageRegex = /^(en|de)$/;

  switch (choice) {
    case "language":
      changeSettingFunction = (input: Language) => setLanguage(input);
      defaultValue = getLanguage();
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
      defaultValue = getTheme()[choice];
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
      defaultValue = getTheme()[choice];
      functionToValidate = (input: string) =>
        colorRegex.test(input) ? true : getTerm("invalidColor");
      break;
    default:
      return;
  }

  const newValue = await themedInput({
    message: getTerm(choice),
    default: defaultValue,
    validate: functionToValidate,
  });

  changeSettingFunction(newValue);
}
