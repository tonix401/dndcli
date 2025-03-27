import chalk from "chalk";
import {
  alignText,
  boxItUp,
  getTextOnBackground,
  pause,
  totalClear,
} from "@core/ConsoleService.js";

const frames = [
  "\n(°□°)       ┬─┬      \n",
  "\n (°□°)      ┬─┬      \n",
  "\n  (°□°)     ┬─┬      \n",
  "\n   (°□°)    ┬─┬      \n",
  "\n    (╯°□°)  ┬─┬      \n",
  "\n    (╯°□°)╯ ┬─┬      \n",
  "\n   (╯°□°)╯︵ ┻━┻     \n",
  "\n   (╯°□°)╯︵     ┻━┻ \n",
  "\n \\(°□°)/          ┻━┻\n",
  "\n  (°□°)/          ┻━┻\n",
  "\n  \\(°□°)          ┻━┻\n",
  "\n  (°□°)/          ┻━┻\n",
  "\n  \\(°□°)/         ┻━┻\n",
  "\n  (⌐■_■)/         ┻━┻\n",
  "\n  \\(⌐■_■)         ┻━┻\n",
  "\n  (⌐■_■)/         ┻━┻\n",
  "\n  (⌐■_■)          ┻━┻\n",
  "\n   (⌐■_■)         ┻━┻\n",
  "\n    (⌐■_■)        ┻━┻\n",
  "\n     (⌐■_■)       ┻━┻\n",
  "\n      (⌐■_■)      ┻━┻\n",
  "\n       ( ■_■ )    ┻━┻\n",
  `\n      ( ${chalk.redBright("■_■")} )   ┻━┻\n`,
  `
     /         \\
    |   🟥 🟥   | you're next
     \\   ${chalk.redBright("‾‾")}    /   
`,
];

export async function flipATable() {
  for (let i in frames) {
    totalClear();
    console.log(getTextOnBackground(boxItUp(alignText(frames[i], "left"))));
    const index = parseInt(i);
    let delay;
    switch (true) {
      case index >= 21:
        delay = 1000;
        break;
      case index >= 16:
        delay = 400;
        break;
      default:
        delay = 200;
    }
    await pause(delay);
  }
}
