import { Ability, Rule, Unit, Stats, Weapon } from "../interfaces/unitInterfaces";
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

            let unitDataRaw: any = rosterRaw.ul.li;
            if (!unitDataRaw.length)
                unitDataRaw = new Array<any>({ ...unitDataRaw });

            for (const unitRaw of unitDataRaw) {
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
                unit = this.addUnitComposition(unitRaw, unit);
                unit = this.addUnitStats(unitRaw, unit);
                units.push(unit);
            }
        }
        return units;
    }

    public convertUnitsToHtml(units: Unit[]): string[] {
        try {
            let htmlLines = new Array<string>();

            const roleColors = new Map<string, string>();
            roleColors.set("HQ", "#F9D39D");
            roleColors.set("Troops", "#C8EFB3");
            roleColors.set("Elites", "#BBCFF2");
            roleColors.set("Fast Attack", "#FFF7BA");
            roleColors.set("Heavy Support", "#C1AFE0");
            roleColors.set("Dedicated Transport", "#FCB6B6");

            // Body with one list (ul)
            const cssStype = `<style>body.battlescribe{margin:0;padding:0;border-width:0}div.battlescribe{margin:0 auto;padding:0;border-width:0;font-family:sans-serif;font-size:12px;color:#444444;text-align:left}div.battlescribe h3,div.battlescribe h4{margin:0;padding:0;border-width:0;font-size:24px;font-weight:bold;}div.battlescribe ul{margin:0 0 0 10px;padding:0;border-width:0;list-style-image:none;list-style-position:outside;list-style-type:none}div.battlescribe li.rootselection{margin:0;padding:5px;border-width:2px;border-style:solid}div.battlescribe table{margin:12px 0 0;padding:0;border-collapse:collapse;font-size:12px;color:#444444;page-break-inside:avoid}div.battlescribe tr{border-width:1px;border-style:solid;border-color:#a1a1a1}div.battlescribe th{padding:4px;font-weight:bold;text-align:left}div.battlescribe td{padding:4px;text-align:left}tbody tr td:first-child{min-width:200px;word-break:break-all}div.battlescribe td.profile-name{font-weight:bold}div.battlescribe span.bold {font-weight: bold;}div.battlescribe p.pSmall{margin:4 2px;}</style>`;
            htmlLines.push(`<html><head><meta name="viewport" content="width=600">${cssStype}</head>`);
            htmlLines.push(`<body class="battlescribe"><div class="battlescribe"><ul>`);
            for (const unit of units) {
                // Get the role color (default = light grey)
                const bgColor = roleColors.get(unit.role) ?? "#D8D8D8";

                htmlLines.push(`<br><li class="rootselection">`);
                // Header line with Section, Name and Points/Power
                const info = (unit.info !== null && unit.info.length > 1 ? `(${unit.info}) ` : "");
                htmlLines.push(`<h3>${unit.name} ${info}[${unit.pwr}p - ${unit.pts}pts] - ${unit.role}</h3>`);
                htmlLines.push(`<p class="pSmall"><span class="bold">Categories: </span>${unit.categories}</p>`);
                if (unit.comp.length)
                    htmlLines.push(`<p class="pSmall"><span class="bold">Composition: </span>${unit.comp}</p>`);

                // Abilities table
                if (unit.abilities.length) {
                    htmlLines.push(`<table><tr bgColor="${bgColor}"><th>Abilities</th><th>Type</th><th>Description</th></tr>`);
                    for (const ability of unit.abilities) {
                        htmlLines.push(`<tr><td class="profile-name">${ability.name}</td><td><p>${ability.ref}</p></td><td><p>${ability.description}</p></td></tr>`);
                    }
                    htmlLines.push(`</table>`);
                }
                // Unit Profile Table
                if (unit.stats.length) {
                    htmlLines.push(`<table>`);
                    htmlLines.push(`<tr bgColor="${bgColor}"><th>Unit</th><th>M</th><th>WS</th><th>BS</th><th>S</th><th>T</th><th>W</th><th>A</th><th>Ld</th><th>Save</th></tr>`);
                    for (const stat of unit.stats) {
                        htmlLines.push(`<tr>`);
                        htmlLines.push(`<td class="profile-name">${stat.unit}</td><td>${stat.m}</td><td>${stat.ws}</td><td>${stat.bs}</td>`);
                        htmlLines.push(`<td>${stat.s}</td><td>${stat.t}</td><td>${stat.w}</td><td>${stat.a}</td><td>${stat.ld}</td><td>${stat.save}</td>`);
                        htmlLines.push(`</tr>`);
                    }
                    htmlLines.push(`</table>`);
                }
                // Unit Weapons Table
                if (unit.weapons.length) {
                    htmlLines.push(`<table>`);
                    htmlLines.push(`<tr bgColor="${bgColor}"><th>Weapon</th><th>Range</th><th>Type</th><th>S</th><th>AP</th><th>D</th><th>Abilities</th><th>Info</th></tr>`);
                    for (const weapon of unit.weapons) {
                        htmlLines.push(`<tr>`);
                        htmlLines.push(`<td class="profile-name">${weapon.name}</td><td>${weapon.range}</td><td>${weapon.type}</td>`);
                        htmlLines.push(`<td>${(!weapon.s.startsWith("x") && !weapon.s.includes("User") && weapon.type === "Melee" ? "+" : "") + weapon.s}</td>`);
                        htmlLines.push(`<td>${weapon.ap}</td><td>${weapon.d}</td><td>${weapon.abilities}</td><td>${weapon.info}</td>`);
                        htmlLines.push(`</tr>`);
                    }
                    htmlLines.push(`</table>`);
                }
                htmlLines.push(`</li>`);
            }
            htmlLines.push(`</ul></div></body></html>`);
            return htmlLines;
        } catch (error) {
            throw new Error(`[CONVERSION]: Error converting units to html: ${error}`)
        }
    }

    //#endregion

    //#region Private Methods

    private createUnit(unitRaw: any, battlefieldRole: string): Unit {
        const name = getCleanString(unitRaw.h4).replace("-1CP,", "").replace("-2CP,", "");
        const unit: Unit = {
            role: battlefieldRole.substring(0, battlefieldRole.indexOf("[")).trim(),
            pwr: name.substring(name.indexOf("[") + 1, name.indexOf(",")).replace("PL", "").trim(),
            pts: name.substring(name.indexOf(",") + 1, name.indexOf("]")).replace("pts", "").trim(),
            name: name.substring(0, name.indexOf("[")).trim(),
            info: "",
            comp: "",
            categories: "",
            abilities: new Array<Ability>(),
            stats: new Array<Stats>(),
            weapons: new Array<Weapon>(),
        };
        return unit;
    }

    private addUnitInfo(unitRaw: any, unit: Unit, rules: Map<string, Rule>): Unit {
        for (const info of unitRaw.p) {
            const spanStr = getCleanString(typeof info.span === "string" ? info.span : info.span.join(" "));
            const textStr = getCleanString(info['#text']);
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
            var uniqueComps = new Map<string, number>();
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
                    const name = getCleanString(row[0]['#text'] ?? row[0]);
                    if (name.includes("Stratagem:"))
                        continue;

                    unit.abilities.push({
                        name: getCleanString(row[0]['#text'] ?? row[0]),
                        description: getCleanString(row[1]['#text'] ?? row[1]),
                        ref: getCleanString(row.length > 2 ? (row[2]['#text'] ?? row[2]) : "")
                    });
                }
            }
            // Parse the Unit tables rows (first row is the header)
            else if (rowData[0] === "Unit") {
                for (let idx = 1; idx < rows.length; idx++) {
                    const row = rows[idx].td;
                    unit.stats.push({
                        unit: getCleanString(row[0]['#text'] ?? row[0]),
                        m: getCleanString(row[1]['#text'] ?? row[1]),
                        ws: getCleanString(row[2]['#text'] ?? row[2]),
                        bs: getCleanString(row[3]['#text'] ?? row[3]),
                        s: getCleanString(row[4]['#text'] ?? row[4]),
                        t: getCleanString(row[5]['#text'] ?? row[5]),
                        w: getCleanString(row[6]['#text'] ?? row[6]),
                        a: getCleanString(row[7]['#text'] ?? row[7]),
                        ld: getCleanString(row[8]['#text'] ?? row[8]),
                        save: getCleanString(row[9]['#text'] ?? row[9]),
                        ref: getCleanString(row.length > 10 ? (row[10]['#text'] ?? row[10]) : "")
                    });
                }
            }
            // Parse the Weapon tables rows (first row is the header)
            else if (rowData[0] === "Weapon") {
                for (let idx = 1; idx < rows.length; idx++) {
                    const row = rows[idx].td;
                    unit.weapons.push({
                        name: getCleanString(row[0]['#text'] ?? row[0]),
                        range: getCleanString(row[1]['#text'] ?? row[1]),
                        type: getCleanString(row[2]['#text'] ?? row[2]),
                        s: getCleanString(row[3]['#text'] ?? row[3]),
                        ap: getCleanString(row[4]['#text'] ?? row[4]),
                        d: getCleanString(row[5]['#text'] ?? row[5]),
                        abilities: getCleanString(row[6]['#text'] ?? row[6]),
                        info: "",
                    });
                }
            }
        }
        return unit;
    }

    //#endregion

}
