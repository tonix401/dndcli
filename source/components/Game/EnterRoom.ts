import {
  accentColor,
  pressEnter,
  primaryColor,
  secondaryColor,
  totalClear,
} from "@utilities/ConsoleService.js";
import { Room, RoomTypes } from "@utilities/DungeonService.js";
import { getTerm } from "@utilities/LanguageService.js";
import { log } from "@utilities/LogService.js";
import getTreasureAscii from "@resources/rooms/treasureAscii.js";
import getEmptyAscii from "@resources/rooms/emptyAscii.js";
import getTrapAscii from "@resources/rooms/trapAscii.js";
import getEnemyAscii from "@resources/rooms/enemyAscii.js";
import getBossAscii from "@resources/rooms/bossAscii.js";
import { themedSelect } from "@utilities/MenuService.js";
import { runCombat } from "src/combat.js";
import { getDataFromFile, saveDataToFile } from "@utilities/StorageService.js";
import { getDungeon } from "@utilities/CacheService.js";
import Config from "@utilities/Config.js";
import getClosedTreasureAscii from "@resources/rooms/closedTreasureAscii.js";
import { themedInput } from "@components/ThemedInput.js";
import { generateRandomItem } from "@utilities/ItemGenerator.js";

const getYesNo = () => [
  { name: getTerm("yes"), value: true },
  { name: getTerm("no"), value: false },
];

export async function enterRoom(room: Room) {
  if (room.cleared) {
    return;
  }
  const { type } = room;
  totalClear();
  switch (type) {
    case RoomTypes.EMPTY:
      await emptyRoom(room);
      break;
    case RoomTypes.TRAP:
      await trapRoom(room);
      break;
    case RoomTypes.ENEMY:
      await enemyRoom(room);
      break;
    case RoomTypes.BOSS:
      await bossRoom(room);
      break;
    case RoomTypes.CHEST:
      await chestRoom(room);
      break;
  }
}

/**
 * Handles the empty room.
 */
async function emptyRoom(room: Room) {
  const char = getDataFromFile("character") ?? Config.START_CHARACTER;
  log("Enter Room: empty room");
  console.log(getEmptyAscii());
  console.log(primaryColor(getTerm("emptyRoomDiscovered")));

  const wantsToInspect = await themedSelect({
    message: getTerm("inspectRoom"),
    choices: getYesNo(),
  });

  if (wantsToInspect) {
    if (Math.random() < 0.25) {
      giveItemToPlayer(1);
    } else {
      console.log(secondaryColor(getTerm("nothingHere")));
    }
  }
  await pressEnter();
  clearRoom(room);
}

/**
 * Handles the trap room.
 */
async function trapRoom(room: Room) {
  log("Enter Room: trap room");
  console.log(getTrapAscii());
  console.log(
    // user is not supposed to notice that its a trap, at least not easily, so the term is the same as with an empty room
    primaryColor(getTerm("emptyRoomDiscovered"))
  );

  const wantsToInspect = await themedSelect({
    message: getTerm("inspectRoom"),
    choices: getYesNo(),
  });

  if (wantsToInspect) {
    if (Math.random() < 0.25) {
      console.log(secondaryColor(getTerm("nothingHere")));
    } else {
      // TODO: implement falling for trap logic
      console.log("TODO: implement falling for trap logic");
    }
  }
  await pressEnter();
  clearRoom(room);
}

/**
 * Handles the enemy room.
 */
async function enemyRoom(room: Room) {
  log("Enter Room: enemy room");
  console.log(getEnemyAscii());
  console.log(primaryColor(getTerm("enemyRoomDiscovered")));

  await pressEnter({ message: getTerm("enterToFight") });

  const character = getDataFromFile("character");
  const enemy =
    getDungeon().rooms[getDungeon().player.y][getDungeon().player.x].enemies[0];
  const combatResult = await runCombat(character, enemy);
  if (combatResult.success) {
    clearRoom(room);
  }
}

/**
 * Handles the chest room.
 */
async function chestRoom(room: Room) {
  log("Enter Room: enemy room");
  console.log(getClosedTreasureAscii());
  console.log(primaryColor(getTerm("chestRoomDiscovered")));
  await pressEnter();
  totalClear();
  console.log(getTreasureAscii());
  giveItemToPlayer(getDataFromFile("character").level ?? 10);
  await pressEnter();
  clearRoom(room);
}

/**
 * Handles the boss room.
 */
async function bossRoom(room: Room) {
  log("Enter Room: enemy room");
  console.log(getBossAscii());
  console.log(primaryColor(getTerm("enemyRoomDiscovered")));

  await pressEnter({ message: getTerm("enterToFight") });

  const character = getDataFromFile("character");
  const enemy =
    getDungeon().rooms[getDungeon().player.y][getDungeon().player.x].enemies[0];
  const combatResult = await runCombat(character, enemy);
  if (combatResult.success) {
    clearRoom(room);
  }
}

/**
 * Clears the room, marking it as cleared and removing enemies.
 * @param room The room to clear.
 */
function clearRoom(room: Room) {
  room.cleared = true;
  room.discovered = true;
  room.enemies = [];
}

/**
 * Gives an item to the player and shows a message.
 * @param level The level of the item.
 */
function giveItemToPlayer(level: number) {
  const character = getDataFromFile("character");
  const newItem = generateRandomItem(level);
  saveDataToFile("character", {
    ...character,
    inventory: [...character.inventory, newItem],
  });
  console.log(
    accentColor(`${getTerm("foundItem")} ${newItem.name} (${newItem.rarity})`)
  );
}
