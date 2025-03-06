import { playAnimation, totalClear } from "@utilities/ConsoleService.js";
import { getDataFromFile } from "@utilities/StorageService.js";
import {
  getCombatStatusBar,
  getHealthBar,
} from "@resources/generalScreens/combatStatusBar.js";

async function test() {
  /////////////////////////
  const testEnemy = {
    name: "Test Dummy",
    hp: 80,
    maxhp: 80,
    attack: 8,
    defense: 3,
    xpReward: 50,
    moves: [
      {
        name: "Curse Strike",
        type: "attack" as "attack",
        multiplier: 1.3,
        description: "A dark, cursed attack.",
      },
      {
        name: "Defensive Ward",
        type: "defend" as "defend",
        description: "Raises its defenses for a short time.",
      },
      {
        name: "Intimidating Howl",
        type: "scare" as "scare",
        description:
          "Attempts to frighten you, making you lose your next turn.",
      },
      {
        name: "Healing Ritual",
        type: "heal" as "heal",
        healAmount: 12,
        description: "Calls on dark forces to heal itself.",
      },
    ],
  };

  console.log(getCombatStatusBar(getDataFromFile("character"), testEnemy));

  // fs.writeFileSync(
  //   path.join(Config.RESOURCES_DIR, "animations", "rip.json"),
  //   JSON.stringify( {"totalFrames": 8,
  //   "frameTime": 100,
  //   "frames": rip.frames
  //     .map((frame) => {
  //       for (let index = 0; index < 6; index++) {
  //         frame.shift();
  //       }
  //       for (let index = 0; index < 7; index++) {
  //         frame.pop();
  //       }
  //       return frame;
  //     })
  // } , null, 2),
  // );

  for (let i = 0; i <= 100; i += 10) {
    console.log(getHealthBar(i, 100));
  }

  /////////////////////////
}
await test().catch((err) => {
  console.error("Error during test:", err);
});
console.log("End of test!");
