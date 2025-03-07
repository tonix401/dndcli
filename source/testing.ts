import fs from "fs-extra";
import path from "path";
import Config from "@utilities/Config.js";
import running from "@resources/animations/running.json" with { type: "json" };
import { playAnimation } from "@utilities/ConsoleService.js";

async function test() {
  ///////////////////////

  await playAnimation("running.json", 2)

  /////////////////////////
}
await test().catch((err) => {
  console.error("Error during test:", err);
});
console.log("End of test!");
