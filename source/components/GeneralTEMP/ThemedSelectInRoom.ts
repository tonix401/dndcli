import {
  createPrompt,
  useState,
  useKeypress,
  usePagination,
  useRef,
  useMemo,
  useEffect,
  Separator,
  ValidationError,
  type Status,
} from "@inquirer/core";
import { getTheme } from "@utilities/CacheService.js";
import {
  alignText,
  boxItUp,
  getTextOnBackground,
  primaryColor,
  removeFormatting,
  secondaryColor,
} from "@utilities/ConsoleService.js";
import {
  isBackKey,
  isConfirmKey,
  isDownKey,
  isRightKey,
  isSelectable,
  isUpKey,
  normalizeChoices,
  NormalizedChoice,
  SelectConfig,
} from "@utilities/MenuService.js";
import ansiEscapes from "ansi-escapes";
import chalk from "chalk";

/**
 * A modified version of the @inquirer/prompts select that uses arrow keys to navigate and select options.
 * Left to return "goBack", right to select the current option.
 * @param config The same config select from inquirer/prompt uses
 */
export const themedSelectInRoom = createPrompt(
  <Value>(config: SelectConfig<Value>, done: (value: Value) => void) => {
    const { loop = false, pageSize = 10, canGoBack = false } = config;
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

      if (isConfirmKey(key) || isRightKey(key)) {
        setStatus("done");
        done(selectedChoice.value);
      } else if (canGoBack && isBackKey(key)) {
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

    const message = [prefix, primaryColor(config.message)]
      .filter(Boolean)
      .join(" ");

    const maxItemLength =
      Math.max(
        removeFormatting(message).text.length,
        ...items
          .filter((item) => !Separator.isSeparator(item))
          .map(
            (item) =>
              removeFormatting((item as NormalizedChoice<Value>).name).text
                .length
          )
      ) +
      removeFormatting(theme.cursor).text.length +
      1;

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

    const roomWidth = getTextOnBackground("").split("\n")[0].length;
    const box = boxItUp(
      alignText(
        `${message}\n${page}${ansiEscapes.cursorHide}`,
        "left",
        "",
        maxItemLength
      ),
      {
        top: 0,
        bottom: 0,
        left: 1,
        right: 2,
      }
    );

    if (box.split("\n")[0].length > roomWidth) {
      return ansiEscapes.clearTerminal + box;
    }
    return ansiEscapes.clearTerminal + getTextOnBackground(box);
  }
);
