export enum TileType {
    GRASS,
    WATER,
    STONE,
    IRON_ORE,
    CONVEYOR_BELT,
    INSERTER,
    ASSEMBLER
}

export interface Tile {
    type: TileType;
    walkable: boolean;
    resource?: string; // Optional: for tiles like IRON_ORE
}
