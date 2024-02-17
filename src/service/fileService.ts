import { getCleanString } from "../common/helpers";
import * as parser from "fast-xml-parser";
import * as fs from "fs";

export class FileService {

    private static _instance: FileService;
    public static get instance() { return this._instance || (this._instance = new this()); }

    //#region  Public Functions

    public getHtmlFilesInFolder(folderPath: string): string[] {
        if (folderPath === null || !folderPath)
            return [];

        const allFiles = new Array<string>();
        fs.readdirSync(folderPath).forEach(file => {
            if (file.includes(".html"))
                allFiles.push(file);
        });
        return allFiles;
    }

    public readHtmlFile(fileName: string): any {
        try {
            const fileRaw = getCleanString(fs.readFileSync(fileName, "utf8").replaceAll("<br>", ""));
            const fileContentParsed: any = new parser.XMLParser().parse(fileRaw);
            return fileContentParsed;
        } catch (error) {
            throw new Error(`[FILE]: Error reading file: ${error}`);
        }
    }

    public writeHtmlFile(fileName: string, fileContent: string): boolean {
        try {
            fs.writeFileSync(fileName, fileContent);
            return true;
        } catch (error) {
            throw new Error(`[FILE]: Error writing file: ${error}`);
        }
    }

    //#endregion

}
