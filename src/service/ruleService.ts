import { Rule } from "../interfaces/unitInterfaces";
import { getCleanString } from "../common/helpers";

export class RuleService {

    private static _instance: RuleService;
    public static get instance() { return this._instance || (this._instance = new this()); }

    //#region  Public Functions

    public getArmyAndDetachmentRules(bsDataRaw: any): { army: Rule, detachment: Rule, points: string } {
        const name = bsDataRaw.html.head.body.div.h1;
        const points = name.substring(name.indexOf("[")).trim();

        const armyRule: Rule = { name: "", type: "", text: "" };
        const rulesDataRaw = bsDataRaw.html.head.body.div.div;
        if (rulesDataRaw.length) {
            for (const ruleRaw of rulesDataRaw) {
                if (ruleRaw.h2 === "Force Rules") {
                    const ruleName = getCleanString(ruleRaw.p["span"]).replace(":", "");
                    armyRule.name = ruleName;
                    armyRule.type = getCleanString(ruleRaw.h2);
                    armyRule.text = getCleanString(ruleRaw.p["#text"]).replace("()", "").trim();
                };
            }
        }


        const detachmentRule: Rule = { name: "", type: "", text: "" };
        const rosterDataRaw = bsDataRaw.html.head.body.div.ul.li.ul.li;
        for (const rosterRaw of rosterDataRaw) {
            const battlefieldRole = getCleanString(rosterRaw.h3);
            if (battlefieldRole.includes("Configuration")) {
                for (const data of rosterRaw.ul.li) {
                    if (data.h4 === "Detachment") {
                        detachmentRule.name = getCleanString(data.p[0]["#text"]).replaceAll("Selections: ", "").trim();
                        detachmentRule.type = "Detachment";

                        for (const rows of data.table.tr) {
                            if (rows.td) {
                                detachmentRule.text = getCleanString(rows.td[0]) + ": " + getCleanString(rows.td[1]);
                            }
                        }
                    }
                }
            }
        }

        return { army: armyRule, detachment: detachmentRule, points: points };
    }

    public parseRules(bsDataRaw: any): Map<string, Rule> {
        try {
            const rules = new Map<string, Rule>();
            const rulesDataRaw = bsDataRaw.html.head.body.div.div;

            // Check if data has multiple rules sections
            // (e.g. "Force Rules" and "Selection Rules")
            if (rulesDataRaw.length) {
                for (const ruleRaw of rulesDataRaw) {
                    if (ruleRaw.p.length) {
                        for (const p of ruleRaw.p) {
                            const ruleName = getCleanString(p["span"]).replace(":", "");
                            rules.set(ruleName, {
                                name: ruleName,
                                type: getCleanString(ruleRaw.h2),
                                text: getCleanString(p["#text"]).replace("()", "").trim()
                            });
                        }
                    } else {
                        const ruleName = getCleanString(ruleRaw.p["span"]).replace(":", "");
                        rules.set(ruleName, {
                            name: ruleName,
                            type: getCleanString(ruleRaw.h2),
                            text: getCleanString(ruleRaw.p["#text"]).replace("()", "").trim()
                        });
                    }
                }
            }
            else {
                if (rulesDataRaw.p.length) {
                    for (const p of rulesDataRaw.p) {
                        const ruleName = getCleanString(p["span"]).replace(":", "");
                        rules.set(ruleName, {
                            name: ruleName,
                            type: getCleanString(rulesDataRaw.h2),
                            text: getCleanString(p["#text"]).replace("()", "").trim()
                        });
                    }
                } else {
                    const ruleName = getCleanString(rulesDataRaw.p["span"]).replace(":", "");
                    rules.set(ruleName, {
                        name: ruleName,
                        type: getCleanString(rulesDataRaw.h2),
                        text: getCleanString(rulesDataRaw.p["#text"]).replace("()", "").trim()
                    });
                }
            }
            return rules;
        } catch (error) {
            throw new Error(`[RULES]: Error parsing rules: ${error}`);
        }
    }

    //#endregion

}
