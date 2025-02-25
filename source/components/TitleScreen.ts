import titleScreenAscii from "../resources/titleScreenAscii.js";
import { pressEnter, skippableSlowWrite, totalClear } from "../utilities/ConsoleService.js";


export async function titleScreen() {
  // TODO: remove the deprecation warning for punycode
  totalClear();
  await skippableSlowWrite(titleScreenAscii, { charDelay: 30, lineDelay: 0 });
  await pressEnter();
}
