import { loadPlayerData, savePlayerData } from "@utilities/CloudService.js";
import { totalClear } from "@utilities/ConsoleService.js";
import { IApiPlayer } from "@utilities/IApiPlayer.js";
import { getDataFromFile } from "@utilities/StorageService.js";

totalClear();
/////////////////////////

const sampleChar: IApiPlayer = {
  id: "1",
  name: "twe",
  settings: getDataFromFile("settings"),
  gameState: getDataFromFile("gameState"),
  characters: getDataFromFile("character"),
};

await savePlayerData(sampleChar);

const data = await loadPlayerData("1");
console.log(data);

/////////////////////////
console.log("End of test!");