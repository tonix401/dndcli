import { themedInput } from "./utilities/ConsoleService.js";
import { getAllEnglishTermsLength } from "./utilities/LanguageService.js";

console.log("length of all english terms: " + getAllEnglishTermsLength());

await themedInput({message: "doesnt matter", validate: (text) => {
  return text === "test" ? true : "not test";
}})