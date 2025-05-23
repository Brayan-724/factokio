import { Tile, TileType } from './tiletypes';
import { Item } from './conveyor';
import { World } from './world'; // For checking underlying resource tile

export interface MiningDrill extends Tile {
    type: TileType.MINING_DRILL;
    resourceType: string | null; // e.g., 'iron_ore', 'copper_ore', derived from underlying tile
    miningSpeed: number; // Ticks per item
    miningProgress: number;
    outputBuffer: Item | null; // Can hold one item/stack
    isActive: boolean; // True if on a valid resource patch
    x?: number; // Own coordinates
    y?: number; // Own coordinates
}

export function createMiningDrill(x: number, y: number, miningSpeed: number = 100): MiningDrill {
    return {
        type: TileType.MINING_DRILL,
        walkable: false,
        resourceType: null, // Will be set by world based on underlying tile
        miningSpeed,
        miningProgress: 0,
        outputBuffer: null,
        isActive: false,
        x,
        y,
    };
}

// Called when the drill is placed or the underlying tile might change.
export function checkMiningDrillResource(drill: MiningDrill, world: World) {
    if (drill.x === undefined || drill.y === undefined) {
        drill.isActive = false;
        return;
    }
    // Check the tile *under* the drill, which means we need a way to query that.
    // Assuming World class has a method like getNaturalTile(x,y) or similar,
    // or that the resource information is part of the base tile the drill sits on.
    // For now, let's assume the drill is placed on a resource tile itself,
    // and its 'resource' property in the Tile interface is checked.
    const groundTile = world.getTile(drill.x, drill.y); // This gets the drill itself.
                                                        // We need a way to know what it was placed ON.
                                                        // This is a design challenge.
                                                        // Let's assume the world will pass the resource type when placing.
                                                        // OR, the drill is "placed" and then its resourceType is set.

    // Simplification: Assume the 'resource' property of the *drill's tile object* is set
    // by the world when the drill is created/placed, if it's on a resource patch.
    // This is a bit of a workaround for not having a separate layer for ground resources.
    if (groundTile && groundTile.resource) { // Check the 'resource' field of the tile the drill IS.
        drill.resourceType = groundTile.resource;
        drill.isActive = true;
        console.log(`Drill at (${drill.x}, ${drill.y}) activated for resource: ${drill.resourceType}`);
    } else {
        drill.resourceType = null;
        drill.isActive = false;
        // console.log(`Drill at (${drill.x}, ${drill.y}) is not on a valid resource patch.`);
    }
}


export function updateMiningDrill(drill: MiningDrill, world: World) {
    // Ensure resource type is checked/updated if it hasn't been.
    // This might be better done once at placement.
    if (drill.resourceType === null && drill.isActive === false) {
        // checkMiningDrillResource(drill, world); // This might be problematic if called every tick.
                                                // Best to set resource type on placement.
    }

    if (!drill.isActive || !drill.resourceType || drill.outputBuffer !== null) {
        // Not active, no resource type identified, or output buffer is full
        return;
    }

    drill.miningProgress++;
    if (drill.miningProgress >= drill.miningSpeed) {
        drill.miningProgress = 0;
        // Use the specific resource type identified for the drill.
        // The name of the item should correspond to the resource (e.g., "iron_ore" item for "iron" resource)
        const itemName = drill.resourceType; // e.g. if resource is "iron", item is "iron_ore"
                                            // This needs to be consistent. Let's say resource IS "iron_ore".
        drill.outputBuffer = { name: itemName };
        console.log(`Mining drill at (${drill.x}, ${drill.y}) produced ${itemName}`);
    }
}

export function tryTakeItemFromDrillOutput(drill: MiningDrill): Item | null {
    if (drill.outputBuffer) {
        const item = drill.outputBuffer;
        drill.outputBuffer = null;
        drill.miningProgress = 0; // Reset progress after item is taken
        console.log(`Item ${item.name} taken from drill at (${drill.x}, ${drill.y})`);
        return item;
    }
    return null;
}
