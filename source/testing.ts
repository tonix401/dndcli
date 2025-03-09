import { enterRoom } from "@components/EnterRoom.js";
import { RoomTypes } from "@utilities/DungeonService.js";

async function test() {
  ///////////////////////

  // Example multi-line string
  await enterRoom({
    type: RoomTypes.CHEST,
    cleared: false,
    discovered: false,
    enemies: [],
    hallways: {
      north: false,
      east: false,
      south: false,
      west: false,
    },
    position: { x: 0, y: 0 },
  }).then(() => {
    console.log("Room entered successfully!");
  });

  /////////////////////////
}
await test().catch((err) => {
  console.error("Error during test:", err);
});
console.log("End of test!");
