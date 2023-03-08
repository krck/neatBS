import { ConversionService } from "./service/conversionService";
import { UnitService } from "./service/unitService";
import { RuleService } from "./service/ruleService";
import { FileService } from "./service/fileService";

function main(): boolean {
    try {
        // Get all files in a given path, parse them and output them to another path
        const inputFolder: string = "C:\\Users\\Peter\\Desktop\\Rosters\\html";
        const outputFolder: string = "C:\\Users\\Peter\\Desktop\\Rosters\\parsed";
        const htmlFiles = FileService.instance.getHtmlFilesInFolder(inputFolder);
        if (htmlFiles === undefined || !htmlFiles.length)
            return false;

        for (const htmlFile of htmlFiles) {
            // 1. Read the HTML file and transform it into "any" json objects
            const filePath = inputFolder + "\\" + htmlFile;
            const dataRaw = FileService.instance.readHtmlFile(filePath);

            // 2. Parse rules and units into typed objects
            const rules = RuleService.instance.parseRules(dataRaw);
            const units = UnitService.instance.parseUnits(dataRaw, rules);

            // 3. Upgrade units, rules and abilities with any  kind of army specifics
            ConversionService.instance.makeSpaceMarineChanges(units, false);
            ConversionService.instance.makeImperialFistsChanges(units);

            // 4. Create the HTML text and write the output file
            const htmlContent = UnitService.instance.convertUnitsToHtml(units);
            const parsedFile = (outputFolder + "\\" + htmlFile).replace(".html", "_parsed.html");
            const result = FileService.instance.writeHtmlFile(parsedFile, htmlContent);

            // Small output on success
            console.log(`[DONE] parsed file: "${htmlFile}" - unit count: ${units.length}`);
        }
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
}
main();
