import { Unit } from "../interfaces/unitInterfaces";

export class ConversionService {

    private static _instance: ConversionService;
    public static get instance() { return this._instance || (this._instance = new this()); }

    //#region  Public Functions

    // Make changes to the unit data, applicable to all kind of lists
    public makeUniversalUnitChanges(units: Unit[], printBasics: boolean = true) {
        for (const unit of units) {
            // Hightlight important Categories
            unit.categories = unit.categories.replace("Core", "<b>Core</b>");
            unit.categories = unit.categories.replace("Infantry", "<b>Infantry</b>");
            unit.categories = unit.categories.replace("Vehicle", "<b>Vehicle</b>");
            unit.categories = unit.categories.replace("Character", "<b>Character</b>");
            // Cleanup the unit table (e.g. shorten some unit names)
            for (const stat of unit.stats) {
                stat.unit = stat.unit.replace("[1]", "").replace("[2]", "").replace("[3]", "").replace("[4]", "");
                stat.unit = stat.unit.replace("wounds remaining", "wounds");
            }
            // Cleanup the weapon table (e.g. shorten some weapon names)
            for (const weapon of unit.weapons) {
                weapon.name = weapon.name.replace(", Frag missile", " (Frag)");
                weapon.name = weapon.name.replace(", Krak missile", " (Krak)");
                weapon.name = weapon.name.replace(", Standard", " (Standard)");
                weapon.name = weapon.name.replace(", Supercharge", " (Supercharge)");
                if (weapon.abilities.length === 1 && weapon.abilities[0] === "-")
                    weapon.abilities = "";

                // Add short info about the specific weapon type
                weapon.info = (weapon.type.startsWith("Rapid Fire") ? "Double shots if in half range" : weapon.info);
                weapon.info = (weapon.type.startsWith("Assault") ? "Advance and shoot but -1 hit" : weapon.info);
                weapon.info = (weapon.type.startsWith("Grenade") ? "One model in unit can use it" : weapon.info);
                weapon.info = (weapon.type.startsWith("Pistol") ? "Can shoot in Engagement Range" : weapon.info);
                weapon.info = (weapon.type.startsWith("Heavy") ? "If unit moved then -1 to hit" : weapon.info);
            }
            // Remove the "Grenades" weapons
            const fragGrenade = unit.weapons.findIndex(a => a.name.includes("Frag grenade"));
            if (fragGrenade > -1) {
                unit.weapons.splice(fragGrenade, 1);
            }
            // Remove the "Grenades" weapons
            const krakGrenade = unit.weapons.findIndex(a => a.name.includes("Krak grenade"));
            if (krakGrenade > -1) {
                unit.weapons.splice(krakGrenade, 1);
            }
            // Cleanup the ability table
            for (const ability of unit.abilities) {
                ability.ref = (ability.description.includes("litany") ? "Litany" : ability.ref);
                ability.ref = (ability.ref === undefined || ability.ref === null || !ability.ref ? "Ability" : ability.ref);

                // Shorten some of the very long descriptions
                switch (ability.name) {
                    case "Honour or Death": ability.description = "This model is eligible to perform a Heroic Intervention if it is within 6\" horizontally and 5\" vertically"; break;
                    case "Teleport Strike": ability.description = "Can deep strike in the reinforcement part of the Movement Phase, anywhere thats 9\" away from enemy models"; break;
                    case "Death from Above": ability.description = "Can deep strike in the reinforcement part of the Movement Phase, anywhere thats 9\" away from enemy models"; break;
                    case "Teleport Homer": ability.description = "Once per battle at the start of your Movement phase remove this unit, and in the NEXT Movement phase, set it up in your own demployment zone again"; break;
                    default: break;
                }
            }
        }
    }

