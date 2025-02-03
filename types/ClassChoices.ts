import { getTerm, Language } from "../utilities/LanguageService.js";

export function getClassChoices(lang: Language){
  return [
    {
      name: getTerm("swordFighter", lang),
      value: "swordFighter",
    },
    {
      name: getTerm("mage", lang),
      value: "mage",
    },
    {
      name: getTerm("archer", lang),
      value: "archer",
    },
    {
      name: getTerm("thief", lang),
      value: "thief",
    },
  ];}
