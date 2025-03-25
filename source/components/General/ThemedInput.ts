import {
  createPrompt,
  useState,
  useKeypress,
  type Status,
} from "@inquirer/core";
import { getTheme } from "@core/CacheService.js";
import {
  accentColor,
  boxItUp,
  getTextOnBackground,
  primaryColor,
  removeFormatting,
  secondaryColor,
} from "@core/ConsoleService.js";
import chalk from "chalk";
import ansiEscapes from "ansi-escapes";
import {
  isBackKey,
  isBackspaceKey,
  isConfirmKey,
  isRightKey,
} from "@ui/MenuService.js";

type InputTheme = {
  validationFailureMode: "keep" | "clear";
};

const inputTheme: InputTheme = {
  validationFailureMode: "keep",
};

type InputConfig = {
  message: string;
  default?: string;
  required?: boolean;
  transformer?: (value: string, { isFinal }: { isFinal: boolean }) => string;
  validate?: (value: string) => boolean | string | Promise<string | boolean>;
  canGoBack?: boolean;
};

export const themedInput = createPrompt<string, InputConfig>((config, done) => {
  const { required, validate = () => true } = config;
  const [status, setStatus] = useState<Status>("idle");
  const [defaultValue = "", setDefaultValue] = useState<string>(config.default);
  const [errorMsg, setError] = useState<string>();
  const [value, setValue] = useState<string>("");

  const prefix = getTheme().prefix;

  useKeypress(async (key, rl) => {
    // Ignore keypress while our prompt is doing other processing.
    if (status !== "idle") {
      return;
    }

    if (isBackKey(key) && config.canGoBack) {
      done("goBack");
      return;
    } else if (isConfirmKey(key) || isRightKey(key)) {
      const answer = value || defaultValue;
      setStatus("loading");

      const isValid =
        required && !answer
          ? "You must provide a value"
          : await validate(answer);
      if (isValid === true) {
        setValue(answer);
        setStatus("done");
        done(answer);
      } else {
        setValue("");
        setError(isValid || "You must provide a valid value");
        setStatus("idle");
      }
    } else if (isBackspaceKey(key) && !value) {
      setDefaultValue(undefined);
    } else if (key.name === "tab" && !value) {
      setDefaultValue(undefined);
      rl.clearLine(0); // Remove the tab character.
      rl.write(defaultValue);
      setValue(defaultValue);
    } else {
      setValue(rl.line);
      setError(undefined);
    }
  });

  const message = primaryColor(config.message);
  let formattedValue = value;
  if (typeof config.transformer === "function") {
    formattedValue = config.transformer(value, { isFinal: status === "done" });
  } else if (status === "done") {
    formattedValue = secondaryColor(value);
  }

  let defaultStr;
  if (defaultValue && status !== "done" && !value) {
    defaultStr = chalk.dim(accentColor(defaultValue));
  }

  let error = "";
  if (errorMsg) {
    error = accentColor(errorMsg);
  }

  const outputLength = removeFormatting(
    [prefix, message, defaultStr, formattedValue].join(" ")
  ).text.length;

  if (outputLength > 50) {
    formattedValue = "..." + value.slice(outputLength - 50);
  }

  return (
    ansiEscapes.cursorHide +
    getTextOnBackground(
      boxItUp(
        [prefix ? prefix : undefined, message, defaultStr, formattedValue]
          .filter((v) => v !== undefined)
          .join(" ") + (error ? `\n${error}` : "")
      )
    )
  );
});
