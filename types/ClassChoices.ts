import { getTerm } from "../utilities/LanguageService.js";

export function getClassChoices(){
  return [
    {
      name: getTerm("swordFighter"),
      value: "swordFighter",
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
  ];}
