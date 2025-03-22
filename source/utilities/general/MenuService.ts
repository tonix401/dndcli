import { getTheme } from "./CacheService.js";
import { errorColor, primaryColor, secondaryColor } from "./ConsoleService.js";
import chalk from "chalk";
import {
  createPrompt,
  useState,
  useKeypress,
  usePrefix,
  usePagination,
  useRef,
  useMemo,
  useEffect,
  isNumberKey,
  Separator,
  ValidationError,
  makeTheme,
  type Theme,
  type Status,
} from "@inquirer/core";
import type { PartialDeep } from "@inquirer/type";
import colors from "yoctocolors-cjs";
import figures from "@inquirer/figures";
import ansiEscapes from "ansi-escapes";
import { getTerm } from "./LanguageService.js";
import ICharacter from "@utilities/ICharacter.js";

/**
 * The validation functions for user inputs
 */
export const inputValidators = {
  apiKey: (input: string) => {
    const regex = /^sk-[a-zA-Z0-9_-]{40,}$/;
    if (input.trim().length === 0) return getTerm("apiKeyRequired");
    if (!regex.test(input.trim())) return getTerm("wrongFormat");
    return true;
  },
  name: (input: string) => {
    const normalizedInput = input.trim().toLowerCase();
    const minLength = 2;
    const maxLength = 18;
    if (normalizedInput.length === 0) return getTerm("nameRequired");
    if (normalizedInput.length < minLength)
      return getTerm("tooShort") + minLength;
    if (normalizedInput.length > maxLength)
      return getTerm("tooLong") + maxLength;
    if (!isNaN(parseInt(input))) return getTerm("cantBeNumber");
    return true;
  },
  level: (input: string) => {
    const num = parseInt(input);
    const max = 1000;
    if (isNaN(num)) return getTerm("mustBeNumber");
    if (num < 0) return getTerm("cantBeNegative");
    if (num > max) return getTerm("tooHigh") + max;
    return true;
  },
  hp: (input: string) => {
    const num = parseInt(input);
    if (isNaN(num)) return getTerm("mustBeNumber");
    if (num < 0) return getTerm("cantBeNegative");
    return true;
  },
  maxhp: (input: string, character: ICharacter) => {
    const num = parseInt(input);
    if (isNaN(num)) return getTerm("mustBeNumber");
    if (num < 0) return getTerm("cantBeNegative");
    if (num < character.hp) return getTerm("mustBeHigherThanCurrentHp");
    return true;
  },
  xp: (input: string) => {
    const num = parseInt(input);
    if (isNaN(num)) return getTerm("mustBeNumber");
    if (num < 0) return getTerm("cantBeNegative");
    return true;
  },
  numericAbility: (input: string) => {
    const num = parseInt(input);
    const max = 999;
    if (isNaN(num)) return getTerm("mustBeNumber");
    if (num < 0) return getTerm("cantBeNegative");
    if (num > max) return getTerm("tooHigh") + max;
    return true;
  },
};

/**
 * A version of the select from inquirer that used the custom theme and current colors
 * @param config The same config select from inquirer/prompt uses
 * @returns The value of the choice the user made
 */
export async function themedSelect<Value = string>(
  config: SelectConfig<Value>
): Promise<Value> {
  const theme = {
    prefix: getTheme().prefix,
    icon: {
      cursor: getTheme().cursor,
    },
    style: {
      message: (text: string) => primaryColor(chalk.bold(text)),
      highlight: (text: string) => chalk.bold(secondaryColor(text)),
      disabled: (text: string) =>
        chalk.hex(getTheme().secondaryColor).dim("  " + text),
      error: (text: string) => errorColor(text),
    },
    helpMode: "never" as "never" | "auto" | "always",
  };
  return await arrowKeysSelect(
    { ...config, pageSize: 50, theme: theme },
    { clearPromptOnDone: true }
  );
}

export type SelectTheme = {
  icon: { cursor: string };
  style: {
    disabled: (text: string) => string;
    description: (text: string) => string;
  };
  helpMode: "always" | "never" | "auto";
};

export const selectTheme: SelectTheme = {
  icon: { cursor: figures.pointer },
  style: {
    disabled: (text: string) => colors.dim(`- ${text}`),
    description: (text: string) => colors.cyan(text),
  },
  helpMode: "auto",
};

