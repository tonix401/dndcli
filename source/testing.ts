import { tutorial } from "@components/NewPlayerIntro.js";

async function test() {
  ///////////////////////

  await tutorial(false);
  
  /////////////////////////
}
await test().catch((err) => {
  console.error("Error during test:", err);
});
console.log("End of test!");
