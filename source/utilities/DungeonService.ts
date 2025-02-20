import chalk from "chalk";
import { IEnemy } from "../types/IEnemy";
import { getDungeon, getTheme, setDungeon } from "./CacheService.js";
import { themedSelect } from "./ConsoleService.js";
import { getTerm } from "./LanguageService.js";

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

export const normalRoomTypes = Object.values(RoomTypes).filter(
  (type) => type !== "BOSS" && type !== "START"
);

export type Room = {
  type: RoomTypes;
  enemies: IEnemy[];
  cleared: boolean;
  discovered: boolean;
  hallways: { north: boolean; east: boolean; south: boolean; west: boolean };
  position: { x: number; y: number };
};

export enum DungeonSizes {
  TINY = 3,
  SMALL = 5,
  MEDIUM = 7,
  LARGE = 9,
  GIANT = 11,
}

export type Dungeon = {
  size: DungeonSizes;
  rooms: Room[][];
  player: { x: number; y: number };
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

  // underscores in the constant names to align the strings, to check for errors (and because it looks nicer)
  const LeftRightHallway = `════╝               ╚════\n            ${character}             \n════╗               ╔════\n### ║               ║ ###\n`;
  const RightHallway____ = `### ║               ╚════\n### ║       ${character}             \n### ║               ╔════\n### ║               ║ ###\n`;
  const LeftHallway_____ = `════╝               ║ ###\n            ${character}        ║ ###\n════╗               ║ ###\n### ║               ║ ###\n`;
  const LeftRightWall___ = `### ║               ║ ###\n### ║       ${character}        ║ ###\n### ║               ║ ###\n### ║               ║ ###\n`;

  const bottomHallway = "### ╚═════╗   ╔═════╝ ###\n######### ║   ║ #########";
  const bottomWallxxx = "### ╚═══════════════╝ ###\n#########################";

  const roomTop = top ? topHallway : topWall;
  const roomBottom = bottom ? bottomHallway : bottomWallxxx;
  let roomCenter;

  if (left && right) {
    roomCenter = LeftRightHallway;
  } else if (left && !right) {
    roomCenter = LeftHallway_____;
  } else if (!left && right) {
    roomCenter = RightHallway____;
  } else {
    roomCenter = LeftRightWall___;
  }

  const room = roomTop + roomCenter + roomBottom;
  return room;
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

export function getDungeonMapVisual() {
  const dungeon = getDungeon();
  let dungeonVisual = "";

  for (let row = 0; row < dungeon.size; row++) {
    let rowVisual = [[""], [""], [""], [""], [""]];
    for (let col = 0; col < dungeon.size; col++) {
      const miniRoom = getMiniRoomVisual(dungeon.rooms[row][col], row, col);
      rowVisual[0].push(miniRoom.split("\n")[0]);
      rowVisual[1].push(miniRoom.split("\n")[1]);
      rowVisual[2].push(miniRoom.split("\n")[2]);
      rowVisual[3].push(miniRoom.split("\n")[3]);
    }
    dungeonVisual += rowVisual.map((row) => row.join("")).join("\n");
  }

  return dungeonVisual;
}

function getMiniRoomVisual(room: Room, row: number, col: number) {
  const playerX = getDungeon().player.x;
  const playerY = getDungeon().player.y;

  const northRoom = getDungeon().rooms[row - 1]?.[col];
  const westRoom = getDungeon().rooms[row - 1]?.[col];

  const eastHallway = room.hallways.east ? "=" : " ";
  const southHallway = room.hallways.south ? "║" : " ";

  // In case we want to adjust the room design later (also need to adjust the dungeon map visual to include the new rows)
  const westHallway = westRoom?.hallways.east ? "=" : " ";
  const northHallway = northRoom?.hallways.south ? "║" : " ";

  let symbol = " ";
  if (room === undefined) {
    return "     \n     \n     \n     ";
  } else if (playerX === room.position.x && playerY === room.position.y) {
    symbol = chalk.bold.hex(getTheme().primaryColor)("@");
  } else if (!room.discovered) {
    symbol = "?";
  } else {
    symbol =
      room.type === RoomTypes.EMPTY || room.cleared
        ? " "
        : room.type.substring(0, 1);
  }

  return `${chalk.hex(getTheme().secondaryColor)(
    "╔═══╗ \n║ "
  )}${symbol}${chalk.hex(getTheme().secondaryColor)(
    ` ║${eastHallway}\n╚═══╝ \n  ${southHallway}   `
  )}`;
}

export function getRoomAtPosition(x: number, y: number) {
  return getDungeon().rooms[y][x] ?? undefined;
}

export function initiateDungeonMapWithHallways(
  size: DungeonSizes = DungeonSizes.SMALL
) {
  const dungeon: Dungeon = { size: size, rooms: [], player: { x: 0, y: 0 } };

  // Create an empty grid of rooms with a default type
  for (let y = 0; y < size; y++) {
    const row: Room[] = [];
    for (let x = 0; x < size; x++) {
      row.push({
        type: RoomTypes.EMPTY,
        enemies: [],
        cleared: false,
        discovered: false,
        hallways: { north: false, east: false, south: false, west: false },
        position: { x, y },
      });
    }
    dungeon.rooms.push(row);
  }

  // Place the boss room in the middle
  const mid = Math.floor(size / 2);
  dungeon.rooms[mid][mid].type = RoomTypes.BOSS;

  // Place the start room in the top-left corner
  dungeon.rooms[0][0].type = RoomTypes.START;
  dungeon.rooms[0][0].discovered = true;

  // Prepare a visited matrix for spanning tree creation
  const visited: boolean[][] = new Array(size)
    .fill(0)
    .map(() => new Array(size).fill(false));

  // Helper function to randomize direction order
  function shuffle<T>(array: T[]): T[] {
    return array.sort(() => Math.random() - 0.5);
  }

  // DFS to create a tree graph connecting all rooms
  function dfs(x: number, y: number) {
    visited[y][x] = true;
    const directions = shuffle([
      { dx: 0, dy: -1, hallKey: "north" as const, oppKey: "south" as const },
      { dx: 1, dy: 0, hallKey: "east" as const, oppKey: "west" as const },
      { dx: 0, dy: 1, hallKey: "south" as const, oppKey: "north" as const },
      { dx: -1, dy: 0, hallKey: "west" as const, oppKey: "east" as const },
    ]);
    for (const { dx, dy, hallKey, oppKey } of directions) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < size && ny >= 0 && ny < size && !visited[ny][nx]) {
        // Create a hallway connection between current room and neighbor
        dungeon.rooms[y][x].hallways[hallKey] = true;
        dungeon.rooms[ny][nx].hallways[oppKey] = true;

        // Set a random type for rooms that are not the boss room
        if (dungeon.rooms[ny][nx].type === RoomTypes.EMPTY) {
          dungeon.rooms[ny][nx].type =
            normalRoomTypes[Math.floor(Math.random() * normalRoomTypes.length)];
        }

        dfs(nx, ny);
      }
    }
  }

  // Start DFS from the boss room to ensure connectivity across dungeon
  dfs(mid, mid);

  return dungeon;
}


