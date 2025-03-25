import {getLanguage, getPassword, getTheme} from "@core/CacheService.js";
import {skippableSlowWrite, totalClear} from "@core/ConsoleService.js";
import {getTerm} from "@core/LanguageService.js";
import {log} from "@core/LogService.js";
import {saveDataToFile} from "./StorageService.js";

export async function exitProgram() {
    totalClear();
    log("Index: Program ended");
    saveDataToFile("settings", {
        language: getLanguage(),
        theme: getTheme(),
        password: getPassword(),
    });
    await skippableSlowWrite(getTerm("goodbye"));
    process.exit(0);
}
