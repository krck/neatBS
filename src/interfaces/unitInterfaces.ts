
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

export interface Selection {
    name: string;
    info: string;
}

export interface Stats {
    unit: string;
    m: string;
    t: string;
    save: string;
    w: string;
    ld: string;
    oc: string;
    ref: string;
}

export interface Weapon {
    name: string;
    range: string;
    a: string;
    skill: string;
    s: string;
    ap: string;
    d: string;
    abilities: string;
}

export interface PsychicPower {
    name: string;
    warpCharge: string;
    range: string;
    details: string;
}

//
// Main unit type
//
export interface Unit {
    role: string;           // HQ, Elite, Troops, ...
    //pwr: string;            // Power
    pts: string;            // Points
    name: string;
    info: string;           // Infos like "Warlord" or "Chapter Command"
    comp: string;           // Infos like "Intercessor Sergeant, 4x Intercessor"
    categories: string;     // List of keywords like "Core", "Infantry", "Vehicle", ...
    psycher: string;        // Additional Psycher info (if unit is a Psycher)
    invulnSave: { inv: string, info: string };     // Treated as a Ability by BattleScribe
    damaged: string;
    leaderInfo: string;
    transportInfo: string;
    abilities: Ability[];
    stats: Stats[];
    weapons: Weapon[];
    powers: PsychicPower[];
    selections: Selection[];
}
