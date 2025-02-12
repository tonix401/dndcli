import { IEnemy } from "../types/IEnemy";
import Room, { RoomTypes } from "./Room";

type MapSize = 3 | 5 | 7 | 9 | 11;

export class Level {
  #map: Room[][];
  #size: MapSize;

  get size() {
    return this.#size;
  }

  get map() {
    return this.#map;
  }

  constructor(size: MapSize) {
    this.#map = this.initiateMap(size);
    this.#size = size;
  }

  private initiateMap(size: MapSize) {
    const map: Room[][] = [];
    for (let row = 0; row < size; row++) {
      const currentRow: Room[] = [];
      for (let col = 0; col < size; col++) {
        const roomType = this.getRandomRoomType();
        currentRow.push(
          new Room(
            roomType,
            roomType === RoomTypes.ENEMY ? this.getRandomEnemies() : []
          )
        );
      }
      map.push(currentRow);
    }
    return map;
  }

  /////////////////////////////////// CONCEPT //////////////////////////////////////////
  // private initiateHallways() {
  //   for (let i = 0; i < this.#size; i++) {
  //     for (let j = 0; j < this.#size; j++) {
  //       const currentRoom = this.#map[i][j];
  //       // For each room, check and assign neighbor connections if within boundaries.
  //       if (i > 0) {
  //         currentRoom.setNeighbor("north", this.#map[i - 1][j]);
  //       }
  //       if (i < this.#size - 1) {
  //         currentRoom.setNeighbor("south", this.#map[i + 1][j]);
  //       }
  //       if (j > 0) {
  //         currentRoom.setNeighbor("west", this.#map[i][j - 1]);
  //       }
  //       if (j < this.#size - 1) {
  //         currentRoom.setNeighbor("east", this.#map[i][j + 1]);
  //       }
  //     }
  //   }
  // }

  private getRandomRoomType() {
    switch (Math.floor(Math.random() * Object.values(RoomTypes).length)) {
      case 0:
        return RoomTypes.CHEST;
      case 1:
        return RoomTypes.ENEMY;
      case 2:
        return RoomTypes.TRAP;

      // more cases need to be added for future additions to the roomtypes

      default:
        return RoomTypes.ENEMY;
    }
  }

  private getRandomEnemies(amount: number = Math.floor(Math.random() * 5)) {
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
}
