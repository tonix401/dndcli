import { pressEnter, skippableSlowWrite, totalClear } from "../utilities/ConsoleService.js";
import package_json from "../../package.json" with {type: "json"};

const titleScreenAscii = `
 /$$$$$$$            /$$$$$$$           /$$$$$$  /$$       /$$$$$$
| $$__  $$          | $$__  $$         /$$__  $$| $$      |_  $$_/
| $$  \\ $$ /$$$$$$$ | $$  \\ $$        | $$  \\__/| $$        | $$  
| $$  | $$| $$__  $$| $$  | $$ /$$$$$$| $$      | $$        | $$  
| $$  | $$| $$  \\ $$| $$  | $$|______/| $$      | $$        | $$  
| $$  | $$| $$  | $$| $$  | $$        | $$    $$| $$        | $$  
| $$$$$$$/| $$  | $$| $$$$$$$/        |  $$$$$$/| $$$$$$$$ /$$$$$$
|_______/ |__/  |__/|_______/          \\______/ |________/|______/

${package_json.version}`;

export async function titleScreen() {
  totalClear();
  await skippableSlowWrite(titleScreenAscii, { charDelay: 1, lineDelay: 0 });
  await pressEnter();
}
