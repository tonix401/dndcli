import Config from "@utilities/Config.js";
import fs from "fs";
import path from "path";

async function test() {
  ///////////////////////

  const dir = path.join(Config.RESOURCES_DIR, "animations");

  function getFilesInDir(dir: string) {
    return fs.readdirSync(dir).filter((file) => {
      return fs.statSync(path.join(dir, file)).isFile();
    });
  }

  const files = getFilesInDir(dir);
  console.log(files);

  /////////////////////////
}
await test();
console.log("End of test!");
