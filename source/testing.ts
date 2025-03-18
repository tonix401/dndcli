import { shopSelect } from "@components/ShopSelect.js";

async function test() {
  ///////////////////////

  console.log(
    await shopSelect({
      message: "test",
      choices: ["awefvcesrbhgsfdbhfad", "bagrefsfdszvbad", "cavfrvvdsvadsvzcx", "aafndiaslvnbinjcvoljzcx", "bpq3gk[idsafasd", "cagcdfgsagq3gtfqt4gh"],
    })
  );

  /////////////////////////
}
await test();
console.log("End of test!");
