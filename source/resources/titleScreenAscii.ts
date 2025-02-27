import package_json from "../../package.json" with {type: "json"};
import { getTerm } from "../utilities/LanguageService.js";

export default `
 /$$$$$$$            /$$$$$$$           /$$$$$$  /$$       /$$$$$$
| $$__  $$          | $$__  $$         /$$__  $$| $$      |_  $$_/
| $$  \\ $$ /$$$$$$$ | $$  \\ $$        | $$  \\__/| $$        | $$  
| $$  | $$| $$__  $$| $$  | $$ /$$$$$$| $$      | $$        | $$  
| $$  | $$| $$  \\ $$| $$  | $$|______/| $$      | $$        | $$  
| $$  | $$| $$  | $$| $$  | $$        | $$    $$| $$        | $$  
| $$$$$$$/| $$  | $$| $$$$$$$/        |  $$$$$$/| $$$$$$$$ /$$$$$$
|_______/ |__/  |__/|_______/          \\______/ |________/|______/

${package_json.version} - ${getTerm("welcome")}`;