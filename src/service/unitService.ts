import { Ability, PsychicPower, Rule, Stats, Unit, Weapon, Selection } from "../interfaces/unitInterfaces";
import { getCleanString } from "../common/helpers";

export class UnitService {

    private static _instance: UnitService;
    public static get instance() { return this._instance || (this._instance = new this()); }

    //#region  Public Methods

    public parseUnits(bsDataRaw: any, rules: Map<string, Rule>): Array<Unit> {
        const rosterDataRaw = bsDataRaw.html.head.body.div.ul.li.ul.li;
        if (rosterDataRaw === undefined || rosterDataRaw === null || !rosterDataRaw.length)
            throw new Error("[UNIT]: Main roster element not found - html.body.div.ul.li.ul.li");

        const units = new Array<Unit>();
        for (const rosterRaw of rosterDataRaw) {
            const battlefieldRole = getCleanString(rosterRaw.h3);
            if (battlefieldRole.includes("Configuration"))
                continue;

            let unitsDataRaw: any = rosterRaw.ul.li;
            if (!unitsDataRaw.length)
                unitsDataRaw = new Array<any>({ ...unitsDataRaw });

            for (const unitRaw of unitsDataRaw) {
                // Create the basic unit data with name, points and power
                let unit = this.createUnit(unitRaw, battlefieldRole);

                // Validate the basic unit data
                if (unit === undefined || unit === null || !unit.name)
                    throw new Error("[UNIT]: Unit could not be created");
                if (unitRaw.p === undefined || unitRaw.p === null || !unitRaw.p.length)
                    throw new Error("[UNIT]: Unit info element not found");
                if (unitRaw.table === undefined || unitRaw.table === null || !unitRaw.table.length)
                    throw new Error("[UNIT]: Unit table element not found");

                // Update the unit data with categories, rules and infos (global rules will be added as abilites)
                // Update the unit data with abilities, unit stats and weapon stats
                unit = this.addUnitInfo(unitRaw, unit, rules);
                unit = this.addUnitStats(unitRaw, unit);
                unit = this.addUnitComposition(unitRaw, unit);
                units.push(unit);
            }
        }
        return units;
    }

    //#endregion

    //#region Private Methods

    private createUnit(unitRaw: any, battlefieldRole: string): Unit {
        const name = getCleanString(unitRaw.h4).replace("-1CP,", "").replace("-2CP,", "");
        const unit: Unit = {
            role: battlefieldRole.substring(0, battlefieldRole.indexOf("[")).trim(),
            //pwr: name.substring(name.indexOf("[") + 1, name.indexOf(",")).replace("PL", "").trim(),
            pts: name.substring(name.indexOf("[") + 1, name.indexOf("]")).replace("pts", "").trim(),
            name: name.substring(0, name.indexOf("[")).trim(),
            info: "",
            comp: "",
            categories: "",
            psycher: "",
            invulnSave: { inv: "", info: "" },
            damaged: "",
            leaderInfo: "",
            transportInfo: "",
            abilities: new Array<Ability>(),
            stats: new Array<Stats>(),
            weapons: new Array<Weapon>(),
            powers: new Array<PsychicPower>(),
            selections: new Array<Selection>(),
        };
        return unit;
    }

