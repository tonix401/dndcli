import {
  createPrompt,
  useState,
  useKeypress,
  useRef,
  useEffect,
  type Status,
} from "@inquirer/core";
import {
  alignText,
  alignTextSideBySide,
  boxItUp,
  primaryColor,
  removeFormatting,
  secondaryColor,
} from "@utilities/ConsoleService.js";
import chalk from "chalk";
import ansiEscapes from "ansi-escapes";
import { getDataFromFile } from "@utilities/StorageService.js";
import { getTerm } from "@utilities/LanguageService.js";
import Config from "@utilities/Config.js";
import { getDungeonMapVisual } from "@utilities/world/DungeonService.js";
import {
  isBackKey,
  isConfirmKey,
  isDownKey,
  isLeftKey,
  isRightKey,
  isUpKey,
} from "@utilities/MenuService.js";

type DungeonMovementSelectResult =
  | "north"
  | "south"
  | "east"
  | "west"
  | "neutral"
  | "goBack";

/**
 * A modified version of the @inquirer/prompts select that uses arrow keys to navigate and select options.
 * @param config The same config select from inquirer/prompt uses
 */
export const dungeonMovementSelect = createPrompt(
  <_Value>(
    config: {
      north?: boolean;
      east?: boolean;
      south?: boolean;
      west?: boolean;
      canGoBack?: boolean;
    },
    done: (value: DungeonMovementSelectResult) => void
  ) => {
    const {
      north = true,
      east = true,
      south = true,
      west = true,
      canGoBack = false,
    } = config;
    const [status, setStatus] = useState<Status>("idle");
    const [direction, setDirection] =
      useState<DungeonMovementSelectResult>("neutral");
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
    useKeypress((key, rl) => {
      clearTimeout(searchTimeoutRef.current);

      if (isConfirmKey(key) && direction !== "neutral") {
        rl.clearLine(0);
        setStatus("done");
        done(direction);
      } else {
        switch (true) {
          case isUpKey(key):
            if (north && direction === "north") {
              done(direction);
              setStatus("done");
            } else if (north) {
              setDirection("north");
            } else {
              setDirection("neutral");
            }
            break;
          case isDownKey(key):
            if (south && direction === "south") {
              done(direction);
              setStatus("done");
            } else if (south) {
              setDirection("south");
            } else {
              setDirection("neutral");
            }
            break;
          case isLeftKey(key):
            if (west && direction === "west") {
              done(direction);
              setStatus("done");
            } else if (west) {
              setDirection("west");
            } else {
              setDirection("neutral");
            }
            break;
          case isRightKey(key):
            if (east && direction === "east") {
              done(direction);
              setStatus("done");
            } else if (east) {
              setDirection("east");
            } else {
              setDirection("neutral");
            }
            break;
          // isBackKey(key) also checks for key.name === "left", but because we already check for the case isLeftKey(key) above, we dont need to worry about it
          case (key.name === "q" || isBackKey(key)) && canGoBack:
            setStatus("done");
            done("goBack");
            break;
        }
      }
    });

    useEffect(
      () => () => {
        clearTimeout(searchTimeoutRef.current);
      },
      []
    );

    if (status === "done") {
      return "";
    }

    const character = getDataFromFile("character") || Config.START_CHARACTER;

    const title = `${character.name} - ${getTerm("level")} ${
      character.level
    } ${getTerm(character.class)}`;
    const stats = secondaryColor(
      [
        primaryColor(title),
        `${getTerm("hp")}: ${character.hp}`,
        `${getTerm("maxhp")}: ${character.abilities.maxhp}`,
        `${getTerm("strength")}: ${character.abilities.strength}`,
        `${getTerm("dexterity")}: ${character.abilities.dexterity}`,
        `${getTerm("charisma")}: ${character.abilities.charisma}`,
        `${getTerm("luck")}: ${character.abilities.luck}`,
        `${getTerm("mana")}: ${character.abilities.mana}`,
      ].join("\n")
    );

    const dungeonMapBox = boxItUp(getDungeonMapVisual());
    const statsBox = boxItUp(alignText(stats, "left"));
    const controlBox = boxItUp(
      alignText(
        getCardinals(direction, north, east, south, west),
        "center",
        "",
        removeFormatting(statsBox.split("\n")[0]).text.length - 4
      )
    );
    const statsOverControl = alignText(statsBox + "\n" + controlBox, "left");

    const megaBox = alignTextSideBySide(dungeonMapBox, statsOverControl);
    const heldText = holdMyText(megaBox) + ansiEscapes.cursorHide;
    const totalWidth = removeFormatting(heldText.split("\n")[0]).text.length;

    return secondaryColor(
      "*".repeat(totalWidth) +
        "\n" +
        holdMyText(megaBox) +
        ansiEscapes.cursorHide +
        "\n" +
        "*".repeat(totalWidth)
    );
  }
);

/**
 * Gets the direction visual for the available directions.
 * @example
 */
export function getCardinals(
  direction: DungeonMovementSelectResult,
  north: boolean,
  east: boolean,
  south: boolean,
  west: boolean
) {
  const nothing = (text: string) => text;
  const n =
    direction === "north"
      ? (text: string) => chalk.bold(primaryColor(text))
      : north
      ? nothing
      : chalk.dim;
  const s =
    direction === "south"
      ? (text: string) => chalk.bold(primaryColor(text))
      : south
      ? nothing
      : chalk.dim;
  const e =
    direction === "east"
      ? (text: string) => chalk.bold(primaryColor(text))
      : east
      ? nothing
      : chalk.dim;
  const w =
    direction === "west"
      ? (text: string) => chalk.bold(primaryColor(text))
      : west
      ? nothing
      : chalk.dim;
  const m =
    direction === "neutral"
      ? (text: string) => chalk.bold(primaryColor(text))
      : (text: string) => text;
  return chalk.white(
    n("    ▲    \n") +
      n(`  ${w("▾")} N ${e("▾")}  \n`) +
      w("◄ W") +
      m(" ■ ") +
      e("E ►\n") +
      s(`  ${w("▴")} S ${e("▴")}  \n`) +
      s("    ▼    ")
  );
}

const leftHand = [
  `     .==. `,
  `    /   |/`,
  `   /    / `,
  `  /    /  `,
  ` |        `,
  ` |        `,
  ` \\        `,
  ` /.       `,
  `/  ' .    `,
];

const rightHand = leftHand.map((line) =>
  line
    .replaceAll("\\", "&")
    .replaceAll("/", "\\")
    .replaceAll("&", "/")
    .split("")
    .reverse()
    .join("")
);

/**
 * Takes a string and returns a string with the text held by two hands. Scales with the text.
 * @param text The text to hold
 * @example
 */
export function holdMyText(text: string) {
  const alignedText = alignText(text, "left").split("\n");
  const textHeight = alignedText.length;
  // makes a copy so the actual constant doesnt get changed
  const lHand = [...leftHand];
  const rHand = [...rightHand];
  const lHandHeight = lHand.length;

  if (textHeight > lHandHeight) {
    // Add empty lines at the top of the side pieces to compensate for the higher text
    for (let i = 0; i < textHeight - lHandHeight; i++) {
      lHand.unshift(" ".repeat(lHand[0].length));
      rHand.unshift(" ".repeat(lHand[0].length));
    }
  }

  const lHandAndText = alignTextSideBySide(
    lHand.join("\n"),
    alignedText.join("\n")
  );

  const holdingHands = alignTextSideBySide(lHandAndText, rHand.join("\n"));
  return holdingHands;
}
