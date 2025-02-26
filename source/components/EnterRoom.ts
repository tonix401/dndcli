import chalk from "chalk";
import emptyAscii from "../resources/rooms/emptyAscii";
import trapAscii from "../resources/rooms/trapAscii";
import { pressEnter, themedInput, themedSelect, totalClear } from "../utilities/ConsoleService";
import { RoomTypes } from "../utilities/DungeonService";
import { getTerm } from "../utilities/LanguageService";
import { log } from "../utilities/LogService";
import { getTheme } from "../utilities/CacheService";
import enemyAscii from "../resources/rooms/enemyAscii";

const yesno = [
  { name: getTerm("yes"), value: true },
  { name: getTerm("no"), value: false },
];

export async function enterRoom(type: RoomTypes) {
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
  console.log(emptyAscii);
  console.log(
    chalk.hex(getTheme().primaryColor)(getTerm("emptyRoomDiscovered"))
  );

  const wantsToInspect = await themedSelect({
    message: getTerm("inspectRoom"),
    choices: yesno,
  });

  if(wantsToInspect) {
    if(Math.random() < 0.25) {
      // TODO: add "get small item" logic
      console.log("TODO: add get small item logic");
    } else {
      console.log(chalk.hex(getTheme().secondaryColor)(getTerm("nothingHere")));
    }
  }
  await pressEnter();
}

async function trapRoom() {
  log("Enter Room: trap room");
  console.log(trapAscii);
  console.log(
    // user is not supposed to notice that its a trap, at least not easily, so the term is the same as with an empty room
    chalk.hex(getTheme().primaryColor)(getTerm("emptyRoomDiscovered"))
  );

  const wantsToInspect = await themedSelect({
    message: getTerm("inspectRoom"),
    choices: yesno,
  });

  if (wantsToInspect) {
    if (Math.random() < 0.25) {
      console.log(chalk.hex(getTheme().secondaryColor)(getTerm("nothingHere")));
    } else {
      // TODO: implement falling for trap logic
      console.log("TODO: implement falling for trap logic");
    }
  }
  await pressEnter();
}

async function enemyRoom() {
  log("Enter Room: enemy room");
  console.log(enemyAscii);
  console.log(
    chalk.hex(getTheme().primaryColor)(getTerm("enemyRoomDiscovered"))
  );

  await themedInput({message: getTerm("enterToFight")});

  // TODO: implement runCombat();
}

async function chestRoom() {
  log("Enter Room: enemy room");
  console.log(enemyAscii);
  console.log(
    chalk.hex(getTheme().primaryColor)(getTerm("enemyRoomDiscovered"))
  );

  await themedInput({ message: "chest" });

  // TODO: implement runCombat();
}

async function bossRoom() {
  log("Enter Room: enemy room");
  console.log(enemyAscii);
  console.log(
    chalk.hex(getTheme().primaryColor)(getTerm("enemyRoomDiscovered"))
  );

  await themedInput({ message: "boss" });

  // TODO: implement runCombat();
}

