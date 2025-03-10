import { dungeonMinigame } from "@components/DungeonMinigame.js";

async function test() {
  ///////////////////////

  await dungeonMinigame()

  /////////////////////////
}
await test().catch((err) => {
  console.error("Error during test:", err);
});
console.log("End of test!");
