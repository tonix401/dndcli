import { getEnlargeWindowAscii } from "@resources/generalScreens/enlargeWindowAscii.js";
import getTitleAscii from "@resources/generalScreens/titleAscii.js";
import {
  pressEnter,
  secondaryColor,
  skippableSlowWrite,
  totalClear,
} from "@utilities/ConsoleService.js";
import { log } from "@utilities/LogService.js";
import { tutorial } from "components/GeneralTEMP/Tutorial.js";
import {
  ensureSetupAndCheckIsNew,
  saveDataToFile,
} from "@utilities/StorageService.js";
import Config from "@utilities/Config.js";

export async function titleScreen() {
  await ensureWindowSize();
  await showTitleScreen();
  await checkIsNewAndSetup();
}

const checkWindowSize = () => {
  const { columns, rows } = process.stdout;
  return { isOk: columns >= 100 && rows >= 35, rows: rows, columns: columns };
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

async function showTitleScreen() {
  totalClear();
  await skippableSlowWrite(getTitleAscii(), { charDelay: 0, lineDelay: 100 });
  await pressEnter();
}

async function checkIsNewAndSetup() {
  totalClear();
  const isNew = await ensureSetupAndCheckIsNew();

  if (isNew) {
    log("New Player Screen: New Player detected");
    await tutorial(isNew);
    saveDataToFile("character", Config.START_CHARACTER);
  }
}
