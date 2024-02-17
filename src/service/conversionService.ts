import { Unit } from "../interfaces/unitInterfaces";

export class ConversionService {

    private static _instance: ConversionService;
    public static get instance() { return this._instance || (this._instance = new this()); }

    //#region  Public Functions

    // Make changes to the unit data, applicable to all kind of lists
    public makeUniversalUnitChanges(units: Unit[], printBasics = true) {
        for (const unit of units) {
            // Hightlight important Categories
            unit.categories = unit.categories.replace("Core", "<b>Core</b>");
            unit.categories = unit.categories.replace("Infantry", "<b>Infantry</b>");
            unit.categories = unit.categories.replace("Vehicle", "<b>Vehicle</b>");
            unit.categories = unit.categories.replace("Monster", "<b>Monster</b>");
            unit.categories = unit.categories.replace("Character", "<b>Character</b>");

            // Cleanup the unit table (e.g. shorten some unit names)
            for (const stat of unit.stats) {
                stat.unit = stat.unit.replace("[1]", "").replace("[2]", "").replace("[3]", "").replace("[4]", "");
                stat.unit = stat.unit.replace("wounds remaining", "wounds");
            }

            // Cleanup the weapon table (e.g. shorten some weapon names)
            const weaponAbilities = new Map<string, string>();
            for (const weapon of unit.weapons) {
                weapon.name = weapon.name.replace(", Frag missile", " (Frag)");
                weapon.name = weapon.name.replace(", Krak missile", " (Krak)");
                weapon.name = weapon.name.replace(", Standard", " (Standard)");
                weapon.name = weapon.name.replace(", Supercharge", " (Supercharge)");
                weapon.name = weapon.name.replace("➤", "");
                if (weapon.abilities.length === 1 && weapon.abilities[0] === "-")
                    weapon.abilities = "";

                // Add short info about the specific weapon type
                weaponAbilities.set("One Shot", "<b>One Shot</b>");
                weaponAbilities.set("Ignores Cover", "<b>Ignores Cover</b>");
                weaponAbilities.set("Assault", "<b>Assault</b><i>: Advance and shoot</i>");
                weaponAbilities.set("Twin-linked", "<b>Twin-linked</b><i>: Reroll Wound-roll</i>");
                weaponAbilities.set("Pistol", "<b>Pistol</b><i>: Can shoot in Engagement Range</i>");
                weaponAbilities.set("Torrent", "<b>Torrent</b><i>: Automatically hits</i>");
                weaponAbilities.set("Lethal Hits", "<b>Lethal hits</b><i>: Auto-Wound on 6 hit-roll</i>");
                weaponAbilities.set("Lance", "<b>Lance</b><i>: +1 Wound after Charge</i>");
                weaponAbilities.set("Indirect Fire", "<b>Indirect Fire</b><i>: Target not-visible units, but -1 Hit and target has cover</i>");
                weaponAbilities.set("Precision", "<b>Precision</b><i>: Can target visible Leader/Char of a unit</i>");
                weaponAbilities.set("Blast", "<b>Blast</b><i>: +1 A per 5 models, but no engaged targets!</i>");
                weaponAbilities.set("Heavy", "<b>Heavy</b><i>: +1 to Hit if not moved</i>");
                weaponAbilities.set("Hazardous", "<b>Hazardous</b><i>: D6 after shoot. On 1, model destroyed</i>");
                weaponAbilities.set("Devastating Wounds", "<b>Devastating Wounds</b><i>: 6 wound-roll: no saving throws (no invuln)</i>");
                weaponAbilities.set("Extra Attacks", "<b>Extra Attacks</b><i>: Can use this weapon in addition to any other</i>");
                for (let index = 0; index < 10; index++) {
                    weaponAbilities.set(`Melta ${index}`, `<b>Melta ${index}</b><i>: If half range D+${index}</i>`);
                    weaponAbilities.set(`Rapid Fire ${index}`, `<b>Rapid Fire ${index}</b><i>: If half range A+${index}</i>`);
                    weaponAbilities.set(`Sustained Hits ${index}`, `<b>Sustained Hits ${index}</b><i>: On 6 hit-roll, ${index} extra hit(s)</i>`);
                    weaponAbilities.set(`Anti-vehicle ${index}+`, `<b>Anti-vehicle ${index}+</b><i>: Wound roll of ${index}+ is critical wound against Vehicle`);
                    weaponAbilities.set(`Anti-infantry ${index}+`, `<b>Anti-infantry ${index}+</b><i>: Wound roll of ${index}+ is critical wound against Infantry`);
                    weaponAbilities.set(`Anti-monster ${index}+`, `<b>Anti-monster ${index}+</b><i>: Wound roll of ${index}+ is critical wound against Monster`);
                    weaponAbilities.set(`Anti-fly ${index}+`, `<b>Anti-fly ${index}+</b><i>: Wound roll of ${index}+ is critical wound against Fly`);
                }

                // Replace all the Weapon-Ability mappings
                for (const wa of weaponAbilities) {
                    weapon.abilities = weapon.abilities.replaceAll(wa[0], wa[1]);
                }
            }

            // Remove the default abilities
            const leaderIndex = unit.abilities.findIndex(a => a.name === "Leader");
            if (leaderIndex > -1) { unit.abilities.splice(leaderIndex, 1); }
            for (const wa of weaponAbilities) {
                const waIndex = unit.abilities.findIndex(a =>
                    a.name.startsWith(wa[0])
                    || a.name.startsWith("Melta")
                    || a.name.startsWith("Rapid Fire")
                    || a.name.startsWith("Sustained Hits")
                    || a.name.startsWith("Anti-")
                );
                if (waIndex > -1) { unit.abilities.splice(waIndex, 1); }
            }

            // Cleanup the ability table
            for (const ability of unit.abilities) {
                ability.ref = (ability.description.includes("litany") ? "Litany" : ability.ref);
                ability.ref = (ability.ref === undefined || ability.ref === null || !ability.ref ? "Ability" : ability.ref);

                // Green Marker
                ability.description = this.markGreen(ability.description, "select one friendly");
                ability.description = this.markGreen(ability.description, "heal one friendly");
                ability.description = this.markGreen(ability.description, "Command phase");
                ability.description = this.markGreen(ability.description, "Command Phase");
                ability.description = this.markGreen(ability.description, "Movement phase");
                ability.description = this.markGreen(ability.description, "Movement Phase");
                ability.description = this.markGreen(ability.description, "Psychic phase");
                ability.description = this.markGreen(ability.description, "Psychic Phase");
                ability.description = this.markGreen(ability.description, "Shooting phase");
                ability.description = this.markGreen(ability.description, "Shooting Phase");
                ability.description = this.markGreen(ability.description, "Charge phase");
                ability.description = this.markGreen(ability.description, "Charge Phase");
                ability.description = this.markGreen(ability.description, "Fight phase");
                ability.description = this.markGreen(ability.description, "Fight Phase");
                // Orange Marker
                ability.description = this.markOrange(ability.description, "wound is not lost");
                ability.description = this.markOrange(ability.description, "re-roll");
                ability.description = this.markOrange(ability.description, "re roll");
                ability.description = this.markOrange(ability.description, "additional wound");
                ability.description = this.markOrange(ability.description, "additional mortal wound");
                // Blue Marker
                ability.description = this.markBlue(ability.description, "invulnerable save");
                ability.description = this.markBlue(ability.description, "armour saving throw");
                // Pink Marker
                ability.description = this.markPink(ability.description, "Once per battle");
            }
        }
    }

