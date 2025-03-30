import { holdMyText } from "@components/DungeonMovementSelect.js";
import Config from "@utilities/Config.js"

async function test() {
  ///////////////////////
  const text = ["wefuhpnaiowugnpaods", "wAOIFONDSAFDSKJVGNM", "WEFUIOhffwe"];
  for (let i = 0; i < 20; i++) {
    text.push("wiflonbiaubngvpiudsc")
    console.log(holdMyText(text.join("\n")));
  }
  /////////////////////////
}
await test();
console.log("End of test!");
