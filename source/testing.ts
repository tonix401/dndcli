import getEmptyAscii from "@resources/rooms/emptyAscii.js";
import {
  getTextOnBackground,
  playAnimation,
  pressEnter,
} from "@utilities/ConsoleService.js";
import fs from "fs-extra";
async function test() {
  ///////////////////////

  while (true) {
    await playAnimation("magicAttack.json");
    await pressEnter();
  }

  /////////////////////////
}
await test();
console.log("End of test!");

function reverseString(str: string) {
  return str.split("").reverse().join("");
}
