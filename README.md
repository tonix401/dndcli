
# **DnD-CLI**

### **Authors**

- [@tonix401](https://github.com/tonix401) (Tom W.)
- [@akoSiThaesler](https://github.com/akoSiThaesler) (Julian T.)

### **MUST HAVES**
**Character Creation and Management**: 
Character creation with customizable attributes (e.g., origin, class, name).

**Campaign Mode**: Provide a campaign mode where the user, with the character they created, experiences an AI-generated narrative simulating a D&D-style adventure. Allow for random encounters (dungeons and combat) and dynamic story developments during gameplay 

**Admin Mode**: Encrypted password protection. Provide a menu to view and manage stored game data, logs, and settings through a dedicated developer menu. Feature to reset options.

**Local JSON-File Storage**: Implement JSON-based storage for characters, game state, and settings

**Logging and Debugging**: Gracefully manage unexpected inputs. Proper logging and constantly save data changes to the persistent storage

**AI Implementation**: Integrate AI components to assist in content generation and dynamic storytelling during gameplay. (In Campaign mode)

**Theme and Language Settings**: Offer multiple CLI themes featuring different color schemes to enhance the visual experience. Enable dynamic switching between themes from within the settings menu for personalized interface customization.

### **NICE TO HAVES**

**Turn-Based Combat System**: Provide players with actionable combat choices (attack, defend, or use an item) that are clear and intuitive

**Procedural Dungeon**: Generate random dungeons using a set of predefined room types (such as entrance, trap, treasure, enemy, and boss rooms).

**Adaptive visuals**: Self made backgrounds and text manipulation for cool visuals in the menus and game

**Dynamic NPC Interaction & Storytelling**: Generate adaptive NPC dialogues and story events that evolve based on player actions. Adjust NPC responses dynamically in accordance with the player’s choices and game context for a richer narrative.

**Tests**: Offer tests for the dungeon, combat, shop, animations and the experimental image generation feature

**Animations**: Animations for combat actions

### **Setup and Execution**

After cloning, install dependencies and Compile TS to JS

```bash
  npm run setup
```

Start the game

```bash
  npm run start
```

### Let's get rollin'
![test](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdXo5cGg4eHpmZTZqYmtkcWJmdHMzZWozNHMyZDd4dHd4c2NsN2ZsNSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3oriNPdeu2W1aelciY/giphy.gif)

### Licence
[MIT](https://choosealicense.com/licenses/mit/)