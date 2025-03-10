import {
  createPrompt,
  useState,
  useKeypress,
  useRef,
  useEffect,
  isEnterKey,
  type Status,
  isSpaceKey,
} from "@inquirer/core";
import {
  alignText,
  alignTextSideBySide,
  boxItUp,
  getTextInRoomAsciiIfNotTooLong,
  primaryColor,
  removeFormatting,
  secondaryColor,
} from "@utilities/ConsoleService.js";
import chalk from "chalk";
import ansiEscapes from "ansi-escapes";
import { getDataFromFile } from "@utilities/StorageService.js";
import { getTerm } from "@utilities/LanguageService.js";
import Config from "@utilities/Config.js";
import { getDungeonMapVisual } from "@utilities/DungeonService.js";

type Direction = "north" | "south" | "east" | "west" | "neutral";

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
    },
    done: (value: Direction) => void
  ) => {
    const { north = true, east = true, south = true, west = true } = config;
    const [status, setStatus] = useState<Status>("idle");
    const [direction, setDirection] = useState<Direction>("neutral");
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

    useKeypress((key, rl) => {
      clearTimeout(searchTimeoutRef.current);

      if ((isEnterKey(key) || isSpaceKey(key)) && direction !== "neutral") {
        rl.clearLine(0);
        setStatus("done");
        done(direction);
      } else {
        switch (key.name) {
          case "up":
            if (north) {
              setDirection("north");
            } else {
              setDirection("neutral");
            }
            break;
          case "down":
            if (south) {
              setDirection("south");
            } else {
              setDirection("neutral");
            }
            break;
          case "left":
            if (west) {
              setDirection("west");
            } else {
              setDirection("neutral");
            }
            break;
          case "right":
            if (east) {
              setDirection("east");
            } else {
              setDirection("neutral");
            }
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

    const boxOnBackground = getTextInRoomAsciiIfNotTooLong(megaBox);

    return megaBox + ansiEscapes.cursorHide;
  }
);

/**
 * Gets the direction visual for the available directions.
 * @example
 */
export function getCardinals(
  direction: Direction,
  north: boolean,
  east: boolean,
  south: boolean,
  west: boolean
) {
  const nothing = (text: string) => text;
  const n =
    direction === "north"
      ? (text: string) => chalk.bold(secondaryColor(text))
      : north
      ? nothing
      : chalk.dim;
  const s =
    direction === "south"
      ? (text: string) => chalk.bold(secondaryColor(text))
      : south
      ? nothing
      : chalk.dim;
  const e =
    direction === "east"
      ? (text: string) => chalk.bold(secondaryColor(text))
      : east
      ? nothing
      : chalk.dim;
  const w =
    direction === "west"
      ? (text: string) => chalk.bold(secondaryColor(text))
      : west
      ? nothing
      : chalk.dim;
  const m =
    direction === "neutral"
      ? (text: string) => chalk.bold(secondaryColor(text))
      : (text: string) => text;
  return (
    n("    ▲    \n") +
    n(`  ${w("▾")} N ${e("▾")}  \n`) +
    w("◄ W") +
    m(" ■ ") +
    e("E ►\n") +
    s(`  ${w("▴")} S ${e("▴")}  \n`) +
    s("    ▼    ")
  );
}
