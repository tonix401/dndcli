import {
  createPrompt,
  useState,
  useKeypress,
  isEnterKey,
} from "@inquirer/core";
import ansiEscapes from "ansi-escapes";
import {
  boxItUp,
  getTextOnBackground,
  primaryColor,
  removeFormatting,
  secondaryColor,
} from "@utilities/ConsoleService.js";
import { getTheme } from "@utilities/CacheService.js";
import { getRandomItemFromArray } from "@utilities/ThemingService.js";
import getPasswordBackground from "@resources/generalScreens/passwordBackground.js";
import chalk from "chalk";

type PasswordConfig = {
  message: string;
  canGoBack?: boolean;
};

export const themedPasswordInput = createPrompt<string, PasswordConfig>(
  (config, done) => {
    const canGoBack = config.canGoBack ?? false;
    const [value, setValue] = useState<string>("");
    const [runes, setRunes] = useState<string>("");
    const prefix = getTheme().prefix;
    const message = primaryColor(config.message);

    useKeypress(async (key, rl) => {
      if (isEnterKey(key) || key.name === "right") {
        const answer = value;
        setValue(answer);
        done(answer);
      } else if (key.name === "left" && canGoBack) {
        done("goBack");
      } else {
        const newValue = rl.line;
        setValue(newValue);

        if (newValue.length > runes.length) {
          let newRunes = "";
          for (let i = 0; i < newValue.length - runes.length; i++) {
            newRunes += getRandomRune();
          }
          setRunes(runes + newRunes);
        } else if (newValue.length < runes.length) {
          setRunes(runes.slice(0, newValue.length));
        }
      }
    });

    const outputLength = removeFormatting([prefix, message, runes].join(" "))
      .text.length;
    let formattedRunes = runes;

    if (outputLength > 50) {
      formattedRunes = "..." + runes.slice(outputLength - 50);
    }

    return secondaryColor(
      getTextOnBackground(
        boxItUp(
          ansiEscapes.cursorHide +
            secondaryColor([prefix, message, chalk.white(formattedRunes)].join(" "))
        ),
        getPasswordBackground()
      )
    );
  }
);

const getRandomRune = () =>
  getRandomItemFromArray([
    "ᚠ",
    "ᚢ",
    "ᚦ",
    "ᚨ",
    "ᚱ",
    "ᚹ",
    "ᚺ",
    "ᚾ",
    "ᛃ",
    "ᛇ",
    "ᛈ",
    "ᛉ",
    "ᛊ",
    "ᛏ",
    "ᛒ",
    "ᛗ",
    "ᛚ",
    "ᛜ",
    "ᛞ",
    "ᛟ",
    "ᚦ",
    "ᚣ",
    "ᛡ",
    "ᛠ",
    "ᛢ",
    "ᛣ",
    "ᛤ",
    "ᛥ",
    "ᛦ",
    "ᛨ",
    "ᛩ",
    "ᛪ",
    "ᛮ",
    "ᛯ",
    "ᛰ",
    "ᚻ",
    "ᚪ",
    "ᚫ",
    "ᚬ",
    "ᚭ",
    "ᚮ",
    "ᚯ",
    "ᚰ",
    "ᚱ",
    "ᚴ",
    "ᚵ",
    "ᚶ",
  ]);
