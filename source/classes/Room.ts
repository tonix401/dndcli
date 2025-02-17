import { IEnemy } from "../types/IEnemy";

export enum RoomTypes {
  TRAP = 1,
  ENEMY = 2,
  CHEST = 3,
  BOSS = 4,
}

export default class Room {
  #type: RoomTypes;
  #enemies: IEnemy[];
  #cleared: boolean = false;
  #discovered: boolean = false;

  constructor(type: RoomTypes, enemies: IEnemy[]) {
    this.#type = type;
    this.#enemies = enemies;
    this.#cleared = enemies.length === 0;
  }

  get type() {
    return this.#type;
  }

  get enemies() {
    return this.#enemies;
  }

  get cleared() {
    return this.#cleared;
  }

  get discovered() {
    return this.#discovered;
  }

  set enemies(enemies: IEnemy[]) {
    this.#enemies = enemies;
  }
  set cleared(value: boolean) {
    this.#cleared = value;
  }

  set discovered(value: boolean) {
    this.#discovered = value;
  }
}
