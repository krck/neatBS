import { Rule } from "../interfaces/unitInterfaces";
import { getCleanString } from "../common/helpers";

export class RuleService {

    private static _instance: RuleService;
    public static get instance() { return this._instance || (this._instance = new this()); }

    //#region  Public Functions

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
