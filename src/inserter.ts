import { Tile, TileType } from './tiletypes.js';
import { Item, ConveyorBelt, addItemToBeltInput } from './conveyor.js';
import { World } from './world.js';
import { Assembler, tryAddItemToAssemblerInput, tryTakeItemFromAssemblerOutput } from './assembler.js';
import { MiningDrill, tryTakeItemFromDrillOutput } from './miningdrill.js'; // Added MiningDrill

// Inserters also have a direction, similar to conveyors
export enum InserterDirection {
    UP,    // Picks from South, Drops to North
    DOWN,  // Picks from North, Drops to South
    LEFT,  // Picks from East, Drops to West
    RIGHT  // Picks from West, Drops to East
}

export interface Inserter extends Tile {
    type: TileType.INSERTER;
    direction: InserterDirection;
    pickupTarget: { x: number, y: number }; // Coordinates it tries to pick from
    dropoffTarget: { x: number, y: number }; // Coordinates it tries to drop to
    currentItem: Item | null;
    cooldown: number; // Time steps until next action
    maxCooldown: number; // Cooldown period after an action
    x?: number; // Own coordinates
    y?: number; // Own coordinates
}

export function createInserter(xPos: number, yPos: number, direction: InserterDirection, maxCooldown: number = 60): Inserter {
    let pX = xPos, pY = yPos, dX = xPos, dY = yPos;

    switch (direction) {
        case InserterDirection.UP:    pY = yPos + 1; dY = yPos - 1; break;
        case InserterDirection.DOWN:  pY = yPos - 1; dY = yPos + 1; break;
        case InserterDirection.LEFT:  pX = xPos + 1; dX = xPos - 1; break;
        case InserterDirection.RIGHT: pX = xPos - 1; dX = xPos + 1; break;
    }

    return {
        type: TileType.INSERTER,
        walkable: false,
        direction,
        pickupTarget: { x: pX, y: pY },
        dropoffTarget: { x: dX, y: dY },
        currentItem: null,
        cooldown: 0,
        maxCooldown,
        x: xPos, // Store own coordinates
        y: yPos
    };
}

// Update function for an inserter, to be called each game tick
export function updateInserter(inserter: Inserter, world: World) {
    if (inserter.cooldown > 0) {
        inserter.cooldown--;
        return;
    }

    const ownX = inserter.x; // Assuming x,y are now stored on inserter
    const ownY = inserter.y;

    if (inserter.currentItem) {
        // Try to place item
        const dropoffTile = world.getTile(inserter.dropoffTarget.x, inserter.dropoffTarget.y);
        if (dropoffTile) {
            let placed = false;
            if (dropoffTile.type === TileType.CONVEYOR_BELT) {
                // Use addItemToBeltInput to place at the start of the belt segment
                if (addItemToBeltInput(dropoffTile as ConveyorBelt, inserter.currentItem)) {
                    placed = true;
                }
            } else if (dropoffTile.type === TileType.ASSEMBLER) {
               if (tryAddItemToAssemblerInput(dropoffTile as Assembler, inserter.currentItem)) {
                   placed = true;
               }
            }
            // TODO: Add other dropoff targets like chests

            if (placed) {
                console.log(`Inserter at (${ownX}, ${ownY}) dropped ${inserter.currentItem.name} to (${inserter.dropoffTarget.x}, ${inserter.dropoffTarget.y})`);
                inserter.currentItem = null;
                inserter.cooldown = inserter.maxCooldown;
            } else {
                // console.log(`Inserter at (${ownX}, ${ownY}) waiting: Dropoff target full/invalid.`);
            }
        }
    } else {
        // Try to pick up item
        const pickupTile = world.getTile(inserter.pickupTarget.x, inserter.pickupTarget.y);
        if (pickupTile) {
            let pickedItem: Item | null = null;
            if (pickupTile.type === TileType.CONVEYOR_BELT) {
                const belt = pickupTile as ConveyorBelt;
                // Inserter picks from the "end" of the belt segment it's facing.
                // This needs to be relative to the inserter's pickup direction.
                // For now, let's try to pick any item on the belt tile.
                // A better model: inserter arm has a specific point it picks from on the target tile.
                // Simplification: pick the last item on the belt segment.
                if (belt.items[belt.maxItems -1]) {
                    pickedItem = belt.items[belt.maxItems -1];
                    belt.items[belt.maxItems -1] = null;
                } else {
                    // Try to pick any item if the "output" slot is empty (e.g. belt not moving for a moment)
                    for (let i = belt.maxItems - 2; i >= 0; i--) {
                        if (belt.items[i]) {
                            pickedItem = belt.items[i];
                            belt.items[i] = null;
                            break;
                        }
                    }
                }

            } else if (pickupTile.type === TileType.ASSEMBLER) {
                pickedItem = tryTakeItemFromAssemblerOutput(pickupTile as Assembler);
            } else if (pickupTile.type === TileType.MINING_DRILL) { // Added MiningDrill interaction
                pickedItem = tryTakeItemFromDrillOutput(pickupTile as MiningDrill);
            }
            // TODO: Add other pickup sources like chests

            if (pickedItem) {
                inserter.currentItem = pickedItem;
                inserter.cooldown = inserter.maxCooldown;
                console.log(`Inserter at (${ownX}, ${ownY}) picked up ${pickedItem.name} from (${inserter.pickupTarget.x}, ${inserter.pickupTarget.y})`);
            }
        }
    }
}

// World.prototype.getTileCoordinates was removed as inserters now store their own x,y
// which are set by World.setTile()
