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
            for (const ruleRaw of rulesDataRaw) {
                for (const p of ruleRaw.p) {
                    const ruleName = getCleanString(p['span']).replace(":", "");
                    rules.set(ruleName, {
                        name: ruleName,
                        type: getCleanString(ruleRaw.h2),
                        text: getCleanString(p['#text']).replace("()", "").trim()
                    });
                }
            }
            return rules;
        } catch (error) {
            throw new Error(`[RULES]: Error parsing rules: ${error}`)
        }
    }

    //#endregion
}
