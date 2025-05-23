import { Assembler, createAssembler, setRecipe, tryAddItemToAssemblerInput, tryTakeItemFromAssemblerOutput, updateAssembler, Recipe } from '../src/assembler';
import { Item } from '../src/conveyor';
import { TileType } from '../src/tiletypes';

describe('Assembler', () => {
    let assembler: Assembler;
    const itemIronOre: Item = { name: 'iron_ore' };
    const itemCopperOre: Item = { name: 'copper_ore' };
    const itemIronPlate: Item = { name: 'iron_plate' };

    const ironPlateRecipe: Recipe = {
        name: 'Iron Plate',
        inputs: [{ itemName: 'iron_ore', quantity: 1 }],
        output: { itemName: 'iron_plate', quantity: 1 },
        craftingTime: 5 // 5 ticks to craft
    };

    const copperGearRecipe: Recipe = {
        name: 'Copper Gear',
        inputs: [{ itemName: 'copper_ore', quantity: 2 }],
        output: { itemName: 'copper_gear', quantity: 1 },
        craftingTime: 10
    };

    beforeEach(() => {
        assembler = createAssembler();
    });

    test('should create an assembler with default properties', () => {
        expect(assembler.type).toBe(TileType.ASSEMBLER);
        expect(assembler.currentRecipe).toBeNull();
        expect(assembler.inputBuffer.size).toBe(0);
        expect(assembler.outputBuffer).toBeNull();
        expect(assembler.craftingProgress).toBe(0);
    });

    test('setRecipe should correctly initialize assembler for a new recipe', () => {
        setRecipe(assembler, ironPlateRecipe);
        expect(assembler.currentRecipe).toEqual(ironPlateRecipe);
        expect(assembler.inputBuffer.has('iron_ore')).toBe(true);
        expect(assembler.inputBuffer.get('iron_ore')).toEqual({ current: 0, needed: 1 });
        expect(assembler.craftingProgress).toBe(0);
        expect(assembler.outputBuffer).toBeNull();
    });

    test('tryAddItemToAssemblerInput should add item if needed and buffer not full', () => {
        setRecipe(assembler, ironPlateRecipe);
        const success = tryAddItemToAssemblerInput(assembler, itemIronOre);
        expect(success).toBe(true);
        expect(assembler.inputBuffer.get('iron_ore')?.current).toBe(1);
    });

    test('tryAddItemToAssemblerInput should fail if item not in recipe or buffer full', () => {
        setRecipe(assembler, ironPlateRecipe);
        tryAddItemToAssemblerInput(assembler, itemIronOre); // Buffer is now full (1/1)

        let success = tryAddItemToAssemblerInput(assembler, itemIronOre); // Try adding another iron_ore
        expect(success).toBe(false);
        
        success = tryAddItemToAssemblerInput(assembler, itemCopperOre); // Try adding wrong item
        expect(success).toBe(false);
        expect(assembler.inputBuffer.get('iron_ore')?.current).toBe(1);
    });

    test('updateAssembler should not progress if recipe is not set', () => {
        tryAddItemToAssemblerInput(assembler, itemIronOre); // No recipe
        updateAssembler(assembler);
        expect(assembler.craftingProgress).toBe(0);
    });
    
    test('updateAssembler should not progress if inputs are not met', () => {
        setRecipe(assembler, ironPlateRecipe); // Needs 1 iron_ore
        updateAssembler(assembler);
        expect(assembler.craftingProgress).toBe(0);
    });

    test('updateAssembler should progress crafting if inputs are met', () => {
        setRecipe(assembler, ironPlateRecipe);
        tryAddItemToAssemblerInput(assembler, itemIronOre);
        
        updateAssembler(assembler);
        expect(assembler.craftingProgress).toBe(1);
    });

    test('updateAssembler should complete crafting, produce output, and consume inputs', () => {
        setRecipe(assembler, ironPlateRecipe); // Crafting time 5
        tryAddItemToAssemblerInput(assembler, itemIronOre);

        for (let i = 0; i < ironPlateRecipe.craftingTime; i++) {
            updateAssembler(assembler);
        }

        expect(assembler.craftingProgress).toBe(0); // Resets after completion
        expect(assembler.outputBuffer).toEqual({ name: 'iron_plate' });
        expect(assembler.inputBuffer.get('iron_ore')?.current).toBe(0); // Input consumed
    });
    
    test('updateAssembler should handle recipe with multiple input quantities', () => {
        setRecipe(assembler, copperGearRecipe); // Needs 2 copper_ore
        tryAddItemToAssemblerInput(assembler, itemCopperOre);
        updateAssembler(assembler);
        expect(assembler.craftingProgress).toBe(0); // Not enough input

        tryAddItemToAssemblerInput(assembler, itemCopperOre); // Add second copper_ore
        expect(assembler.inputBuffer.get('copper_ore')?.current).toBe(2);

        for (let i = 0; i < copperGearRecipe.craftingTime; i++) {
            updateAssembler(assembler);
        }
        expect(assembler.outputBuffer).toEqual({ name: 'copper_gear' });
        expect(assembler.inputBuffer.get('copper_ore')?.current).toBe(0);
    });

    test('updateAssembler should not craft if output buffer is full', () => {
        setRecipe(assembler, ironPlateRecipe);
        tryAddItemToAssemblerInput(assembler, itemIronOre);
        assembler.outputBuffer = { name: 'blocker_item' }; // Output buffer is full

        updateAssembler(assembler);
        expect(assembler.craftingProgress).toBe(0); // Should not start/progress
    });
    
    test('tryTakeItemFromAssemblerOutput should return item and clear buffer', () => {
        assembler.outputBuffer = itemIronPlate;
        const takenItem = tryTakeItemFromAssemblerOutput(assembler);
        expect(takenItem).toEqual(itemIronPlate);
        expect(assembler.outputBuffer).toBeNull();
    });

    test('tryTakeItemFromAssemblerOutput should return null if buffer is empty', () => {
        const takenItem = tryTakeItemFromAssemblerOutput(assembler);
        expect(takenItem).toBeNull();
    });
});
