import { getTerm } from "../utilities/LanguageService.js";

export function getClassChoices() {
  return [
    {
      name: getTerm("swordsman"),
      value: "swordsman",
    },
    {
      name: getTerm("mage"),
      value: "mage",
    },
    {
      name: getTerm("archer"),
      value: "archer",
    },
    {
      name: getTerm("thief"),
      value: "thief",
    },
  ];
}
