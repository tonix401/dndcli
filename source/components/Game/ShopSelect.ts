import {
  createPrompt,
  useState,
  useKeypress,
  usePagination,
  useRef,
  useMemo,
  useEffect,
  isEnterKey,
  isUpKey,
  isDownKey,
  Separator,
  ValidationError,
  type Status,
} from "@inquirer/core";
import { getTheme } from "@utilities/CacheService.js";
import {
  alignText,
  boxItUp,
  primaryColor,
  removeFormatting,
  secondaryColor,
} from "@utilities/ConsoleService.js";
import {
  Choice,
  isSelectable,
  normalizeChoices,
  NormalizedChoice,
} from "@utilities/MenuService.js";
import ansiEscapes from "ansi-escapes";
import chalk from "chalk";
import { getShopVisual } from "@resources/generalScreens/shopBackground.js";

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
  default?: unknown;
  canGoBack?: boolean;
};

/**
 * A modified version of the @inquirer/prompts select that uses arrow keys to navigate and select options.
 * Left to return "goBack", right to select the current option.
 * @param config The same config select from inquirer/prompt uses + enemy
 */
export const shopSelect = createPrompt(
  <Value>(config: SelectConfig<Value>, done: (value: Value) => void) => {
    const { canGoBack = false } = config;
    const loop = false;
    const pageSize = 10;
    const theme = getTheme();
    const prefix = theme.prefix;
    const [status, setStatus] = useState<Status>("idle");
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

      if (isEnterKey(key) || key.name === "right") {
        setStatus("done");
        done(selectedChoice.value);
      } else if (canGoBack && key.name === "left") {
        setStatus("done");
        done("goBack" as Value);
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
      }
    });

    useEffect(
      () => () => {
        clearTimeout(searchTimeoutRef.current);
      },
      []
    );

    const maxItemLength =
      Math.max(
        ...items
          .filter((item) => !Separator.isSeparator(item))
          .map(
            (item) =>
              removeFormatting((item as NormalizedChoice<Value>).name).text
                .length
          )
      ) +
      theme.cursor.length +
      1;
    const message = primaryColor(config.message);

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
          return chalk.dim(secondaryColor(`${item.name} ${disabledLabel}`));
        }

        const color = isActive ? secondaryColor : (x: string) => x;
        const cursor = isActive ? theme.cursor : ` `;
        return color(`${cursor} ${item.name}`);
      },
      pageSize,
      loop,
    });

    if (status === "done") {
      return "";
    }

    const alignedPage = alignText(
      `${[prefix, message].filter(Boolean).join(" ")}\n${page}${
        ansiEscapes.cursorHide
      }`,
      "left",
      "",
      maxItemLength
    );

    return (
      ansiEscapes.cursorHide +
      getShopVisual(active % 3 === 0, active % 3 === 1, active % 3 >= 2) +
      "\n" +
      boxItUp(alignText(alignedPage, "center", "", 75)) +
      "\n" +
      secondaryColor("*".repeat(79))
    );
  }
);