    private addUnitInfo(unitRaw: any, unit: Unit, rules: Map<string, Rule>): Unit {
        for (const info of unitRaw.p) {
            const spanStr = getCleanString(typeof info.span === "string" ? info.span : info.span.join(" "));
            const textStr = getCleanString(info["#text"]);
            const fullStr = getCleanString(spanStr + " " + textStr);

            // Extract additional infos like "Warlord" and "Chapter Command"
            if (fullStr.includes("Warlord") && !unit.info.includes("Warlord")) {
                unit.info += (!unit.info.length ? "Warlord" : ", Warlord");
            }
            if (fullStr.includes("Chapter Command") && !unit.info.includes("Chapter Command")) {
                unit.info += (!unit.info.length ? "Chapter Command" : ", Chapter Command");
            }

            // Extract the categories and rules (all global rules will be added as abilities)
            if (fullStr.startsWith("Categories:")) {
                unit.categories = fullStr.replaceAll("Faction: ", "").replace("Categories:", "").trim();
            }
            else if (fullStr.startsWith("Selections:")) {
                unit.selections.push({
                    name: unit.name,
                    info: fullStr.replaceAll("Selections: ", "").trim()
                });
            }
            else if (fullStr.startsWith("Rules:")) {
                const ruleNames = fullStr.replace("Rules:", "").split(",").map(s => getCleanString(s));
                for (const ruleName of ruleNames) {
                    if (!rules.has(ruleName))
                        throw new Error("Rule not found: " + ruleName);

                    unit.abilities.push({
                        name: ruleName,
                        description: rules.get(ruleName)?.text ?? "",
                        ref: "Rule"
                    });
                }
            }
        }

        const selectionListRaw = unitRaw?.ul?.li;
        if (selectionListRaw !== undefined && selectionListRaw) {
            if (selectionListRaw.length) {
                for (const selectionRaw of selectionListRaw) {
                    if (selectionRaw.p) {
                        unit.selections.push({
                            name: getCleanString(selectionRaw.h4),
                            info: getCleanString(selectionRaw.p[0]["#text"]).replaceAll("Selections: ", "").trim()
                        });
                    } else if (selectionRaw.ul.li) {
                        unit.selections.push({
                            name: getCleanString(selectionRaw.h4),
                            info: getCleanString(selectionRaw.ul.li.h4) + ", " + getCleanString(selectionRaw.ul.li.p[0]["#text"]).replaceAll("Selections: ", "").trim()
                        });
                    }

                }
            } else {
                unit.selections.push({
                    name: unit.name,
                    info: getCleanString(selectionListRaw.p[0]["#text"]).replaceAll("Selections: ", "").trim()
                });
            }
        }

        return unit;
    }

    private addUnitComposition(unitRaw: any, unit: Unit): Unit {
        // Check if the unit even has some Composition information
        if (unitRaw.ul !== undefined && unitRaw.ul.li !== undefined) {
            let compRaw = unitRaw.ul.li;
            if (!unitRaw.ul.li.length)
                compRaw = new Array<any>({ ...compRaw });

            // Extract all composition parts (e.g. "Intercessor Sergeant", "4x Intercessor") into an array
            const compParts = new Array<string>();
            for (const composition of compRaw) {
                const tmpStr = getCleanString(composition.h4);
                compParts.push((tmpStr.includes("[") ? tmpStr.substring(0, tmpStr.indexOf("[")) : tmpStr).trim());
            }

            // Remove all duplicates and count, if there are any
            const uniqueComps = new Map<string, number>();
            compParts.forEach(function (i) { uniqueComps.set(i, (uniqueComps.get(i) || 0) + 1); });

            // Create the "comp" string. If a unit has no counter (e.g. "4x") then create one automatically
            for (const uc of uniqueComps) {
                const count = uc[1];
                unit.comp += ((unit.comp.length ? ", " : "") + (count > 1 ? `${count}x ` : "") + uc[0]);
            }
        }
        return unit;
    }

