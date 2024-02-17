import { Rule, Unit } from "../interfaces/unitInterfaces";
import { minify } from 'html-minifier';

export class ExportService {

    private static _instance: ExportService;
    public static get instance() { return this._instance || (this._instance = new this()); }

    //#region  Public Functions

    public convertDataToHtml(rules: { army: Rule, detachment: Rule, points: string }, units: Unit[]): string {
        try {
            const htmlLines = new Array<string>();
            const fullCSS = "@font-face{font-family:'Conduit';src:url('fonts/Conduit ITC Regular.otf') format('opentype');font-weight:normal;font-style:normal}@font-face{font-family:'Conduit';src:url('fonts/Conduit ITC Bold.otf') format('opentype');font-weight:bold;font-style:normal}@font-face{font-family:'Conduit';src:url('fonts/Conduit ITC Italic.otf') format('opentype');font-weight:normal;font-style:italic}body{margin:0 0 0 10px;padding:0;border-width:0;font-family:Conduit;font-weight:normal;font-size:18px !important}body ul{margin:0 0 0 10px;padding:0;border-width:0;list-style-image:none;list-style-position:outside;list-style-type:none}.datacard{height:675px;width:1400px;margin:20px 0;padding:0;border-width:5px;border-radius:4px;border-style:solid}.armycard{height:auto;width: 1380px !important;margin:20px 0;padding:10px;border-width:5px;border-radius:4px;border-style:solid}.datacard-header{position:relative;width:auto;border-top:10px solid #d8d8d8;overflow:hidden}.datacard-header span{display:inline-block;background:#d8d8d8;width:900px;margin-top:-10px;padding:0 10px}.datacard-header span::before{content:'';position:absolute;width:130%;height:100%;background:#d8d8d8;z-index:-1;transform:rotate(-45deg)}.datacard-header-title{margin:0;font-size:46px;font-weight:bold}.datacard-header-category{font-style:italic;margin:0;padding:0}.datacard-header-stats{display:flex;justify-content:flex-start;margin-top:15px;margin-left:10px}.datacard-header-stats-item{text-align:center;margin-right:10px}.datacard-header-stats-item .value{border:4px solid #000000;margin-top:-26px;padding-top:14px;height:34x;width:48px;border-radius:5px;background:white;font-weight:bolder;font-size:32px}.datacard-content{margin:0;padding:0 10px 10px}p{margin:0;padding:0}table{margin:10px 0 0;padding:0;page-break-inside:avoid;border-collapse:collapse;color:#444444}tr{border-width:1px;border-style:solid;border-color:#969696}th{padding:4px;font-weight:bold;text-align:left}td{padding:4px;text-align:left}tbody tr td:first-child{min-width:200px;word-break:break-all}td.profile-name{font-weight:bold}";
            htmlLines.push(`<!DOCTYPE html><html><head><style>${fullCSS}</style></head><body><ul>`);
            for (const unit of units) {
                if (unit.stats.length !== 1)
                    throw new Error(`Invalid number of stats for ${unit.name}`);
                if (unit.weapons.length < 1)
                    throw new Error(`Invalid number of weapons for ${unit.name}`);
                if (unit.abilities.length < 1)
                    throw new Error(`Invalid number of abilities for ${unit.name}`);

                const info = (unit.info !== null && unit.info.length > 1 ? `(${unit.info}) ` : "");
                const stats = unit.stats[0];

                htmlLines.push(`
                <li>
                    <div class="datacard">
                        <div class="datacard-header">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <span style="align-self: flex-start;">
                                    <h2 class="datacard-header-title">${unit.name} ${info}</h2>
                                    <p class="datacard-header-category" style="font-size:16px;"><b>Categories:</b> ${unit.categories}</p>
                                    <div class="datacard-header-stats">
                                        <div class="datacard-header-stats-item">
                                            <div>M</div><div class="value">${stats.m}</div>
                                        </div>
                                        <div class="datacard-header-stats-item">
                                            <div>T</div><div class="value">${stats.t}</div>
                                        </div>
                                        <div class="datacard-header-stats-item">
                                            <div>Sv</div><div class="value">${stats.save}</div>
                                        </div>
                                        <div class="datacard-header-stats-item">
                                            <div>W</div><div class="value">${stats.w}</div>
                                        </div>
                                        <div class="datacard-header-stats-item">
                                            <div>Ld</div><div class="value">${stats.ld}</div>
                                        </div>
                                        <div class="datacard-header-stats-item">
                                            <div>OC</div><div class="value">${stats.oc}</div>
                                        </div>
                                        ${(unit.invulnSave.inv ? `
                                        <div class="datacard-header-stats-item" style="margin-left: 40px;">
                                            <div>
                                                <div>Inv Sv</div>
                                                <div class="value" style=" width: 60px !important;">${unit.invulnSave.inv}</div>
                                            </div>
                                        </div>`: "")}
                                        ${(unit.invulnSave.inv ? `<div style="font-size: 16px;">${unit.invulnSave.info}</div>` : "")}
                                    </div>
                                </span>
                                <div style="align-self: flex-end; margin-right: 20px; height: 120px;">
                                    <h2 style="margin: 0px; padding: 0px; font-size: 40px;">${unit.role}</h2>
                                    <h2 style="margin: 0px; padding: 0px; text-align: right; margin-top: 5px;">${unit.pts}pts</h2>
                                </div>
                            </div>
                        </div>
                        <div class="datacard-content">
                            ${(unit.damaged.length ? `
                            <table style="width:100%">
                               <tr><td style="font-size: 16px;"><b>Damaged:</b> ${unit.damaged}</td></tr>
                            </table>` : "")}
                            <table style="width:100%">
                                <tr bgColor="#f5f5f5">
                                    <th style="width:25%">Weapon</th>
                                    <th style="width:6%">Range</th>
                                    <th style="width:3%">A</th>
                                    <th style="width:5%">WS/BS</th>
                                    <th style="width:2%">S</th>
                                    <th style="width:2%">AP</th>
                                    <th style="width:3%">D</th>
                                    <th style="width:54%">Abilities</th>
                                </tr>
                                ${unit.weapons.map(weapon => `
                                <tr>
                                    <td class="profile-name">${weapon.name}</td>
                                    <td>${weapon.range}</td>
                                    <td><b>${weapon.a}</b></td>
                                    <td><b>${weapon.skill}</b></td>
                                    <td><b>${weapon.s}</b></td>
                                    <td><b>${weapon.ap}</b></td>
                                    <td><b>${weapon.d}</b></td>
                                    <td style="font-size: 16px;">${weapon.abilities}</td>
                                </tr>`).join("")}
                            </table>
                            <table style="width:100%">
                                <tr bgColor="#f5f5f5">
                                    <th style="width:20%">Abilities</th>
                                    <th style="width:5%">Type</th>
                                    <th style="width:75%">Description</th>
                                </tr>
                                ${unit.abilities.map(ability => `
                                <tr>
                                    <td class="profile-name">${ability.name}</td>
                                    <td><p>${ability.ref}</p></td>
                                    <td><p style="font-size: 16px;">${ability.description}</p></td>
                                </tr>`).join("")}
                            </table>
                            <table style="width:100%">
                                ${(unit.leaderInfo.length ? `<tr><td style="font-size: 16px; font-style:italic;"><b>Leader:</b> ${unit.leaderInfo}</td></tr>` : "")}
                                ${(unit.transportInfo.length ? `<tr><td style="font-size: 16px; font-style:italic;"><b>Transport:</b> ${unit.transportInfo}</td></tr>` : "")}
                            </table>
                            <div><!-- ${unit.name} INFO --></div>
                        </div>
                    </div>
                </li>`);
            }

            // Final DataCard with Army Comp
            htmlLines.push(`
                <li class="armycard">
                    <h2 style="margin-top: 10px">Army Details - ${rules.points}</h2>
                    <table style="width:100%;">
                        <tr bgcolor="#D8D8D8"><th>Type</th><th>Rule Name</th><th>Info</th></tr>
                        <tr><td>Army</td><td>${rules.army.name}</td><td>${rules.army.text}</td></tr>
                        <tr><td>Detachment</td><td>${rules.detachment.name}</td><td>${rules.detachment.text}</td></tr>
                    </table>
                    <table style="width:100%">
                        <tr bgcolor="#D8D8D8">
                            <th style="width:5%">Type</th>
                            <th style="width:25%">Name</th>
                            <th style="width:10%">Pwr/Pts</th>
                            <th style="width:60%">Composition</th>
                        </tr>
                        ${units.map(unit => {
                const selections = unit.selections.map(s => `<li>- ${s.name}: ${s.info}</li>`).join("");
                return `<tr>
                                <td class="profile-name">${unit.role}</td>
                                <td><p>${unit.name}</p></td>
                                <td><p>${unit.pts}pts</p></td>
                                <td><ul style="font-size: 16px;">${selections}</ul></td>
                            </tr>`;
            }).join("")}
                    </table>
                </li>
            `);

            htmlLines.push("</ul></body></html>");
            return minify(htmlLines.join(""), {
                collapseWhitespace: true,
                removeComments: false,
                removeOptionalTags: false,
            });
        } catch (error) {
            throw new Error(`[CONVERSION]: Error converting units to html: ${error}`);
        }
    }

    //#endregion

}