export type Choice<Value> = {
  value: Value;
  name?: string;
  description?: string;
  short?: string;
  disabled?: boolean | string;
  type?: never;
};

export type NormalizedChoice<Value> = {
  value: Value;
  name: string;
  description?: string;
  short: string;
  disabled: boolean | string;
};

export type SelectConfig<
  Value,
  ChoicesObject =
    | ReadonlyArray<string | Separator>
    | ReadonlyArray<Choice<Value> | Separator>
> = {
  message: string;
  choices: ChoicesObject extends ReadonlyArray<string | Separator>
    ? ChoicesObject
    : ReadonlyArray<Choice<Value> | Separator>;
  pageSize?: number;
  loop?: boolean;
  default?: unknown;
  theme?: PartialDeep<Theme<SelectTheme>>;
  canGoBack?: boolean;
};

export function isSelectable<Value>(
  item: NormalizedChoice<Value> | Separator
): item is NormalizedChoice<Value> {
  return !Separator.isSeparator(item) && !item.disabled;
}

export function normalizeChoices<Value>(
  choices:
    | ReadonlyArray<string | Separator>
    | ReadonlyArray<Choice<Value> | Separator>
): Array<NormalizedChoice<Value> | Separator> {
  return choices.map((choice) => {
    if (Separator.isSeparator(choice)) return choice;

    if (typeof choice === "string") {
      return {
        value: choice as Value,
        name: choice,
        short: choice,
        disabled: false,
      };
    }

    const name = choice.name ?? String(choice.value);
    return {
      value: choice.value,
      name,
      description: choice.description,
      short: choice.short ?? name,
      disabled: choice.disabled ?? false,
    };
  });
}

/**
 * A modified version of the @inquirer/prompts select that uses arrow keys to navigate and select options.
 * Left to return "goBack", right to select the current option.
 * @param config The same config select from inquirer/prompt uses
 */
const arrowKeysSelect = createPrompt(
  <Value>(config: SelectConfig<Value>, done: (value: Value) => void) => {
    const { loop = true, pageSize = 7, canGoBack = false } = config;
    const firstRender = useRef(true);
    const theme = makeTheme<SelectTheme>(selectTheme, config.theme);
    const [status, setStatus] = useState<Status>("idle");
    const prefix = usePrefix({ status, theme });
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

    const items = useMemo(
      () => normalizeChoices(config.choices),
      [config.choices]
    );

    const bounds = useMemo(() => {
      const first = items.findIndex(isSelectable);
      // Polyfill for findLastIndex
      const last = (() => {
        for (let i = items.length - 1; i >= 0; i--) {
          if (isSelectable(items[i])) return i;
        }
        return -1;
      })();

      if (first === -1) {
        throw new ValidationError(
          "[select prompt] No selectable choices. All choices are disabled."
        );
      }

      return { first, last };
    }, [items]);

    const defaultItemIndex = useMemo(() => {
      if (!("default" in config)) return -1;
      return items.findIndex(
        (item) => isSelectable(item) && item.value === config.default
      );
    }, [config.default, items]);

    const [active, setActive] = useState(
      defaultItemIndex === -1 ? bounds.first : defaultItemIndex
    );

    // Safe to assume the cursor position always point to a Choice.
    const selectedChoice = items[active] as NormalizedChoice<Value>;

    useKeypress((key, rl) => {
      clearTimeout(searchTimeoutRef.current);

      if (isConfirmKey(key) || key.name === "right") {
        setStatus("done");
        done(selectedChoice.value);
      } else if (isUpKey(key) || isDownKey(key)) {
        rl.clearLine(0);
        if (
          loop ||
          (isUpKey(key) && active !== bounds.first) ||
          (isDownKey(key) && active !== bounds.last)
        ) {
          const offset = isUpKey(key) ? -1 : 1;
          let next = active;
          do {
            next = (next + offset + items.length) % items.length;
          } while (!isSelectable(items[next]!));
          setActive(next);
        }
      } else if (isNumberKey(key)) {
        rl.clearLine(0);
        const position = Number(key.name) - 1;
        const item = items[position];
        if (item != null && isSelectable(item)) {
          setActive(position);
        }
      } else if (isBackspaceKey(key)) {
        rl.clearLine(0);
      } else {
        // Default to search
        const searchTerm = rl.line.toLowerCase();
        const matchIndex = items.findIndex((item) => {
          if (Separator.isSeparator(item) || !isSelectable(item)) return false;

          return item.name.toLowerCase().startsWith(searchTerm);
        });

        if (isBackKey(key) && canGoBack) {
          setStatus("done");
          done("goBack" as any);
        } else if (matchIndex !== -1) {
          setActive(matchIndex);
        }

        searchTimeoutRef.current = setTimeout(() => {
          rl.clearLine(0);
        }, 700);
      }
    });

    useEffect(
      () => () => {
        clearTimeout(searchTimeoutRef.current);
      },
      []
    );

    const message = theme.style.message(config.message, status);

    let helpTipTop = "";
    let helpTipBottom = "";
    if (
      theme.helpMode === "always" ||
      (theme.helpMode === "auto" && firstRender.current)
    ) {
      firstRender.current = false;

      if (items.length > pageSize) {
        helpTipBottom = `\n${theme.style.help(
          "(Use arrow keys to reveal more choices)"
        )}`;
      } else {
        helpTipTop = theme.style.help("(Use arrow keys)");
      }
    }

    const page = usePagination({
      items,
      active,
      renderItem({ item, isActive }) {
        if (Separator.isSeparator(item)) {
          return ` ${item.separator}`;
        }

        if (item.disabled) {
          const disabledLabel =
            typeof item.disabled === "string" ? item.disabled : "(disabled)";
          return theme.style.disabled(`${item.name} ${disabledLabel}`);
        }

        const color = isActive ? theme.style.highlight : (x: string) => x;
        const cursor = isActive ? theme.icon.cursor : ` `;
        return color(`${cursor} ${item.name}`);
      },
      pageSize,
      loop,
    });

    if (status === "done") {
      return `${prefix} ${message} ${theme.style.answer(selectedChoice.short)}`;
    }

    const choiceDescription = selectedChoice.description
      ? `\n${theme.style.description(selectedChoice.description)}`
      : ``;

    return `${[prefix, message, helpTipTop]
      .filter(Boolean)
      .join(" ")}\n${page}${helpTipBottom}${choiceDescription}${
      ansiEscapes.cursorHide
    }`;
  }
);

