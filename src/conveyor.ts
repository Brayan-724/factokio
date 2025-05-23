import { Tile, TileType } from './tiletypes.js';

// Define the direction of the conveyor belt
export enum Direction {
    UP,
    DOWN,
    LEFT,
    RIGHT
}

// Define an interface for items that can be on a conveyor
export interface Item {
    name: string;
    // Potentially add other properties like color, value, etc.
}

// Define the ConveyorBelt tile interface
export interface ConveyorBelt extends Tile {
    type: TileType.CONVEYOR_BELT;
    direction: Direction;
    items: (Item | null)[]; // Array representing positions on the belt, can hold items or be empty
    speed: number; // Tiles per second or ticks per move
    maxItems: number; // Max items the belt segment can hold (e.g., 1 if it's a single tile segment)
}

// Helper function to create a new conveyor belt
export function createConveyorBelt(direction: Direction, speed: number = 1, maxItems: number = 1): ConveyorBelt {
    return {
        type: TileType.CONVEYOR_BELT,
        walkable: false, // Typically, players might not walk on belts or it's restricted
        direction,
        items: new Array(maxItems).fill(null),
        speed,
        maxItems
    };
}

// Function to attempt to add an item to a conveyor belt
// Returns true if successful, false otherwise
export function addItemToBelt(belt: ConveyorBelt, item: Item): boolean {
    // Add item to the first available slot (entry point of the belt segment)
    // This simplified model assumes items are added at the start of this specific belt tile.
    // More complex logic would be needed for continuous belts.
    const firstEmptySlot = belt.items.indexOf(null);
    if (firstEmptySlot !== -1) {
        belt.items[firstEmptySlot] = item;
        return true;
    }
    return false; // Belt segment is full
}

// Function to update a single conveyor belt's state (move items)
// This would typically be called each game tick/update cycle
// For now, this moves items one step. Real implementation would use belt.speed.
export function updateBelt(belt: ConveyorBelt, world: any /* World */, x: number, y: number) {
    // Determine the "output" slot of this belt segment based on its direction.
    // For simplicity, we assume items exit from the last slot (index maxItems - 1).
    let itemToMove: Item | null = null;
    let itemMovedFromInternalSlot = false;

    // 1. Attempt to move the item at the very end of the belt to the next tile.
    if (belt.items[belt.maxItems - 1]) {
        itemToMove = belt.items[belt.maxItems - 1];

        let nextX = x, nextY = y;
        switch (belt.direction) {
            case Direction.UP: nextY--; break;
            case Direction.DOWN: nextY++; break;
            case Direction.LEFT: nextX--; break;
            case Direction.RIGHT: nextX++; break;
        }

        const nextTile = world.getTile(nextX, nextY);
        let successfullyMovedOffBelt = false;

        if (nextTile) {
            if (nextTile.type === TileType.CONVEYOR_BELT) {
                const nextBelt = nextTile as ConveyorBelt;
                // Item should enter the *first* slot of the next belt if it's aligned.
                // This simple model adds to any empty slot.
                // A more precise model would check if the next belt is facing away from this one, etc.
                if (addItemToBeltInput(nextBelt, itemToMove!)) {
                    successfullyMovedOffBelt = true;
                }
            } else if (nextTile.type === TileType.ASSEMBLER) {
                // This is a direct transfer, usually an inserter would do this.
                // For now, let's assume direct transfer if assembler is the next tile.
                // import { tryAddItemToAssemblerInput } from './assembler.js'; // (needs to be available)
                // if (world.tryAddItemToAssemblerInput(nextTile as Assembler, itemToMove!)) {
                // successfullyMovedOffBelt = true;
                // }
                // This interaction is better handled by inserters. Belts usually feed belts or are picked from.
            }
            // TODO: Add cases for other entities (inserters picking up directly - though inserters actively take)
        }

        if (successfullyMovedOffBelt) {
            belt.items[belt.maxItems - 1] = null;
            itemMovedFromInternalSlot = true; // To trigger internal shift
        } else if (!nextTile) {
            // Item falls off the world or is blocked
            // console.log(`Item ${itemToMove!.name} fell off or blocked at end of belt ${x},${y}`);
            // itemToMove = null; // Item is lost or stuck
        }
    }

    // 2. Shift items along this belt segment if possible
    // Start from the second to last slot and move items towards the end.
    for (let i = belt.maxItems - 2; i >= 0; i--) {
        if (belt.items[i] && belt.items[i+1] === null) {
            belt.items[i+1] = belt.items[i];
            belt.items[i] = null;
            itemMovedFromInternalSlot = true;
        }
    }
    // If an item moved off the belt, the last slot is now empty,
    // so the item from slot maxItems-2 could move into maxItems-1.
    // The loop above handles this. If itemMovedFromInternalSlot is true, a re-render might be needed.
}

// Function to attempt to add an item to a conveyor belt's INPUT point
// This is typically the first slot (index 0) of the belt segment.
export function addItemToBeltInput(belt: ConveyorBelt, item: Item): boolean {
    if (belt.items[0] === null) {
        belt.items[0] = item;
        return true;
    }
    return false; // Belt input slot is full
}

// Original addItemToBelt is generic, let's keep it for now if used by inserters
// to place items mid-belt (though typically they place at the start of a segment).
// If inserters always place at the start of a segment, addItemToBeltInput is better.
