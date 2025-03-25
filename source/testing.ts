import { totalClear } from "@core/ConsoleService.js";
import crypto from "crypto";

async function test() {
  ///////////////////////
  totalClear();
  console.log(crypto.createHash("sha256").update("123").digest("hex"));

  /////////////////////////
}
await test();
console.log("End of test!");