type SingleKeyPromptConfig = {
  message: string;
  keybindings: Record<string, string | boolean>;
  theme?: PartialDeep<Theme<SelectTheme>>;
};

/**
 * A prompt that waits for the given keys and returns the value associated with the key.
 * @example
 * keybindings: {
 *  space: "confirm",
 *  q: "quit",
 * }
 * -> Waits for the user to press either space or q and returns "confirm" or "quit" respectively.
 */
export const themedSingleKeyPrompt = createPrompt(
  <Value>(config: SingleKeyPromptConfig, done: (value: Value) => void) => {
    const theme = { ...getTheme(), ...config?.theme };
    useKeypress((key, _rl) => {
      if (Object.keys(config.keybindings).includes(key.name)) {
        done(config.keybindings[key.name] as any);
      }
    });
    return theme.prefix + " " + chalk.hex(theme.secondaryColor)(config.message);
  }
);

// Functions that test for certain types of control keys inside selects and other prompts or menus
/**
 * up, w, i
 */
export function isUpKey(key: any): boolean {
  return key.name === "up" || key.name === "w" || key.name === "i";
}
/**
 * down, s, k
 */
export function isDownKey(key: any): boolean {
  return key.name === "down" || key.name === "s" || key.name === "k";
}
/**
 * left, a, j
 */
export function isLeftKey(key: any): boolean {
  return key.name === "left" || key.name === "a" || key.name === "j";
}
/**
 * right, d, l
 */
export function isRightKey(key: any): boolean {
  return key.name === "right" || key.name === "d" || key.name === "l";
}
/**
 * return, space, right
 */
export function isConfirmKey(key: any): boolean {
  return key.name === "return" || key.name === "space";
}
/**
 * escape, left
 */
export function isBackKey(key: any): boolean {
  return key.name === "escape" || key.name === "left";
}
/**
 * backspace
 */
export function isBackspaceKey(key: any): boolean {
  return key.name === "backspace";
}
