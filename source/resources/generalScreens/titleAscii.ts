import chalk from "chalk";
import { getTerm } from "@core/LanguageService.js";
import packageJson from "@root/package.json" with {type: "json"};
import { primaryColor, secondaryColor } from "@core/ConsoleService.js";

const p = (text: string) => chalk.bold(primaryColor(text));
const s = (text: string) => secondaryColor(text);

export default function getTitleAscii() {
  return s(`
*******************************************************************************
          |                   |                  |                  |          
 _________|___________________|__________________|__________________|__________
|                   |                   |                   |                  
|___________________|___________________|___________________|__________________
        ${p("_______             _______            ______   __        ______")}
 _____ ${p("/      /\\")}  _______  ${p("/      /\\")}  ______  ${p("/     /\\ / /|")} ___  ${p("/     /|")} _____
|      ${p("$$$$$$$ /| _______  $$$$$$$ /|        /$$$$$$ /|$$ |      $$$$$$/")}
|_____ ${p("$$ |  $$ |/      /\\ $$ |  $$ | ______ $$ |  $$/ $$ |")} _____  ${p("$$ |")}  ______
       ${p("$$ |  $$ |$$$$$$$ /|$$ |  $$ |/     /|$$ |      $$ |")}        ${p("$$ |")}
 _____ ${p("$$ |  $$ |$$ |  $$ |$$ |  $$ |$$$$$$/ $$ |   __ $$ |")} _____  ${p("$$ |")}  ______
|      ${p("$$ |__$$ |$$ |  $$ |$$ |__$$ |        $$ |__/ /|$$ |")}_____   ${p("$$ |_")} 
|_____ ${p("$$/   $$/ $$ |  $$ |$$/   $$/")} _______ ${p("$$/   $$/ $$/     /|  $$/ /|")} _____
____/_ ${p("$$$$$$$/  $$/   $$/ $$$$$$$/")} __/______ ${p("$$$$$$/  $$$$$$$$/ $$$$$$/")} ______
/______ ______ ______ ______ ______ ______/______ ______ ______ ______ ______/_
____/______/______/______/______/______/______/______/______/______/______/____
${getAuthorLine()}
____/______/______/______/______/______/______/______/______/______/______/____
/______/______/______/______/______/______/______/______/______/______/______/_
*******************************************************************************`);};


function getAuthorLine(): string {
  const emptyLine =
    "/______/______/______/______/______/______/______/______/______/______/______/_";

  const welcomeMessage = ` ${packageJson.version} - ${getTerm("welcome")} `;
  if (welcomeMessage.length > emptyLine.length) {
    return emptyLine;
  }
  const middlePosition = Math.floor(emptyLine.length / 2);
  const startPosition = middlePosition - Math.floor(welcomeMessage.length / 2);
  const firstPart = emptyLine.substring(0, startPosition);
  const lastPart = emptyLine.substring(startPosition + welcomeMessage.length);
  const authorLine = firstPart + chalk.bold(p(welcomeMessage)) + lastPart;

  return authorLine;
}






