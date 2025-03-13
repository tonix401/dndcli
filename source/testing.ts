import { themedInput } from "@components/ThemedInput.js";
import { themedPasswordInput } from "@components/ThemedPasswordInput.js";

async function test() {
  ///////////////////////
  console.log(
    await themedInput({ message: "password:", canGoBack: true })
  );

  /////////////////////////
}
await test();
console.log("End of test!");
