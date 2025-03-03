import chalk from "chalk";
import readline from 'readline';
import process from 'process';
import { totalClear } from "@utilities/ConsoleService.js";
/////////////////////////

// Set up readline interface
readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
}

// Function to get terminal size
function getTerminalSize() {
  const { columns, rows } = process.stdout;
  return { columns, rows };
}

// Set up the interval to print terminal size
const intervalId = setInterval(() => {
  totalClear();
  const { columns, rows } = getTerminalSize();
  if(columns < 100 || rows < 35) {
  console.log(`Zu klein`);
  }
}, 200);

// Listen for keypress events
process.stdin.on('keypress', (_str, key) => {
  if (key.name === 'q') {
    clearInterval(intervalId);
    process.stdin.setRawMode(false);
  }
});

/////////////////////////
console.log(chalk.red("END OF TEST"));
