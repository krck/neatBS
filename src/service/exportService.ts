import { Rule, Unit } from "../interfaces/unitInterfaces";

export class ExportService {

    private static _instance: ExportService;
    public static get instance() { return this._instance || (this._instance = new this()); }

    //#region  Public Functions

    public convertDataToHtml(rules: { army: Rule, detachment: Rule, points: string }, units: Unit[]): string[] {
        try {
            const htmlLines = new Array<string>();

            const roleColors = new Map<string, string>();
            roleColors.set("Epic Hero", "#FFF7BA");
            roleColors.set("Character", "#F9D39D");
            roleColors.set("Battleline", "#C8EFB3");
            roleColors.set("Infantry", "#BBCFF2");
            roleColors.set("Monster", "#C1AFE0");
            roleColors.set("Vehicle", "#C1AFE0");
            roleColors.set("Dedicated Transport", "#FCB6B6");

            // Body with one list (ul)
            const cssStype = "<style>body.battlescribe{margin:0;padding:0;border-width:0}div.battlescribe{margin:0 auto;padding:0;border-width:0;font-family:sans-serif;font-size:14px;color:#444444;text-align:left}div.battlescribe h3,div.battlescribe h4{margin:0;padding:0;border-width:0;font-size:32px;font-weight:bold;}div.battlescribe ul{margin:0 0 0 10px;padding:0;border-width:0;list-style-image:none;list-style-position:outside;list-style-type:none}div.battlescribe li.rootselection{height:655px;width:1400px;margin:10px 0;padding: 0 12px 12px 12px;border-width:5px;border-radius:8px;border-style:solid}div.battlescribe table{margin:12px 0 0;padding:0;border-collapse:collapse;font-size:14px;color:#444444;page-break-inside:avoid}div.battlescribe tr{border-width:2px;border-style:solid;border-color:#a1a1a1}div.battlescribe th{padding:4px;font-weight:bold;text-align:left}div.battlescribe td{padding:4px;text-align:left}tbody tr td:first-child{min-width:200px;word-break:break-all}div.battlescribe td.profile-name{font-weight:bold}div.battlescribe span.bold {font-weight: bold;}div.battlescribe p.pSmall{margin:4 2px;}div.battlescribe li.armyListing {height: auto;width: 1400px;margin: 10px 0;padding: 0 12px 12px 12px;border-width: 5px;border-radius: 8px;border-style: solid}</style>";
            htmlLines.push(`<html><head><meta name="viewport">${cssStype}</head>`);
            htmlLines.push("<body class=\"battlescribe\"><div class=\"battlescribe\"><ul>");
            for (const unit of units) {
                // Get the role color (default = light grey)
                const bgColor = roleColors.get(unit.role) ?? "#D8D8D8";

                htmlLines.push("<br><li class=\"rootselection\">");
                // Header line with Section, Name and Points/Power
                const info = (unit.info !== null && unit.info.length > 1 ? `(${unit.info}) ` : "");
                htmlLines.push("<table style=\"width:100%\">");
                htmlLines.push(`<tr bgColor="${bgColor}"><th><h3>${unit.name} ${info} - ${unit.role} - [${unit.pts}pts]</h3></th></tr>`);
                htmlLines.push(`<tr><td><p class="pSmall"><span class="bold">Categories: </span>${unit.categories}</p></td></tr>`);
                htmlLines.push("</table>");

                // Unit Profile Table
                if (unit.stats.length) {
                    htmlLines.push("<div style=\"display: flex;\">");
                    htmlLines.push("<table>");
                    htmlLines.push(`<tr bgColor="${bgColor}"><th>Unit</th><th>M</th><th>T</th><th>Sv</th><th>W</th><th>Ld</th><th>OC</th></tr>`);
                    for (const stat of unit.stats) {
                        htmlLines.push("<tr>");
                        htmlLines.push(`<td class="profile-name">${stat.unit}</td><td>${stat.m}</td>`);
                        htmlLines.push(`<td>${stat.t}</td><td>${stat.save}</td><td>${stat.w}</td><td>${stat.ld}</td><td>${stat.oc}</td>`);
                        htmlLines.push("</tr>");
                    }
                    htmlLines.push("</table>");
                    if (unit.invulnSave) {
                        htmlLines.push("<table style=\"margin-left: 5px;\">");
                        htmlLines.push(`<tr bgColor="${bgColor}"><th>Invulnerable Save</th></tr>`);
                        htmlLines.push(`<tr><td>${unit.invulnSave}</td></tr>`);
                        htmlLines.push("</table>");
                    }
                    if (unit.damaged) {
                        htmlLines.push("<table style=\"margin-left: 5px;\">");
                        htmlLines.push(`<tr bgColor="${bgColor}"><th>Damaged</th></tr>`);
                        htmlLines.push(`<tr><td>${unit.damaged}</td></tr>`);
                        htmlLines.push("</table>");
                    }
                    htmlLines.push("</div>");
                }

                // Unit Weapons Table
                if (unit.weapons.length) {
                    htmlLines.push("<table style=\"width:100%\">");
                    htmlLines.push(`<tr bgColor="${bgColor}">
                                    <th style="width:25%">Weapon</th>
                                    <th style="width:7%">Range</th>
                                    <th style="width:3%">A</th>
                                    <th style="width:4%">WS/BS</th>
                                    <th style="width:2%">S</th>
                                    <th style="width:2%">AP</th>
                                    <th style="width:2%">D</th>
                                    <th style="width:55%">Abilities</th>
                                </tr>`);
                    for (const weapon of unit.weapons) {
                        htmlLines.push("<tr>");
                        htmlLines.push(`<td class="profile-name">${weapon.name}</td><td>${weapon.range}</td><td>${weapon.a}</td><td>${weapon.skill}</td>`);
                        htmlLines.push(`<td>${weapon.s}</td><td>${weapon.ap}</td><td>${weapon.d}</td><td>${weapon.abilities}</td>`);
                        htmlLines.push("</tr>");
                    }
                    htmlLines.push("</table>");
                }
                // Psyhic Powers table
                if (unit.powers.length) {
                    htmlLines.push(`<table style="width:100%"><tr bgColor="${bgColor}">
                                    <th style="width:20%">Psychic Power</th>
                                    <th style="width:8%">Warp Charge</th>
                                    <th style="width:4%">Range</th>
                                    <th style="width:68%">Details</th>
                                </tr>`);
                    if (unit.psycher) {
                        htmlLines.push(`<tr><td class="profile-name">Psycher Stats</td><td></td><td></td><td><p><b>${unit.psycher}</b></p></td></tr>`);
                    }
                    for (const power of unit.powers) {
                        htmlLines.push(`<tr><td class="profile-name">${power.name}</td><td><p>${power.warpCharge}</p></td><td><p>${power.range}</p></td><td><p>${power.details}</p></td></tr>`);
                    }
                    htmlLines.push("</table>");
                }
                // Abilities table
                if (unit.abilities.length) {
                    htmlLines.push(`<table style="width:100%"><tr bgColor="${bgColor}">
                                    <th style="width:20%">Abilities</th>
                                    <th style="width:5%">Type</th>
                                    <th style="width:75%">Description</th>
                                </tr>`);
                    for (const ability of unit.abilities) {
                        htmlLines.push(`<tr><td class="profile-name">${ability.name}</td><td><p>${ability.ref}</p></td><td><p>${ability.description}</p></td></tr>`);
                    }
                    htmlLines.push("</table>");
                }
                // Leader info table
                if (unit.leaderInfo.length) {
                    htmlLines.push("<table>");
                    htmlLines.push(`<tr bgColor="${bgColor}"><th>Leader</th>`);
                    htmlLines.push(`<tr><td>${unit.leaderInfo}</td></tr>`);
                    htmlLines.push("</table>");
                }
                // Transport info table
                if (unit.transportInfo.length) {
                    htmlLines.push("<table>");
                    htmlLines.push(`<tr bgColor="${bgColor}"><th>Transport</th>`);
                    htmlLines.push(`<tr><td>${unit.transportInfo}</td></tr>`);
                    htmlLines.push("</table>");
                }

                htmlLines.push(`<div><!-- ${unit.name} INFO --></div>`);
                htmlLines.push("</li>");
            }

            // Final DataCard with Army Comp
            htmlLines.push("<br><li class=\"armyListing\">");
            htmlLines.push(`<h3 style=\"margin-top: 10px\">Army Details - ${rules.points}</h3>`);

            htmlLines.push("<table style=\"width:100%;\">");
            htmlLines.push(`<tr bgColor=\"#D8D8D8\"><th>Type</th><th>Rule Name</th><th>Info</th></tr>`);
            htmlLines.push(`<tr><td>Army</td><td>${rules.army.name}</td><td>${rules.army.text}</td></tr>`);
            htmlLines.push(`<tr><td>Detachment</td><td>${rules.detachment.name}</td><td>${rules.detachment.text}</td></tr>`);
            htmlLines.push("</table>");

            htmlLines.push("<table style=\"width:100%\"><tr bgColor=\"#D8D8D8\"><th style=\"width:5%\">Type</th><th style=\"width:25%\">Name</th><th style=\"width:10%\">Pwr/Pts</th><th style=\"width:60%\">Composition</th></tr>");
            for (const unit of units) {
                const selections = unit.selections.map(s => `<li>- ${s.name}: ${s.info}</li>`).join("");
                htmlLines.push(`<tr><td class="profile-name">${unit.role}</td><td><p>${unit.name}</p></td><td><p>${unit.pts}pts</p></td><td><ul>${selections}</ul></td></tr>`);
            }
            htmlLines.push("</li>");

            htmlLines.push("</ul></div></body></html>");
            return htmlLines;
        } catch (error) {
            throw new Error(`[CONVERSION]: Error converting units to html: ${error}`);
        }
    }

    //#endregion

}