    // Make changes to the unit data, applicable to all kind of "Space Marine" lists
    public makeSpaceMarineChanges(units: Unit[], printBasics: boolean = true) {
        for (const unit of units) {
            // Rewrite the default abilities (Angles of Death!)
            if (unit.abilities.find(a => a.name.includes("Angels of Death"))) {
                // Add the two "Angles of Death" rules that every model has
                if (printBasics) {
                    unit.abilities.push({
                        name: "AoD: Shall Know No Fear",
                        description: "If a Combat Attrition test is taken, ignore all modifiers",
                        ref: "Rule"
                    });
                    unit.abilities.push({
                        name: "AoD: Shock Assault",
                        description: "If this unit made a charge, was charged or performed a Heroic Intervention this turn, then until that fight is resolved, add 1 to the Attacks characteristic",
                        ref: "Rule"
                    });
                }

                // Add the other rules that are weapons specific
                // Check all weapon types the unit has and add the specific Doctrines and Bolter Discipline
                const hasBolter = (unit.weapons.find(w => w.name.includes("bolt") || w.name.includes("Bolt")) !== undefined);
                const hasRapidFire = (unit.weapons.find(w => w.type.startsWith("Rapid Fire")) !== undefined);
                const hasAssault = (unit.weapons.find(w => w.type.startsWith("Assault")) !== undefined);
                const hasGrenade = (unit.weapons.find(w => w.type.startsWith("Grenade")) !== undefined);
                const hasPistol = (unit.weapons.find(w => w.type.startsWith("Pistol")) !== undefined);
                const hasHeavy = (unit.weapons.find(w => w.type.startsWith("Heavy")) !== undefined);
                const hasMelee = (unit.weapons.find(w => w.type.startsWith("Melee")) !== undefined);
                if (hasRapidFire && hasBolter) {
                    unit.abilities.push({ name: "AoD: Bolter Discipline", description: "Rapid Fire Bolt weapons make double attacks if <mark>1) Target is in half range 2) Model is Infantry (not Centurion) and remained stationary 3) Model is Terminator or Biker</mark>", ref: "Rules" });
                }
                // Add the Combat Doctrines, but only if the Units have specific Weapons
                if ((hasHeavy || hasGrenade) && printBasics) {
                    unit.abilities.push({ name: "AoD: Devastator Doctrine", description: "Improve AP of every Heavy and Grenade weapon by 1.", ref: "Doctrine" });
                }
                if ((hasAssault || hasRapidFire) && printBasics) {
                    unit.abilities.push({ name: "AoD: Tactical Doctrine", description: "Improve AP of every Rapid Fire and Assault weapon by 1.", ref: "Doctrine" });
                }
                if ((hasPistol || hasMelee) && printBasics) {
                    unit.abilities.push({ name: "AoD: Assault Doctrine", description: "Improve AP of every Pistol and Melee weapon by 1.", ref: "Doctrine" });
                }

                // Remove the "Angles of Death" rule
                const aodIndex = unit.abilities.findIndex(a => a.name.includes("Angels of Death"));
                if (aodIndex > -1) {
                    unit.abilities.splice(aodIndex, 1);
                }
                // Remove the "Combat Squads" rule
                const combatSquats = unit.abilities.findIndex(a => a.name.includes("Combat Squads"));
                if (combatSquats > -1) {
                    unit.abilities.splice(combatSquats, 1);
                }
            }
        }
    }

    // Make changes to the unit data, applicable to all kind of "Grey Knight" lists
    public makeGreyKnightChanges(units: Unit[], printBasics: boolean = true) {
        for (const unit of units) {
            // Rewrite the default abilities (Knights of Titan!)
            if (unit.abilities.find(a => a.name.includes("Knights of Titan"))) {
                // Add the two "Knights of Titan" rules that every model has
                if (printBasics) {
                    unit.abilities.push({
                        name: "KoT: Shall Know No Fear",
                        description: "If a Combat Attrition test is taken, ignore all modifiers",
                        ref: "Rule"
                    });
                    unit.abilities.push({
                        name: "KoT: Masters of the Warp",
                        description: "Tide of Convergence (offensive) or Tide of Shadows (defensive)",
                        ref: "Tide"
                    });
                }

                // Add the other rules that are weapons specific
                // Check all weapon types the unit has and add the specific Doctrines and Bolter Discipline
                const hasBolter = (unit.weapons.find(w => w.name.includes("bolt") || w.name.includes("Bolt")) !== undefined);
                const hasRapidFire = (unit.weapons.find(w => w.type.startsWith("Rapid Fire")) !== undefined);
                if (hasRapidFire && hasBolter) {
                    unit.abilities.push({ name: "KoT: Bolter Discipline", description: "Rapid Fire Bolt weapons make double attacks if <mark>1) Target is in half range 2) Model is Infantry and remained stationary 3) Model is Terminator</mark>", ref: "Rules" });
                }

                // Remove the "Knights of Titan" rule
                const aodIndex = unit.abilities.findIndex(a => a.name.includes("Knights of Titan"));
                if (aodIndex > -1) {
                    unit.abilities.splice(aodIndex, 1);
                }
                // Remove the "Combat Squads" rule
                const combatSquats = unit.abilities.findIndex(a => a.name.includes("Combat Squads"));
                if (combatSquats > -1) {
                    unit.abilities.splice(combatSquats, 1);
                }
            }
        }
    }

    // Make changes to the unit data, specifically for Imperial Fists
    public makeImperialFistsChanges(units: Unit[]) {
        for (const unit of units) {
            // Bolter Rule - Exploding sixes
            let hasHeavyS7 = false;
            for (const weapon of unit.weapons) {
                const isBolter = ((weapon.name.includes("bolt") || weapon.name.includes("Bolt")) && weapon.type !== "Melee");
                weapon.abilities = (isBolter
                    ? ("<mark><b>IMPERIAL FIST</b></mark>: Exploding 6 " + (weapon.abilities ? " - " : "") + weapon.abilities)
                    : weapon.abilities);

                // Check if its a Heavy weapon with S7 or more
                hasHeavyS7 = ((weapon.type.startsWith("Heavy") && Number(weapon.s) >= 7 ? true : false) || hasHeavyS7);
            }
            // ImpFist Doctrine bonus
            if (hasHeavyS7) {
                unit.abilities.push({
                    name: "<mark>IMPERIAL FIST</mark>",
                    description: "In Devastator Doctrine, add D+1 for Heavy weapons with S7 or more against Vehicles or Buildings",
                    ref: "Doctrine"
                })
            }
        }
    }

    //#endregion

}
