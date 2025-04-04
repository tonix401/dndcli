import { IItem } from "@utilities/IITem.js";
import ICharacter from "@utilities/ICharacter.js";
import { generateRandomItem } from "@utilities/character/ItemGenerator.js";
import { addItemToInventory } from "@utilities/character/InventoryService.js";
import { saveDataToFile } from "@utilities/StorageService.js";
import { themedSelectInRoom } from "@components/ThemedSelectInRoom.js";
import {
  accentColor,
  pressEnter,
  primaryColor,
  secondaryColor,
  totalClear,
} from "@utilities/ConsoleService.js";
import { shopSelect } from "@components/ShopSelect.js";
import { getTerm } from "@utilities/LanguageService.js";

/**
 * Generate items for a shop based on player level and location
 */
function generateShopInventory(playerLevel: number): IItem[] {
  const inventory: IItem[] = [];
  const itemCount = 5 + Math.floor(Math.random() * 5); // 5-10 items

  // Generate basic consumables
  for (let i = 0; i < itemCount; i++) {
    const item = generateRandomItem(playerLevel);

    // Set a gold value based on rarity
    let baseValue = 10; // Base value for common items
    switch (item.rarity) {
      case "Common":
        baseValue = 10;
        break;
      case "Uncommon":
        baseValue = 25;
        break;
      case "Rare":
        baseValue = 50;
        break;
      case "Epic":
        baseValue = 100;
        break;
      case "Legendary":
        baseValue = 250;
        break;
    }

    item.value = baseValue * Math.max(1, Math.floor(playerLevel / 2));
    inventory.push(item);
  }

  return inventory;
}

/**
 * Calculate sell value for an item (usually lower than buy price)
 */
function getSellValue(item: IItem): number {
  const buyPrice = item.value || 10;
  return Math.floor(buyPrice * 0.5); // 50% of buy price
}

/**
 * Handle shop transaction logic
 */
export async function handleShopInteraction(
  character: ICharacter
): Promise<void> {
  character.currency ??= 0;

  // Generate shop inventory
  const shopInventory = generateShopInventory(character.level);
  while (true) {
    totalClear();
    console.log(accentColor("\n=== MERCHANT SHOP ==="));
    console.log(primaryColor(`Gold: ${character.currency}`));

    const options = [
      { name: "Buy Items", value: "buy" },
      { name: "Sell Items", value: "sell" },
      { name: "Leave Shop", value: "goBack" },
    ];

    const action = await shopSelect({
      message: "What would you like to do?",
      choices: options,
      canGoBack: true,
    });

    if (action === "goBack") {
      break;
    }

    if (action === "buy") {
      await handleBuyItems(character, shopInventory);
    } else if (action === "sell") {
      await handleSellItems(character);
    }
  }

  console.log(
    secondaryColor("You leave the shop and continue your adventure.")
  );
}

/**
 * Handle buying items
 */
async function handleBuyItems(
  character: ICharacter,
  shopInventory: IItem[]
): Promise<void> {
  totalClear();
  const buyChoices = shopInventory.map(
    (item, index): { name: string; value: number | "goBack" } => {
      return {
        name: `${item.name} (${item.rarity}) - ${item.description} - ${item.value} gold`,
        value: index,
      };
    }
  );

  buyChoices.push({ name: getTerm("goBack"), value: "goBack" });

  const selectedIndex = await themedSelectInRoom({
    message: `Your gold: ${character.currency}. What would you like to buy?`,
    choices: buyChoices,
    canGoBack: true,
  });

  if (selectedIndex === "goBack") {
    return;
  }

  const selectedItem = shopInventory[selectedIndex as number];

  // Check if player can afford it
  if (character.currency < (selectedItem.value || 0)) {
    console.log(secondaryColor("You cannot afford this item."));
    await pressEnter();
    return;
  }

  // Add to inventory
  const added = addItemToInventory(character, { ...selectedItem });
  if (added) {
    // Deduct gold
    character.currency -= selectedItem.value || 0;
    console.log(
      primaryColor(
        `You purchased ${selectedItem.name} for ${selectedItem.value} gold.`
      )
    );
    saveDataToFile("character", character);
  } else {
    console.log(
      secondaryColor("Your inventory is full. You cannot buy this item.")
    );
  }

  await pressEnter();
}

/**
 * Handle selling items
 */
async function handleSellItems(character: ICharacter): Promise<void> {
  totalClear();
  if (!character.inventory || character.inventory.length === 0) {
    console.log(
      secondaryColor("Your inventory is empty. You have nothing to sell.")
    );
    await pressEnter();
    return;
  }

  const sellChoices = character.inventory.map(
    (item, index): { name: string; value: number | "goBack" } => {
      const sellValue = getSellValue(item);
      return {
        name: `${item.name} (x${item.quantity}) - Sell for ${sellValue} gold each`,
        value: index,
      };
    }
  );

  sellChoices.push({ name: getTerm("goBack"), value: "goBack" });

  const selectedIndex = await themedSelectInRoom({
    message: "What would you like to sell?",
    choices: sellChoices,
    canGoBack: true,
  });

  if (selectedIndex === "goBack") {
    return;
  }

  const selectedItem = character.inventory[selectedIndex];

  // Handle quantity if more than 1
  let quantityToSell = 1;
  if (selectedItem.quantity > 1) {
    const quantityOptions = Array.from(
      { length: selectedItem.quantity },
      (_, i) => {
        return { name: `${i + 1}`, value: i + 1 };
      }
    );
    quantityOptions.push({ name: "Cancel", value: 0 });

    quantityToSell = await themedSelectInRoom({
      message: `How many do you want to sell? (You have ${selectedItem.quantity})`,
      choices: quantityOptions,
    });

    if (quantityToSell === 0) {
      return;
    }
  }

  // Calculate total sale value
  const saleValue = getSellValue(selectedItem) * quantityToSell;

  // Update inventory
  selectedItem.quantity -= quantityToSell;
  if (selectedItem.quantity <= 0) {
    character.inventory.splice(selectedIndex, 1);
  }

  // Add gold
  character.currency += saleValue;
  console.log(
    primaryColor(
      `You sold ${quantityToSell}x ${selectedItem.name} for ${saleValue} gold.`
    )
  );

  saveDataToFile("character", character);
  await pressEnter();
}
