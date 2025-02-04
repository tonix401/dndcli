/**
 * Clears the console completely, without leaving any annoying scroll-up buffer behind
 */
export function totalClear(): void {
  process.stdout.write("\x1Bc\x1B[3J\x1B[H\x1B[2J");
}

/**
 * Pauses for a given number of milliseconds
 * @example
 * await pause(2000);
 * -> pauses the app for 2 seconds
 */
export async function pause(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

/**
 * The coolest console writing ever
 * @param message The message to print
 * @param charDelay The delay between characters
 * @param lineDelay The delay between lines
 * @param autoLineDelay Whether the delay between lines should be automatically calculated based on the length of the line. This overwrites the lineDelay parameter
 * @param formatting A formatting function
 * @example slowWrite("Some text", 40, 500, false, (char) => chalk.bold(chalk.cyan(char)));
 */
export async function slowWrite(
  message: string,
  charDelay: number = 40,
  lineDelay: number = 500,
  autoLineDelay: boolean = false,
  formatting = (char: string) => char,
) {
  const lines = message.split("\n");
  for (let i in lines) {
    const line = lines[i].split("");
    for (let j in line) {
      process.stdout.write(formatting(line[j]));
      await pause(charDelay);
    }
    process.stdout.write("\n");
    await pause(autoLineDelay ?  line.length * 10 : lineDelay);
  }
}
