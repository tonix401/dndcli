import { IEnemy } from "../types/IEnemy";
import { getDungeon, getPlayerPosition } from "./CacheService.js";

export enum RoomTypes {
  START = "START",
  ENEMY = "ENEMY",
  TRAP = "TRAP",
  BOSS = "BOSS",
  EMPTY = "EMPTY",
  CHEST = "CHEST", // added CHEST for random room type generation

  // for future additions

  // TREASURE = "TREASR",
  // SHOP = "SHOP",
  // HEALING = "HEAL",
  // SECRET = "SECRET",
}

export type Room = {
  type: RoomTypes;
  enemies: IEnemy[];
  cleared: boolean;
  discovered: boolean;
  hallways: { north: boolean; east: boolean; south: boolean; west: boolean };
  position: { x: number; y: number };
};

export enum DungeonSize {
  TINY = 3,
  SMALL = 5,
  MEDIUM = 7,
  LARGE = 9,
  GIANT = 11,
}

export type Dungeon = {
  size: DungeonSize;
  rooms: Room[][];
};

/**
 * A function that generates a room visual, with hallways in the given directions
 * @param right Whether there is a hallway to the right
 * @param bottom Whether there is a hallway to the bottom
 * @param left Whether there is a hallway to the left
 * @param top Whether there is a hallway to the top
 * @param character The character that will be in the middle of the room, please think about character width for alignment reasons
 * @returns The string representing a room
 * @example
 * ######### ║   ║ #########
 * ### ╔═════╝   ╚═════╗ ###
 * ### ║               ║ ###
 * ════╝               ╚════
 *             ╬
 * ════╗               ╔════
 * ### ║               ║ ###
 * ### ╚═══════════════╝ ###
 * #########################
 */
export function getRoomVisual(
  right: boolean,
  bottom: boolean,
  left: boolean,
  top: boolean,
  character: string = "@"
) {
  const topHallway =
    "######### ║   ║ #########\n### ╔═════╝   ╚═════╗ ###\n### ║               ║ ###\n";
  const topWall =
    "#########################\n### ╔═══════════════╗ ###\n### ║               ║ ###\n";

  // Xs in the constant names to align the strings, to check for errors (and because it looks nicer)
  const LeftRightHallway = `════╝               ╚════\n            ${character}             \n════╗               ╔════\n### ║               ║ ###\n`;
  const RightHallwayxxxx = `### ║               ╚════\n### ║       ${character}             \n### ║               ╔════\n### ║               ║ ###\n`;
  const LeftHallwayxxxxx = `════╝               ║ ###\n            ${character}        ║ ###\n════╗               ║ ###\n### ║               ║ ###\n`;
  const LeftRightWallxxx = `### ║               ║ ###\n### ║       ${character}        ║ ###\n### ║               ║ ###\n### ║               ║ ###\n`;

  const bottomHallway = "### ╚═════╗   ╔═════╝ ###\n######### ║   ║ #########";
  const bottomWallxxx = "### ╚═══════════════╝ ###\n#########################";

  const roomTop = top ? topHallway : topWall;
  const roomBottom = bottom ? bottomHallway : bottomWallxxx;
  let roomCenter;

  if (left && right) {
    roomCenter = LeftRightHallway;
  } else if (left && !right) {
    roomCenter = LeftHallwayxxxxx;
  } else if (!left && right) {
    roomCenter = RightHallwayxxxx;
  } else {
    roomCenter = LeftRightWallxxx;
  }

  const room = roomTop + roomCenter + roomBottom;
  return room;
}

export function initiateDungeonMap(wantedSize: DungeonSize) {
  const dungeon: Dungeon = { size: wantedSize, rooms: [] };
  for (let row = 0; row < wantedSize; row++) {
    const currentRow: Room[] = [];
    for (let col = 0; col < wantedSize; col++) {
      const roomType = getRandomRoomType();
      currentRow.push({
        type: roomType,
        enemies: roomType === RoomTypes.ENEMY ? getRandomEnemies() : [],
        cleared: false,
        discovered: false,
        hallways: { north: false, east: false, south: false, west: false },
        position: { x: col, y: row },
      });
    }
    dungeon.rooms.push(currentRow);
  }
  return dungeon;
}

function getRandomRoomType() {
  const roomTypesArray = Object.values(RoomTypes);
  const randomNumber = Math.floor(Math.random() * roomTypesArray.length);
  return roomTypesArray[randomNumber];
}

function getRandomEnemies(amount: number = Math.floor(Math.random() * 4) + 1) {
  let enemies: IEnemy[] = [];

  for (let i = 0; i < amount; i++) {
    enemies.push({
      name: "Goblin",
      hp: 10,
      attack: 3,
      defense: 1,
      xpReward: 20,
    });
  }
  return enemies;
}

// export function getDungeonMapVisual() {
//   const dungeon = getDungeon();
//   let dungeonVisual = "";
//   for (let row = 0; row < dungeon.size; row++) {
//     let rowVisual = "";
//     for (let col = 0; col < dungeon.size; col++) {
//       const room = dungeon.rooms[row][col];
//       const roomVisual = room.discovered
//         ? room.type.substring(0, 1) + " "
//         : "? ";
//       rowVisual += roomVisual;
//     }
//     dungeonVisual += rowVisual + "\n";
//   }
//   return dungeonVisual;
// }

export function getDungeonMapVisual() {
  const dungeon = getDungeon();
  let dungeonVisual = "";

  for (let row = 0; row < dungeon.size; row++) {
    let rowVisual = [[""], [""], [""], [""], [""]];
    for (let col = 0; col < dungeon.size; col++) {
      const miniRoom = getMiniRoomVisual(dungeon.rooms[row][col]);
      rowVisual[0].push(miniRoom.split("\n")[0]);
      rowVisual[1].push(miniRoom.split("\n")[1]);
      rowVisual[2].push(miniRoom.split("\n")[2]);
      rowVisual[3].push(miniRoom.split("\n")[3]);
    }
    dungeonVisual += rowVisual.map((row) => row.join("")).join("\n");
  }

  return dungeonVisual;
}

function getMiniRoomVisual(room: Room) {
  const playerX = getPlayerPosition().x;
  const playerY = getPlayerPosition().y;
  const eastHallway = room.hallways.east ? "=" : " ";
  const southHallway = room.hallways.south ? "║" : " ";

  let symbol = " ";

  if (playerX === room.position.x && playerY === room.position.y) {
    symbol = "@";
  } else if (!room.discovered) {
    symbol = "?";
  } else {
    symbol = room.type === RoomTypes.EMPTY || room.cleared ? " " : room.type.substring(0, 1);
  }

  return `╔═══╗ \n║ ${symbol} ║${eastHallway}\n╚═══╝ \n  ${southHallway}   `;
}
