/**
 * Clears the console completely, without leaving any annoying scroll-up buffer behind
 */
export function totalClear() {
  process.stdout.write("\x1Bc\x1B[3J\x1B[H\x1B[2J");
}