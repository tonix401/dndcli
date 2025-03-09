import { getDungeon, setDungeon } from "@utilities/CacheService.js";
import { totalClear } from "@utilities/ConsoleService.js";
import {
  getDungeonMapVisual,
  initiateDungeonMapWithHallways,
} from "@utilities/DungeonService.js";
import { getTerm } from "@utilities/LanguageService.js";
import { themedSelect } from "@utilities/MenuService.js";
import { enterRoom } from "./EnterRoom.js";

/**
 * Dungeon minigame.
 */
export async function dungeonMinigame() {
  setDungeon(initiateDungeonMapWithHallways());
  let goBack = false;
  while (true) {
    totalClear();
    console.log(getDungeonMapVisual());
    goBack = (await movePlayerMenu()) || false;
    if (goBack) {
      continue;
    }
    await enterRoom(getDungeon().rooms[getDungeon().player.y][getDungeon().player.x]);
  }
}

/**
 * Shows the movement menu for the player.
 * @returns Whether the user wants to go back.
 */
async function movePlayerMenu() {
  const dungeon = getDungeon();
  const currentRoom = dungeon.rooms[dungeon.player.y][dungeon.player.x];
  const directions = [
    {
      name: getTerm("north"),
      value: "north",
      disabled: !currentRoom.hallways.north,
    },
    {
      name: getTerm("east"),
      value: "east",
      disabled: !currentRoom.hallways.east,
    },
    {
      name: getTerm("south"),
      value: "south",
      disabled: !currentRoom.hallways.south,
    },
    {
      name: getTerm("west"),
      value: "west",
      disabled: !currentRoom.hallways.west,
    },
  ];

  const chosenDirection = await themedSelect({
    message: "Current position: " + dungeon.player.x + ", " + dungeon.player.y,
    choices: directions,
    canGoBack: true,
  });

  switch (chosenDirection) {
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
    case "goBack":
      return true;
    default:
      console.log("No valid movement selected");
  }

  dungeon.rooms[dungeon.player.y][dungeon.player.x].discovered = true;
  setDungeon(dungeon);
}
