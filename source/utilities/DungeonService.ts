import { IEnemy } from "@utilities/IEnemy.js";
import { getDungeon } from "@utilities/CacheService.js";
import {
  alignTextSideBySide,
  primaryColor,
  secondaryColor,
} from "@utilities/ConsoleService.js";
import { getDataFromFile } from "./StorageService.js";
import { getRandomEnemy } from "./EnemyService.js";

export enum RoomTypes {
  START = "START",
  ENEMY = "ENEMY",
  TRAP = "TRAP",
  BOSS = "BOSS",
  EMPTY = "EMPTY",
  CHEST = "CHEST",

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

export function getDungeonMapVisual() {
  const dungeon = getDungeon();
  let dungeonVisual: string[] = [];
  for (let i = 0; i < dungeon.size; i++) {
    dungeonVisual[i] = "";
  }

  for (let i in dungeon.rooms) {
    let row: string = "";
    for (let j in dungeon.rooms[i]) {
      const room = dungeon.rooms[i][j];
      const miniRoom = getMiniRoomVisual(room, parseInt(i), parseInt(j));
      row = alignTextSideBySide(row, miniRoom);
    }
    dungeonVisual[i] += row;
  }

  return dungeonVisual.join("\n");
}

export function getMiniRoomVisual(room: Room, row: number, col: number) {
  const playerX = getDungeon().player.x;
  const playerY = getDungeon().player.y;
  if (
    room.discovered === false &&
    !hasHallwayToPlayerRoom(room, getDungeon().rooms[playerY][playerX])
  ) {
    return secondaryColor([".···. ", ":   : ", "'···' "].join("\n"));
  }

  const isPlayerInRoom =
    playerX === room.position.x && playerY === room.position.y;
  let middleSymbol = "?";
  middleSymbol = room.discovered
    ? room.type.toUpperCase().substring(0, 1)
    : middleSymbol;
  middleSymbol = isPlayerInRoom ? "@" : middleSymbol;

  const northRoom = getDungeon().rooms[row - 1]?.[col] || null;
  const westRoom = getDungeon().rooms[row]?.[col - 1] || null;

  const southRoom = getDungeon().rooms[row + 1]?.[col] || null;
  const eastRoom = getDungeon().rooms[row]?.[col + 1] || null;

  const eastHallway =
    eastRoom?.hallways.west || room.hallways.east
      ? "╠" + secondaryColor("═")
      : "║ ";
  const southHallway =
    southRoom?.hallways.north || room.hallways.south ? "╦" : "═";
  const westHallway = westRoom?.hallways.east || room.hallways.west ? "╣" : "║";
  const northHallway =
    northRoom?.hallways.south || room.hallways.north ? "╩" : "═";

  const eastEnd = eastRoom !== null ? " " : "";

  const color = isPlayerInRoom ? primaryColor : secondaryColor;
  return color(
    [
      `╔═${northHallway}═╗` + eastEnd,
      westHallway + " " + middleSymbol + " " + eastHallway,
      `╚═${southHallway}═╝` + eastEnd,
    ].join("\n")
  );
}

/**
 * Initiates and give back a dungeon with hallways connecting the rooms
 * @param size The size of the dungeon. The default is DungeonSizes.SMALL
 * @returns The dungeon object with rooms and hallways
 */
export function initiateDungeonMapWithHallways(
  size: DungeonSizes = DungeonSizes.SMALL
): Dungeon {
  const dungeon: Dungeon = { size: size, rooms: [], player: { x: 0, y: 0 } };
  const character = getDataFromFile("character");

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

  // Depth first search to create a tree graph connecting all rooms
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

  for (let y in dungeon.rooms) {
    for (let x in dungeon.rooms[y]) {
      const room = dungeon.rooms[y][x];
      fillRoomWithEnemyIfNecessary(room, character?.level || 10);
    }
  }
  return dungeon;
}

function fillRoomWithEnemyIfNecessary(room: Room, difficulty: number) {
  switch (room.type) {
    case RoomTypes.ENEMY:
      room.enemies = [getRandomEnemy(difficulty)];
      break;
    case RoomTypes.BOSS:
      room.enemies = [getRandomEnemy(difficulty + 10)];
      break;
    default:
      room.enemies = [];
      break;
  }
}

function hasHallwayToPlayerRoom(room: Room, playerRoom: Room): boolean {
  return (
    (room.hallways.north &&
      playerRoom.position.y === room.position.y - 1 &&
      playerRoom.position.x === room.position.x) ||
    (room.hallways.east &&
      playerRoom.position.x === room.position.x + 1 &&
      playerRoom.position.y === room.position.y) ||
    (room.hallways.south &&
      playerRoom.position.y === room.position.y + 1 &&
      playerRoom.position.x === room.position.x) ||
    (room.hallways.west &&
      playerRoom.position.x === room.position.x - 1 &&
      playerRoom.position.y === room.position.y)
  );
}
