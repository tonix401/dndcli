/**
 * Service aggregator module - Centralizes access to all utility services
 *
 * This module was specifically created to improve code readability by eliminating
 * the massive import lists that were becoming unwieldy
 * (looking at you GameService.ts 👀) T_T.
 *
 * Instead of 20+ individual service imports at the top of each file, consumers
 * can now import all needed services from this single module with a cleaner syntax:
 *
 *
 *  * IMPORTANT: To avoid circular dependencies, be careful when:
 * 1. Adding new services that depend on existing services
 * 2. Modifying existing services to depend on other services
 * 3. Creating bidirectional dependencies between services
 * - Try to avoid using this to avoid circular dependencies
 *   like mentioned above this was simply made to help
 *   readability and maintainability of GameService.ts since
 *   it was getting out of hand with the imports
 *
 *
 * If you encounter a circular dependency error, you can resolve it by:
 * - Creating an interface-only file that both dependent services can import
 * - Moving shared functionality to a new utility service
 * - Using dependency injection patterns instead of direct imports
 * - Switching to direct imports for the specific problematic services
 * - Best of luck! 🍀 :D
 *
 * This provides a more maintainable solution while preserving the logical organization
 * of individual service files within the codebase.
 */

import * as Console from "@utilities/ConsoleService.js";
import * as NarrativeDisplay from "@utilities/NarrativeDisplayService.js";
import * as Choice from "@utilities/ChoiceService.js";
import * as Narrative from "@utilities/narrative/NarrativeService.js";
import * as NarrativeGenerationService from "@utilities/narrative/NarrativeService.js";
import * as Objective from "@utilities/narrative/ObjectiveService.js";
import * as CharacterAnalysis from "@utilities/character/CharacterAnalysisService.js";
import * as AI from "@utilities/AIService.js";
import * as Dice from "@utilities/combat/DiceService.js";
import * as Inventory from "@utilities/character/InventoryService.js";
import * as Equipment from "@utilities/character/EquipmentService.js";
import * as ItemGen from "@utilities/character/ItemGenerator.js";
import * as SaveLoad from "@utilities/SaveLoadService.js";
import * as Storage from "@utilities/StorageService.js";
import * as Cache from "@utilities/CacheService.js";
import * as Log from "@utilities/LogService.js";
import * as Language from "@utilities/LanguageService.js";
import * as Enemy from "@utilities/combat/EnemyService.js";
import * as ArtService from "@utilities/narrative/ArtService.js";
import * as EventHandlerService from "@utilities/EventHandlerService.js";
import * as GameStateService from "@utilities/GameStateService.js";

export {
  Console,
  NarrativeDisplay,
  Choice,
  Narrative,
  Objective,
  CharacterAnalysis,
  AI,
  Dice,
  Inventory,
  Equipment,
  ItemGen,
  SaveLoad,
  Storage,
  Cache,
  Log,
  Language,
  Enemy,
  ArtService,
  EventHandlerService,
  GameStateService,
  NarrativeGenerationService as NarrativeService,
};
