
export interface Rule {
    type: string;
    name: string;
    text: string;
}

export interface Ability {
    name: string;
    description: string;
    ref: string;
}

export interface Stats {
    unit: string;
    m: string;
    ws: string;
    bs: string;
    s: string;
    t: string;
    w: string;
    a: string;
    ld: string;
    save: string;
    ref: string;
}

export interface Weapon {
    name: string;
    range: string;
    type: string;
    s: string;
    ap: string;
    d: string;
    abilities: string;
    info: string;
}

//
// Main unit type
//
export interface Unit {
    role: string;           // HQ, Elite, Troops, ...
    pwr: string;            // Power
    pts: string;            // Points
    name: string;
    info: string;           // Infos like "Warlord" or "Chapter Command"
    comp: string;           // Infos like "Intercessor Sergeant, 4x Intercessor"
    categories: string;     // List of keywords like "Core", "Infantry", "Vehicle", ...
    abilities: Ability[];
    stats: Stats[];
    weapons: Weapon[];
}
