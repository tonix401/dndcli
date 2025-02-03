export default interface CharacterData {
  name: string;
  class: string;
  level: string;
  xp: string;
  hp: string;
  abilities: {
    maxhp: string;
    strength: string;
    mana: string;
    dexterity: string;
    charisma: string;
    luck: string;
  };
  inventory: {
    item1: string;
    item2: string;
    item3: string;
    item4: string;
    item5: string;
  };
  lastPlayed: string;
}
