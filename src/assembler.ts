import { Tile, TileType } from './tiletypes.js';
import { Item } from './conveyor.js'; // Assuming Item is defined in conveyor.ts

// Define a recipe for crafting
export interface Recipe {
    name: string;
    inputs: { itemName: string, quantity: number }[];
    output: { itemName: string, quantity: number };
    craftingTime: number; // Time steps (e.g., game ticks) to craft
}

// Define the Assembler tile interface
export interface Assembler extends Tile {
    type: TileType.ASSEMBLER;
    currentRecipe: Recipe | null;
    inputBuffer: Map<string, { current: number, needed: number }>; // Stores current items and what's needed for the recipe
    outputBuffer: Item | null; // Simple output: holds one item or stack
    craftingProgress: number;
    maxOutputBufferSize?: number; // Optional: if assembler can hold multiple output items
}

export function createAssembler(): Assembler {
    return {
        type: TileType.ASSEMBLER,
        walkable: false,
        currentRecipe: null,
        inputBuffer: new Map(),
        outputBuffer: null,
        craftingProgress: 0,
    };
}

export function setRecipe(assembler: Assembler, recipe: Recipe) {
    assembler.currentRecipe = recipe;
    assembler.inputBuffer.clear();
    recipe.inputs.forEach(input => {
        assembler.inputBuffer.set(input.itemName, { current: 0, needed: input.quantity });
    });
    assembler.craftingProgress = 0;
    assembler.outputBuffer = null; // Clear output when recipe changes
}

// Attempt to add an item to the assembler's input buffer
export function tryAddItemToAssemblerInput(assembler: Assembler, item: Item): boolean {
    if (!assembler.currentRecipe) return false; // No recipe set

    const requiredItem = assembler.inputBuffer.get(item.name);
    if (requiredItem && requiredItem.current < requiredItem.needed) {
        requiredItem.current++;
        console.log(`Added ${item.name} to assembler. Have ${requiredItem.current}/${requiredItem.needed}`);
        return true;
    }
    return false; // Item not needed or buffer for this item is full
}

// Attempt to take an item from the assembler's output buffer
export function tryTakeItemFromAssemblerOutput(assembler: Assembler): Item | null {
    if (assembler.outputBuffer) {
        const item = assembler.outputBuffer;
        assembler.outputBuffer = null;
        console.log(`Took ${item.name} from assembler output.`);
        return item;
    }
    return null;
}

// Update function for an assembler, to be called each game tick
export function updateAssembler(assembler: Assembler) {
    if (!assembler.currentRecipe) return; // Not doing anything without a recipe

    // If output buffer is full, wait
    if (assembler.outputBuffer && (!assembler.maxOutputBufferSize || (assembler.outputBuffer ? 1 : 0) >= (assembler.maxOutputBufferSize || 1))) {
        // console.log("Assembler waiting: Output buffer is full.");
        return;
    }

    // Check if all inputs are available
    let allInputsAvailable = true;
    for (const input of assembler.currentRecipe.inputs) {
        const bufferedItem = assembler.inputBuffer.get(input.itemName);
        if (!bufferedItem || bufferedItem.current < input.quantity) {
            allInputsAvailable = false;
            break;
        }
    }

    if (allInputsAvailable) {
        // Start/continue crafting
        assembler.craftingProgress++;
        // console.log(`Assembler progress: ${assembler.craftingProgress}/${assembler.currentRecipe.craftingTime}`);

        if (assembler.craftingProgress >= assembler.currentRecipe.craftingTime) {
            // Crafting complete
            console.log(`Assembler finished crafting: ${assembler.currentRecipe.output.itemName}`);
            // Consume inputs
            assembler.currentRecipe.inputs.forEach(input => {
                const bufferedItem = assembler.inputBuffer.get(input.itemName)!; // Should exist due to check
                bufferedItem.current -= input.quantity;
            });

            // Add to output buffer
            // This simplified version assumes output quantity is 1.
            // For recipes with output quantity > 1, this needs adjustment or multiple output slots.
            assembler.outputBuffer = { name: assembler.currentRecipe.output.itemName };
            assembler.craftingProgress = 0; // Reset progress
        }
    } else {
        // Waiting for ingredients
        if (assembler.craftingProgress > 0) {
             // console.log("Assembler paused: Missing ingredients.");
        }
        assembler.craftingProgress = 0; // Reset progress if ingredients are missing mid-craft
    }
}
