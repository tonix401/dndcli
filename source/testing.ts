import chalk from "chalk";
import { pressEnter } from "./utilities/ConsoleService.js";
import getTrapAscii from "./resources/rooms/trapAscii.js";
import getEnemyAscii from "./resources/rooms/enemyAscii.js";
import getBossAscii from "./resources/rooms/bossAscii.js";
import getEmptyAscii from "./resources/rooms/emptyAscii.js";
import getTreasureAscii from "./resources/rooms/treasureAscii.js";

/////////////////////////
console.log(getEmptyAscii());
console.log(getTrapAscii());
console.log(getEnemyAscii());
console.log(getBossAscii());
console.log(getTreasureAscii());

/////////////////////////
console.log(chalk.red("END OF TEST"));
await pressEnter();
