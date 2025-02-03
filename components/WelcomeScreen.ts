import { input } from "@inquirer/prompts";
import { getTerm, Language } from "../utilities/LanguageService.js";
import chalk from "chalk";
import { totalClear } from "../utilities/ConsoleService.js";

export async function welcomeScreen(lang: Language){
    totalClear();

    console.log(chalk.bold(chalk.blueBright(getTerm("welcome", lang))));
    await pause(2500);
    console.log(getTerm("goodName", lang));
    await pause(3000);
    console.log(getTerm("right", lang));
    await pause(2000);
    console.log(getTerm("adventure", lang));
    await pause(2500);
    console.log(getTerm("authors", lang));
    await pause(2000);
    await input({message: getTerm("backToMenu", lang)});
}

async function pause(time:number) {
   return new Promise((resolve) => setTimeout(resolve, time));
}