import { ConversionService } from "./service/conversionService";
import { UnitService } from "./service/unitService";
import { RuleService } from "./service/ruleService";
import { FileService } from "./service/fileService";

function main(): boolean {
    try {
        // 1. Read the HTML file and transform it into "any" json objects
        const fullPath: string = "C:\\Users\\Peter\\Desktop\\1000p - Heavy.html";
        const dataRaw = FileService.instance.readHtmlFile(fullPath);

        // 2. Parse rules and units into typed objects
        const rules = RuleService.instance.parseRules(dataRaw);
        const units = UnitService.instance.parseUnits(dataRaw, rules);

        // 3. Upgrade units, rules and abilities with any  kind of army specifics
        ConversionService.instance.makeSpaceMarineChanges(units);
        ConversionService.instance.makeImperialFistsChanges(units);

        // 4. Create the HTML text and write the output file
        const htmlContent = UnitService.instance.convertUnitsToHtml(units);
        return FileService.instance.writeHtmlFile(fullPath.replace(".html", "_parsed.html"), htmlContent);
    } catch (error) {
        console.log(error)
        return false;
    }
}
main();
