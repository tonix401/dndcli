import {
  pressEnter,
  primaryColor,
  secondaryColor,
  totalClear,
} from "@utilities/ConsoleService.js";
import { Room, RoomTypes } from "@utilities/DungeonService.js";
import { getTerm } from "@utilities/LanguageService.js";
import { log } from "@utilities/LogService.js";
import getTreasureAscii from "../resources/rooms/treasureAscii.js";
import getEmptyAscii from "../resources/rooms/emptyAscii.js";
import getTrapAscii from "../resources/rooms/trapAscii.js";
import getEnemyAscii from "../resources/rooms/enemyAscii.js";
import getBossAscii from "../resources/rooms/bossAscii.js";
import { themedInput, themedSelect } from "@utilities/MenuService.js";

const yesno = [
  { name: getTerm("yes"), value: true },
  { name: getTerm("no"), value: false },
];

export async function enterRoom(room: Room) {
  const { type } = room;
  totalClear();
  switch (type) {
    case RoomTypes.EMPTY:
      await emptyRoom();
      break;
    case RoomTypes.TRAP:
      await trapRoom();
      break;
    case RoomTypes.ENEMY:
      await enemyRoom();
      break;
    case RoomTypes.BOSS:
      await bossRoom();
      break;
    case RoomTypes.CHEST:
      await chestRoom();
      break;
  }
}

async function emptyRoom() {
  log("Enter Room: empty room");
  console.log(getEmptyAscii());
  console.log(primaryColor(getTerm("emptyRoomDiscovered")));

  const wantsToInspect = await themedSelect({
    message: getTerm("inspectRoom"),
    choices: yesno,
  });

  if (wantsToInspect) {
    if (Math.random() < 0.25) {
      // TODO: add "get small item" logic
    } else {
      console.log(secondaryColor(getTerm("nothingHere")));
    }
  }
  await pressEnter();
}

async function trapRoom() {
  log("Enter Room: trap room");
  console.log(getTrapAscii());
  console.log(
    // user is not supposed to notice that its a trap, at least not easily, so the term is the same as with an empty room
    primaryColor(getTerm("emptyRoomDiscovered"))
  );

  const wantsToInspect = await themedSelect({
    message: getTerm("inspectRoom"),
    choices: yesno,
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
}

async function enemyRoom() {
  log("Enter Room: enemy room");
  console.log(getEnemyAscii());
  console.log(primaryColor(getTerm("enemyRoomDiscovered")));

  await themedInput({ message: getTerm("enterToFight") });

  // TODO: implement runCombat();
}

async function chestRoom() {
  log("Enter Room: enemy room");
  console.log(getTreasureAscii());
  console.log(primaryColor(getTerm("enemyRoomDiscovered")));

  await themedInput({ message: "chest" });

  // TODO: implement openChest();
}

async function bossRoom() {
  log("Enter Room: enemy room");
  console.log(getBossAscii());
  console.log(primaryColor(getTerm("enemyRoomDiscovered")));

  await themedInput({ message: "boss" });

  // TODO: implement engageBossFight();
}
