import { playAnimation, totalClear } from "@utilities/ConsoleService.js";
import fs from "fs";
import path from "path";
import Config from "@utilities/Config.js";

totalClear();
async function test() {
/////////////////////////

await playAnimation("attack.json", 2);
await playAnimation("bomb.json");
await playAnimation("rip.json", 10);

// fs.writeFileSync(
//   path.join(Config.RESOURCES_DIR, "animations", "rip.json"),
//   JSON.stringify( {"totalFrames": 8,
//   "frameTime": 100,
//   "frames": rip.frames
//     .map((frame) => {
//       for (let index = 0; index < 6; index++) {
//         frame.shift();
//       }
//       for (let index = 0; index < 7; index++) {
//         frame.pop();
//       }
//       return frame;
//     })
// } , null, 2),
// );



/////////////////////////
};
await test().catch((err) => {
  console.error("Error during test:", err);
})
console.log("End of test!");
