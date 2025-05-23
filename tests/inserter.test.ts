import { World } from '../src/world';
import { TileType } from '../src/tiletypes';
import { ConveyorBelt, createConveyorBelt, Direction as ConveyorDirection, Item, addItemToBeltInput } from '../src/conveyor';
import { Inserter, createInserter, updateInserter, InserterDirection } from '../src/inserter';
import { Assembler, createAssembler, setRecipe, Recipe, tryAddItemToAssemblerInput } from '../src/assembler';
import { MiningDrill, createMiningDrill } from '../src/miningdrill';

describe('Inserter', () => {
    let world: World;
    const itemIron: Item = { name: 'iron_ore' };
    const itemPlate: Item = { name: 'iron_plate' };

    beforeEach(() => {
        world = new World(5, 5); // Create a small world for testing
    });

    test('should create an inserter with correct pickup/dropoff targets', () => {
        // Inserter at (2,2), facing RIGHT (picks Left, drops Right)
        const inserterR = createInserter(2, 2, InserterDirection.RIGHT);
        expect(inserterR.pickupTarget).toEqual({ x: 1, y: 2 });
        expect(inserterR.dropoffTarget).toEqual({ x: 3, y: 2 });

        // Inserter at (2,2), facing UP (picks Down, drops Up)
        const inserterU = createInserter(2, 2, InserterDirection.UP);
        expect(inserterU.pickupTarget).toEqual({ x: 2, y: 3 });
        expect(inserterU.dropoffTarget).toEqual({ x: 2, y: 1 });
    });

    test('updateInserter should respect cooldown', () => {
        const belt = createConveyorBelt(ConveyorDirection.RIGHT);
        belt.items[0] = itemIron;
        world.setTile(1, 2, belt); // Belt at (1,2) [pickup location for RIGHT facing inserter at (2,2)]
        
        const inserter = createInserter(2, 2, InserterDirection.RIGHT, 5); // Cooldown 5
        world.setTile(2, 2, inserter);

        updateInserter(inserter, world); // First update: picks up item, starts cooldown
        expect(inserter.currentItem).toEqual(itemIron);
        expect(inserter.cooldown).toBe(5);

        inserter.currentItem = null; // Manually clear item to prevent drop attempt
        for (let i = 0; i < 5; i++) {
            updateInserter(inserter, world);
            expect(inserter.cooldown).toBe(5 - (i + 1));
            expect(inserter.currentItem).toBeNull(); // Should not pick up again due to cooldown
        }
        
        updateInserter(inserter, world); // Cooldown finished, should pick up again
        expect(inserter.currentItem).toEqual(itemIron);
    });

    test('should pick item from conveyor and place on another conveyor', () => {
        const sourceBelt = createConveyorBelt(ConveyorDirection.RIGHT, 1, 1); // At (1,2)
        // Item is at the 'output' slot of the source belt segment to be picked up
        sourceBelt.items[sourceBelt.maxItems - 1] = itemIron; 
        world.setTile(1, 2, sourceBelt);

        const targetBelt = createConveyorBelt(ConveyorDirection.RIGHT, 1, 1); // At (3,2)
        world.setTile(3, 2, targetBelt);
        
        const inserter = createInserter(2, 2, InserterDirection.RIGHT); // Picks from (1,2), drops to (3,2)
        world.setTile(2, 2, inserter);

        // Tick 1: Pick up
        updateInserter(inserter, world);
        expect(inserter.currentItem).toEqual(itemIron);
        expect(sourceBelt.items[sourceBelt.maxItems - 1]).toBeNull(); // Item picked from source

        // Tick 2: Place
        updateInserter(inserter, world);
        expect(inserter.currentItem).toBeNull(); // Item placed
        expect(targetBelt.items[0]).toEqual(itemIron); // Item on target belt's input slot
    });

    test('should pick item from assembler and place on conveyor', () => {
        const assembler = createAssembler();
        assembler.outputBuffer = itemPlate; // Assembler has a finished item
        world.setTile(1, 2, assembler); // Assembler at (1,2)

        const targetBelt = createConveyorBelt(ConveyorDirection.RIGHT); // At (3,2)
        world.setTile(3, 2, targetBelt);

        const inserter = createInserter(2, 2, InserterDirection.RIGHT); // Picks from (1,2), drops to (3,2)
        world.setTile(2, 2, inserter);
        
        // Tick 1: Pick up
        updateInserter(inserter, world);
        expect(inserter.currentItem).toEqual(itemPlate);
        expect(assembler.outputBuffer).toBeNull();

        // Tick 2: Place
        updateInserter(inserter, world);
        expect(inserter.currentItem).toBeNull();
        expect(targetBelt.items[0]).toEqual(itemPlate);
    });

    test('should pick item from conveyor and place in assembler', () => {
        const sourceBelt = createConveyorBelt(ConveyorDirection.RIGHT);
        sourceBelt.items[sourceBelt.maxItems - 1] = itemIron;
        world.setTile(1, 2, sourceBelt);

        const assembler = createAssembler();
        const recipe: Recipe = { name: 'Iron Plate', inputs: [{ itemName: 'iron_ore', quantity: 1 }], output: { itemName: 'iron_plate', quantity: 1 }, craftingTime: 10 };
        setRecipe(assembler, recipe); // Setup assembler to need iron_ore
        world.setTile(3, 2, assembler); // Assembler at (3,2)

        const inserter = createInserter(2, 2, InserterDirection.RIGHT);
        world.setTile(2, 2, inserter);

        // Tick 1: Pick up
        updateInserter(inserter, world);
        expect(inserter.currentItem).toEqual(itemIron);

        // Tick 2: Place
        updateInserter(inserter, world);
        expect(inserter.currentItem).toBeNull();
        expect(assembler.inputBuffer.get('iron_ore')?.current).toBe(1);
    });
    
    test('should pick item from mining drill and place on conveyor', () => {
        const drill = world.createMiningDrill(1, 2, 100, 'iron_ore'); // Drill at (1,2)
        // Manually set drill's output buffer for testing pickup
        (drill as MiningDrill).outputBuffer = itemIron;
        world.setTile(1, 2, drill);


        const targetBelt = createConveyorBelt(ConveyorDirection.RIGHT); // At (3,2)
        world.setTile(3, 2, targetBelt);

        const inserter = createInserter(2, 2, InserterDirection.RIGHT); // Picks from (1,2), drops to (3,2)
        world.setTile(2, 2, inserter);
        
        // Tick 1: Pick up
        updateInserter(inserter, world);
        expect(inserter.currentItem).toEqual(itemIron);
        expect((drill as MiningDrill).outputBuffer).toBeNull();

        // Tick 2: Place
        updateInserter(inserter, world);
        expect(inserter.currentItem).toBeNull();
        expect(targetBelt.items[0]).toEqual(itemIron);
    });

    test('should not pick from empty source or place onto full target', () => {
        const sourceBeltEmpty = createConveyorBelt(ConveyorDirection.RIGHT); // At (1,2) - Empty
        world.setTile(1, 2, sourceBeltEmpty);

        const targetBeltFull = createConveyorBelt(ConveyorDirection.RIGHT); // At (3,2) - Full
        addItemToBeltInput(targetBeltFull, itemPlate); // Fill its input slot
        world.setTile(3, 2, targetBeltFull);
        
        const inserter = createInserter(2, 2, InserterDirection.RIGHT);
        world.setTile(2, 2, inserter);

        // Tick 1: Try to pick from empty source
        updateInserter(inserter, world);
        expect(inserter.currentItem).toBeNull(); // Should not pick up anything

        // Manually give item to inserter to test placing onto full target
        inserter.currentItem = itemIron;

        // Tick 2: Try to place onto full target
        updateInserter(inserter, world);
        expect(inserter.currentItem).toEqual(itemIron); // Should still be holding item
        expect(targetBeltFull.items[0]).toEqual(itemPlate); // Target belt unchanged
    });
});
