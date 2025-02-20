import { pressEnter, skippableSlowWrite, totalClear } from "../utilities/ConsoleService.js";
import package_json from "../../package.json" with {type: "json"};
import { getTerm } from "../utilities/LanguageService.js";

const titleScreenAscii = `
 /$$$$$$$            /$$$$$$$           /$$$$$$  /$$       /$$$$$$
| $$__  $$          | $$__  $$         /$$__  $$| $$      |_  $$_/
| $$  \\ $$ /$$$$$$$ | $$  \\ $$        | $$  \\__/| $$        | $$  
| $$  | $$| $$__  $$| $$  | $$ /$$$$$$| $$      | $$        | $$  
| $$  | $$| $$  \\ $$| $$  | $$|______/| $$      | $$        | $$  
| $$  | $$| $$  | $$| $$  | $$        | $$    $$| $$        | $$  
| $$$$$$$/| $$  | $$| $$$$$$$/        |  $$$$$$/| $$$$$$$$ /$$$$$$
|_______/ |__/  |__/|_______/          \\______/ |________/|______/

${package_json.version} - ${getTerm("welcome")}`;

export async function titleScreen() {
  totalClear();
  await skippableSlowWrite(titleScreenAscii, { charDelay: 30, lineDelay: 0 });
  await pressEnter();
}
