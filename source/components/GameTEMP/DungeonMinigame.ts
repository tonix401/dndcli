import {
  getDungeon,
  renewDungeon,
  setDungeon,
} from "@utilities/CacheService.js";
import {
  Dungeon,
  initiateDungeonMapWithHallways,
  Room,
} from "@utilities/world/DungeonService.js";
import { enterRoom } from "./EnterRoom.js";
import { dungeonMovementSelect } from "./DungeonMovementSelect.js";
import {
  accentColor,
  pressEnter,
  totalClear,
} from "@utilities/ConsoleService.js";
import { log } from "@utilities/LogService.js";
import { themedSelectInRoom } from "components/GeneralTEMP/ThemedSelectInRoom.js";
import { getYesNo } from "@utilities/MenuService.js";
import { getTerm } from "@utilities/LanguageService.js";

type DungeonResult = "completed" | "fled" | "died";

/**
 * Dungeon minigame.
 */
export async function dungeonMinigame(): Promise<DungeonResult> {
  if (!getDungeon()) {
    setDungeon(initiateDungeonMapWithHallways());
  }

  while (true) {
    const dungeon = getDungeon();
    let currentRoom = dungeon.rooms[dungeon.player.y][dungeon.player.x];

    totalClear();
    const wantsToLeave =
      (await movePlayerMenu(currentRoom, dungeon)) === "goBack";

    currentRoom = dungeon.rooms[dungeon.player.y][dungeon.player.x];
    const roomResult = await enterRoom(currentRoom);

    // While in the map screen leaving with "escape" will lead to this confirmation menu
    // If confirming the player will leave the dungeon and will not be able to enter again
    if (wantsToLeave) {
      totalClear();
      const confirmLeaving = await themedSelectInRoom({
        message: getTerm("confirmDungeonExit"),
        choices: getYesNo(),
      });
      if (confirmLeaving) {
        totalClear();
        console.log(accentColor(getTerm("fleeDungeon")));
        await pressEnter();
        renewDungeon();
        return "fled";
      }
    }

    // Completing the dungeon
    if (roomResult === "bossCleared") {
      totalClear();
      console.log(accentColor(getTerm("bossCleared")));
      renewDungeon();
      await pressEnter();
      return "completed";
    }

    // Dying...
    if (roomResult === "died") {
      totalClear();
      return "died";
    }
  }
}

/**
 * Shows the movement menu for the player.
 * @returns Whether the user wants to go back.
 */
async function movePlayerMenu(
  currentRoom: Room,
  dungeon: Dungeon
): Promise<void | "goBack"> {
  const chosenDirection = await dungeonMovementSelect({
    north: currentRoom.hallways.north,
    south: currentRoom.hallways.south,
    west: currentRoom.hallways.west,
    east: currentRoom.hallways.east,
    canGoBack: true,
  });

  switch (chosenDirection) {
    case "goBack":
      return "goBack";
    case "north":
      dungeon.player.y -= 1;
      break;
    case "south":
      dungeon.player.y += 1;
      break;
    case "west":
      dungeon.player.x -= 1;
      break;
    case "east":
      dungeon.player.x += 1;
      break;
    default:
      log("Dungeon Minigame: Invalid direction selected.");
  }

  dungeon.rooms[dungeon.player.y][dungeon.player.x].discovered = true;
  setDungeon(dungeon);
}