    // Make changes to the unit data, applicable to all kind of "Space Marine" lists
    public makeSpaceMarineChanges(units: Unit[]) {
        if (units.find(u => u.categories.includes("Adeptus Astartes")) === undefined)
            return;

        for (const unit of units) {
            // Rewrite the default abilities (Angles of Death!)
            if (unit.abilities.find(a => a.name.includes("Oath of Moment"))) {
                const oathsIndex = unit.abilities.findIndex(a => a.name.includes("Oath of Moment"));
                if (oathsIndex > -1) {
                    unit.abilities.splice(oathsIndex, 1);
                }
            }
        }
    }

    //#endregion

    //#region Private Functions

    private markGreen(input: string, textToMark: string): string {
        const green = "<mark style=\"background:#c9ff94!important\">$txt$</mark>";
        return input.replaceAll(textToMark, green.replace("$txt$", textToMark));
    }

    private markOrange(input: string, textToMark: string): string {
        const green = "<mark style=\"background:#ffb094!important\">$txt$</mark>";
        return input.replaceAll(textToMark, green.replace("$txt$", textToMark));
    }

    private markBlue(input: string, textToMark: string): string {
        const green = "<mark style=\"background:#a3d1ff!important\">$txt$</mark>";
        return input.replaceAll(textToMark, green.replace("$txt$", textToMark));
    }

    private markPink(input: string, textToMark: string): string {
        const green = "<mark style=\"background:#dcadff!important\">$txt$</mark>";
        return input.replaceAll(textToMark, green.replace("$txt$", textToMark));
    }

    //#endregion

}
