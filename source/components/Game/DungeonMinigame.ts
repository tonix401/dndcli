import { getDungeon, setDungeon } from "@utilities/CacheService.js";
import {
  Dungeon,
  initiateDungeonMapWithHallways,
  Room,
} from "@game/world/DungeonService.js";
import { enterRoom } from "./EnterRoom.js";
import { dungeonMovementSelect } from "./DungeonMovementSelect.js";
import { totalClear } from "@core/ConsoleService.js";

/**
 * Dungeon minigame.
 */
export async function dungeonMinigame() {
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
    await enterRoom(currentRoom);

    setDungeon(dungeon);

    if (wantsToLeave) {
      totalClear();
      break;
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
      console.log("No valid movement selected");
  }

  dungeon.rooms[dungeon.player.y][dungeon.player.x].discovered = true;
  setDungeon(dungeon);
}