    private addUnitStats(unitRaw: any, unit: Unit): Unit {
        // Loop all the units data tables (Abilities, Unit, Weapon)
        for (const table of unitRaw.table) {
            const rows = table.tr;
            const rowData = rows[0].th;
            // Parse the Abilities tables rows (first row is the header)
            if (rowData[0] === "Abilities") {
                for (let idx = 1; idx < rows.length; idx++) {
                    const row = rows[idx].td;
                    let name = getCleanString(row[0]["#text"] ?? row[0]);
                    if (name.includes("Stratagem:"))
                        continue;

                    if (name.startsWith("Invulnerable Save")) {
                        let invText = getCleanString(row[1]["#text"] ?? row[1]);
                        if (invText.length > 2) {
                            const number = invText.replace(/\D/g, ' ').trimStart().split(' ', 2)[0];
                            const info = (invText.includes("*") ? invText.split('*')[1] : invText).trim();
                            unit.invulnSave = { inv: (number + "+"), info: info };
                        } else {
                            unit.invulnSave = { inv: invText, info: "" };
                        }
                    } else if (name.startsWith("Damaged:")) {
                        unit.damaged = getCleanString(row[1]["#text"] ?? row[1]);
                    } else if (name === "Leader") {
                        unit.leaderInfo = getCleanString(row[1]["#text"] ?? row[1]);
                    } else if (name === "Transport") {
                        unit.transportInfo = getCleanString(row[1]["#text"] ?? row[1]);
                    } else {
                        unit.abilities.push({
                            name: name,
                            description: getCleanString(row[1]["#text"] ?? row[1]),
                            ref: getCleanString(row.length > 2 ? (row[2]["#text"] ?? row[2]) : "")
                        });
                    }

                }
            }
            // Parse the Unit tables rows (first row is the header)
            else if (rowData[0] === "Unit") {
                for (let idx = 1; idx < rows.length; idx++) {
                    const row = rows[idx].td;
                    unit.stats.push({
                        unit: getCleanString(row[0]["#text"] ?? row[0]),
                        m: getCleanString(row[1]["#text"] ?? row[1]),
                        t: getCleanString(row[2]["#text"] ?? row[2]),
                        save: getCleanString(row[3]["#text"] ?? row[3]),
                        w: getCleanString(row[4]["#text"] ?? row[4]),
                        ld: getCleanString(row[5]["#text"] ?? row[5]),
                        oc: getCleanString(row[6]["#text"] ?? row[6]),
                        ref: getCleanString(row.length > 7 ? (row[7]["#text"] ?? row[7]) : "")
                    });
                }
            }
            // Parse the Weapon tables rows (first row is the header)
            else if (rowData[0] === "Melee Weapons" || rowData[0] === "Ranged Weapons") {
                for (let idx = 1; idx < rows.length; idx++) {
                    const row = rows[idx].td;
                    unit.weapons.push({
                        name: getCleanString(row[0]["#text"] ?? row[0]),
                        range: getCleanString(row[1]["#text"] ?? row[1]),
                        a: getCleanString(row[2]["#text"] ?? row[2]),
                        skill: getCleanString(row[3]["#text"] ?? row[3]),
                        s: getCleanString(row[4]["#text"] ?? row[4]),
                        ap: getCleanString(row[5]["#text"] ?? row[5]),
                        d: getCleanString(row[6]["#text"] ?? row[6]),
                        abilities: getCleanString(row[7]["#text"] ?? row[7]),
                    });
                }
            }
            // Parse the Psychic Power tables rows (first row is the header)
            else if (rowData[0] === "Psychic Power") {
                for (let idx = 1; idx < rows.length; idx++) {
                    const row = rows[idx].td;

                    // Clear the Power number from the name (like "1)", "2)", ...)
                    let name = getCleanString(row[0]["#text"] ?? row[0]);
                    if (name.includes(")"))
                        name = name.substring(name.indexOf(")") + 1, name.length).trim();

                    unit.powers.push({
                        name: name,
                        warpCharge: getCleanString(row[1]["#text"] ?? row[1]),
                        range: getCleanString(row[2]["#text"] ?? row[2]),
                        details: getCleanString(row[3]["#text"] ?? row[3]),
                    });
                }
            }
            // Parse the Psycher table row (first row is the header)
            else if (rowData[0] === "Psyker") {
                const row = rows[1].td;
                const casts = getCleanString(row[1]["#text"] ?? row[1]);
                const deny = getCleanString(row[2]["#text"] ?? row[2]);
                const discipline = getCleanString(row[3]["#text"] ?? row[3]);
                unit.psycher = (`Cast: ${casts} | Deny: ${deny} | Power: ${discipline}`);
            }
        }
        return unit;
    }

    //#endregion

}
