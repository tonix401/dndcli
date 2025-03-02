import { getEnlargeWindowAscii } from "../resources/generalScreens/enlargeWindowAscii.js";
import getTitleAscii from "../resources/generalScreens/titleAscii.js";
import {
  pressEnter,
  secondaryColor,
  skippableSlowWrite,
  totalClear,
} from "@utilities/ConsoleService.js";
import { log } from "@utilities/LogService.js";

export async function titleScreen() {
  await ensureWindowSize();
  totalClear();
  await skippableSlowWrite(getTitleAscii(), { charDelay: 0, lineDelay: 100 });
  await pressEnter();
}

const checkWindowSize = () => {
  const { columns, rows } = process.stdout;
  return { isOk: columns >= 100 && rows >= 36, rows: rows, columns: columns };
};

async function ensureWindowSize() {
  let isSizeOK = checkWindowSize().isOk;
  const { rows, columns } = checkWindowSize();
  while (!isSizeOK) {
    totalClear();
    console.log(secondaryColor(getEnlargeWindowAscii()));
    await pressEnter();
    isSizeOK = checkWindowSize().isOk;
  }
  log(`Title Screen: Window size is ok: ${columns} x ${rows}`);
}
