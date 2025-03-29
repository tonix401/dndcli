import { dungeonMinigame } from "@components/DungeonMinigame.js";
import { pause } from "@utilities/ConsoleService.js";

async function test() {
  ///////////////////////
  await pause(1000);
  await dungeonMinigame();
  /////////////////////////
}
await test();
console.log("End of test!");
