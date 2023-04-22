
// Convert any to string and remove all line-breaks and multiple spaces ("  ")
export function getCleanString(value: any): string {
    return (value !== undefined && value !== null && value)
        ? String(value).replace(/(?:\r\n|\r|\n)/g, "").replace(/\s\s+/g, " ").trim()
        : "";
}
