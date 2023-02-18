import { Unit } from "../interfaces/unitInterfaces";

export class ConversionService {

    private static _instance: ConversionService;
    public static get instance() { return this._instance || (this._instance = new this()); }

    //#region  Public Functions

    // Make changes to the unit data, applicable to all kind of "Space Marine" lists
    public makeSpaceMarineChanges(units: Unit[]) {
        for (const unit of units) {
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
            // Cleanup the ability table
            for (const ability of unit.abilities) {
                ability.ref = (ability.description.includes("litany") ? "Litany" : ability.ref);
                ability.ref = (ability.ref === undefined || ability.ref === null || !ability.ref ? "Ability" : ability.ref);
            }
            // Rewrite the default abilities (Angles of Death!)
            if (unit.abilities.find(a => a.name.includes("Angels of Death"))) {
                // Add the two "Angles of Death" rules that every model has
                // unit.abilities.push({
                //     name: "Astartes: Shall Know No Fear",
                //     description: "If a Combat Attrition test is taken, ignore all modifiers",
                //     ref: "Rule"
                // });
                unit.abilities.push({
                    name: "Astartes: Shock Assault",
                    description: "If this unit made a charge, was charged or performed a Heroic Intervention this turn, then until that fight is resolved, add 1 to the Attacks characteristic",
                    ref: "Rule"
                });

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
                    unit.abilities.push({ name: "Astartes: Bolter Discipline", description: "Rapid Fire Bolt weapons make double the attacks if 1) Target is within half weapon range 2) Model is Infantry (not Centurion) and remained stationary 3) Model is Terminator or Biker", ref: "Rules" });
                }
                // Add the Combat Doctrines, but only if the Units have specific Weapons
                if (hasHeavy || hasGrenade) {
                    unit.abilities.push({ name: "Astartes: Devastator Doctrine", description: "Improve AP of every Heavy and Grenade weapon by 1.", ref: "Doctrine" });
                }
                if (hasAssault || hasRapidFire) {
                    unit.abilities.push({ name: "Astartes: Tactical Doctrine", description: "Improve AP of every Rapid Fire and Assault weapon by 1.", ref: "Doctrine" });
                }
                if (hasPistol || hasMelee) {
                    unit.abilities.push({ name: "Astartes: Assault Doctrine", description: "Improve AP of every Pistol and Melee weapon by 1.", ref: "Doctrine" });
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

    // Make changes to the unit data, specifically for Imperial Fists
    public makeImperialFistsChanges(units: Unit[]) {
        for (const unit of units) {
            // Bolter Rule - Exploding sixes
            for (const weapon of unit.weapons) {
                const isBolter = (weapon.name.includes("bolt") || weapon.name.includes("Bolt"));
                weapon.abilities = (isBolter ? ("IMPERIAL FIST: Exploding 6 " + weapon.abilities) : weapon.abilities);
            }
            // ImpFist Doctrine bonus
            for (const ability of unit.abilities) {
                if (ability.name.startsWith("Devastator Doctrine"))
                    ability.description += " - IMPERIAL FIST: For Heavy Weapons against Vehicle or Building +1 Damage";
            }
        }
    }

    //#endregion

}
