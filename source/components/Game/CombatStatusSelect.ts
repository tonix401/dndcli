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
  Theme,
} from "@inquirer/core";
import { getTheme } from "@core/CacheService.js";
import {
  alignText,
  alignTextAsTable,
  alignTextSideBySide,
  boxItUp,
  primaryColor,
  removeFormatting,
  secondaryColor,
} from "@core/ConsoleService.js";
import ICharacter from "@utilities/ICharacter.js";
import { IEnemy } from "@utilities/IEnemy.js";
import { getTerm } from "@core/LanguageService.js";
import {
  Choice,
  isBackKey,
  isConfirmKey,
  isDownKey,
  isRightKey,
  isSelectable,
  isUpKey,
  normalizeChoices,
  NormalizedChoice,
  SelectTheme,
} from "@ui/MenuService.js";
import { getDataFromFile } from "@core/StorageService.js";
import ansiEscapes from "ansi-escapes";
import chalk from "chalk";
import { holdMyText } from "@components/DungeonMovementSelect.js";
import { PartialDeep } from "@inquirer/type";

const enemyAscii = [
  "  |\\ .====. /|  ",
  "  \\ '      ' /  ",
  "   |  °  °  |   ",
  "    \\_    _/    ",
  " ____/    \\____ ",
  "/              \\",
].join("\n");

// TODO: actually implement maxMana
const maxMana = 15;

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
  enemy: IEnemy;
};

/**
 * A modified version of the @inquirer/prompts select that uses arrow keys to navigate and select options.
 * Left to return "goBack", right to select the current option.
 * @param config The same config select from inquirer/prompt uses + enemy
 */
export const combatStatusSelect = createPrompt(
  <Value>(config: SelectConfig<Value>, done: (value: Value) => void) => {
    const { loop = false, pageSize = 10, canGoBack = false, enemy } = config;
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

    return getCombatScreenEnvironment(alignedPage, enemy);
  }
);

/**
 * Generates a health bar string representation.
 * @param current - The current health value.
 * @param max - The maximum health value.
 * @param fullColor - The color for full health (default: green).
 * @param emptyColor - The color for empty health (default: red).
 * @param barLength - The length of the health bar (default: 20).
 * @returns The formatted health bar string.
 */
function getHealthBar(
  current: number,
  max: number,
  fullColor: { r: number; g: number; b: number } = { r: 0, g: 255, b: 0 },
  emptyColor: { r: number; g: number; b: number } = { r: 255, g: 0, b: 0 },
  barLength: number = 20
): string {
  if (current > max) {
    max = current;
  }

  /**
   * The function to calculate the color gradient, returns a value between 0 and 1 for every x between 0 and 1
   * Just a parabola atm, but can be changed later.
   * I also tried some e functions.
   * They look really good with red and green but not with other colors, so this is a compromise
   */
  const func = (x: number) => Math.pow(x, 2);

  const vector = {
    r: fullColor.r - emptyColor.r,
    g: fullColor.g - emptyColor.g,
    b: fullColor.b - emptyColor.b,
  };
  const value = func(current / max);
  const color = {
    r: Math.round(emptyColor.r + vector.r * value),
    g: Math.round(emptyColor.g + vector.g * value),
    b: Math.round(emptyColor.b + vector.b * value),
  };
  const { r, g, b } = color;

  const rawFilled = Math.round((current / max) * barLength);
  const filledLength = Math.min(rawFilled, barLength);
  const emptyLength = Math.max(barLength - filledLength, 0);

  let result = `[${chalk.bold.rgb(
    r,
    g,
    b
  )("■".repeat(filledLength))}${"·".repeat(emptyLength)}]`;
  return result;
}

function getStatsArea(): string {
  const character: ICharacter = getDataFromFile("character");
  const charStatsTitle = `${character.name} - ${getTerm("level")} ${
    character.level
  } ${getTerm(character.class)}`;

  const charStatsArray: [string, string][] = [
    [getTerm("strength") + ":", character.abilities.strength.toString()],
    [getTerm("dexterity") + ":", character.abilities.dexterity.toString()],
    [getTerm("charisma") + ":", character.abilities.charisma.toString()],
    [getTerm("luck") + ":", character.abilities.luck.toString()],
  ];

  const maxCharStatsArrayWidth = Math.max(
    ...charStatsArray.map((stat) => stat[0].length + stat[1].length)
  );

  const hpBar: [string, string] = [
    getHealthBar(character.hp, character.abilities.maxhp),
    character.hp + "/" + character.abilities.maxhp,
  ];

  const manaBar: [string, string] = [
    getHealthBar(
      character.abilities.mana,
      maxMana,
      { r: 0, g: 255, b: 255 },
      { r: 0, g: 0, b: 255 }
    ),
    character.abilities.mana + "/" + maxMana,
  ];

  const maxBarsWidth = Math.max(
    removeFormatting(hpBar.join()).text.length,
    removeFormatting(manaBar.join()).text.length
  );

  const maxTotalWidth = Math.max(
    charStatsTitle.length,
    maxBarsWidth,
    maxCharStatsArrayWidth
  );

  const alignedHpBarString = alignTextAsTable(
    [hpBar],
    "",
    " ",
    maxTotalWidth
  ).text;

  const alignedManaBarString = alignTextAsTable(
    [manaBar],
    "",
    " ",
    maxTotalWidth
  ).text;

  const alignedCharStatsArray = alignTextAsTable(
    charStatsArray,
    "",
    " ",
    maxTotalWidth
  ).text;

  const title = chalk.bold(
    primaryColor(alignText(charStatsTitle, "left", "", maxTotalWidth))
  );

  return alignText(
    title +
      "\n" +
      alignedHpBarString +
      "\n" +
      alignedManaBarString +
      "\n" +
      alignedCharStatsArray,
    "left"
  );
}

export function getCombatScreenEnvironment(page: string, enemy: IEnemy) {
  const alignedPage = alignText(page, "left");
  const allStats = alignTextSideBySide(
    getStatsArea(),
    chalk.white(alignedPage),
    " | "
  );
  const heldText = holdMyText(boxItUp(allStats));

  // Lets assume that the widest part is always the player stats in the hands
  const maxTotalWidth = removeFormatting(heldText).text.split("\n")[0].length;

  const enemyBar = alignText(
    boxItUp(
      `${enemy.name} ${getHealthBar(enemy.hp, enemy.maxhp)} ${enemy.hp}/${
        enemy.maxhp
      }`
    ),
    "center",
    "",
    maxTotalWidth
  );
  const enemyArea = alignText(enemyAscii, "center", "", maxTotalWidth);

  return secondaryColor(
    "*".repeat(maxTotalWidth) +
      "\n" +
      enemyBar +
      "\n" +
      enemyArea +
      "\n" +
      heldText +
      "\n" +
      "*".repeat(maxTotalWidth)
  );
}
