import { getErrorMessage } from "@resources/generalScreens/errorMessage.js";

async function test() {
  ///////////////////////

  console.log(getErrorMessage("Das hier ist eine sehr sehr lange error message. Ich hoffe die ellipse funktioniert richtig und ich muss nicht die ganze message sehen, Test test test test test test test test test test test test test test test test test test test test test test test test tes tet st"))

  /////////////////////////
}
await test();
console.log("End of test!");
