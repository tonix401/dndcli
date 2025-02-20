import { dungeonMinigame } from "./components/DungeonMinigame.js";
import { getAllEnglishTermsLength } from "./utilities/LanguageService.js";

await dungeonMinigame();

console.log(getAllEnglishTermsLength());
