import { World } from '../src/world';
import { TileType } from '../src/tiletypes';
import { ConveyorBelt, createConveyorBelt, updateBelt, addItemToBeltInput, Direction, Item } from '../src/conveyor';

describe('ConveyorBelt', () => {
    let world: World;
    const itemIron: Item = { name: 'iron_ore' };

    beforeEach(() => {
        // World is needed because updateBelt interacts with it to find the next tile
        world = new World(5, 5); 
    });

    test('should create a conveyor belt with correct default properties', () => {
        const belt = createConveyorBelt(Direction.RIGHT);
        expect(belt.type).toBe(TileType.CONVEYOR_BELT);
        expect(belt.direction).toBe(Direction.RIGHT);
        expect(belt.items.length).toBe(1); // Default maxItems = 1
        expect(belt.items[0]).toBeNull();
        expect(belt.speed).toBe(1);
        expect(belt.walkable).toBe(false);
    });

    test('addItemToBeltInput should add item to the first slot if empty', () => {
        const belt = createConveyorBelt(Direction.RIGHT, 1, 3); // maxItems = 3
        const success = addItemToBeltInput(belt, itemIron);
        expect(success).toBe(true);
        expect(belt.items[0]).toEqual(itemIron);
    });

    test('addItemToBeltInput should fail if first slot is occupied', () => {
        const belt = createConveyorBelt(Direction.RIGHT, 1, 3);
        addItemToBeltInput(belt, itemIron); // Fill first slot
        const success = addItemToBeltInput(belt, { name: 'copper_ore' });
        expect(success).toBe(false);
        expect(belt.items[0]).toEqual(itemIron); // Should not have changed
        expect(belt.items[1]).toBeNull();
    });
    
    test('updateBelt should move item one step on a single belt (maxItems > 1)', () => {
        const belt = createConveyorBelt(Direction.RIGHT, 1, 3); // 3 slots
        belt.items[0] = itemIron; // Item at the start
        world.setTile(0,0, belt); // Place belt in world for context, though not strictly needed for this internal move

        updateBelt(belt, world, 0, 0); // Call update
        
        expect(belt.items[0]).toBeNull();
        expect(belt.items[1]).toEqual(itemIron);
        expect(belt.items[2]).toBeNull();
    });

    test('updateBelt should move item to the end slot of a single belt (maxItems > 1)', () => {
        const belt = createConveyorBelt(Direction.RIGHT, 1, 3);
        belt.items[1] = itemIron; // Item in the middle
        world.setTile(0,0, belt);

        updateBelt(belt, world, 0, 0);
        
        expect(belt.items[1]).toBeNull();
        expect(belt.items[2]).toEqual(itemIron);
    });
    
    test('updateBelt should not move item if its next slot is occupied (on same belt)', () => {
        const belt = createConveyorBelt(Direction.RIGHT, 1, 3);
        belt.items[0] = itemIron;
        belt.items[1] = { name: 'copper_ore' }; // Blocker
        world.setTile(0,0, belt);

        updateBelt(belt, world, 0, 0);
        
        expect(belt.items[0]).toEqual(itemIron); // Should not have moved
        expect(belt.items[1]).toEqual({ name: 'copper_ore' });
    });

    test('updateBelt should transfer item to an adjacent accepting conveyor belt', () => {
        const belt1 = createConveyorBelt(Direction.RIGHT, 1, 1); // Belt at (0,0), item exits to (1,0)
        belt1.items[0] = itemIron;
        world.setTile(0, 0, belt1);

        const belt2 = createConveyorBelt(Direction.RIGHT, 1, 1); // Belt at (1,0), ready to accept
        world.setTile(1, 0, belt2);

        updateBelt(belt1, world, 0, 0); // Update belt1

        expect(belt1.items[0]).toBeNull();      // Item should have moved from belt1
        expect(belt2.items[0]).toEqual(itemIron); // Item should be on belt2's input slot
    });

    test('updateBelt should not transfer item if adjacent conveyor belt input is full', () => {
        const belt1 = createConveyorBelt(Direction.RIGHT, 1, 1);
        belt1.items[0] = itemIron;
        world.setTile(0, 0, belt1);

        const belt2 = createConveyorBelt(Direction.RIGHT, 1, 1);
        belt2.items[0] = { name: 'blocker_item' }; // belt2 is full at its input
        world.setTile(1, 0, belt2);
        
        updateBelt(belt1, world, 0, 0);

        expect(belt1.items[0]).toEqual(itemIron); // Item should remain on belt1
        expect(belt2.items[0]).toEqual({ name: 'blocker_item' }); // belt2 remains unchanged
    });

    test('updateBelt should not transfer item if there is no next tile (falls off)', () => {
        const belt = createConveyorBelt(Direction.RIGHT, 1, 1);
        belt.items[0] = itemIron;
        world.setTile(0,0, belt); // Belt at (0,0), wants to move to (1,0) which is empty GRASS

        updateBelt(belt, world, 0, 0);

        // In the current simplified model, if the next tile is not a conveyor (or other handler),
        // the item effectively "falls off" or is stuck. The `updateBelt` function's `successfullyMovedOffBelt`
        // will be false if `nextTile` is not a conveyor.
        expect(belt.items[0]).toEqual(itemIron); // Item remains on the belt, as it couldn't transfer.
                                                // Or, if we model "falling off", it would be null.
                                                // Current `updateBelt` keeps item on belt if transfer fails.
    });
    
    test('updateBelt should move items along belt and then transfer last item', () => {
        // Setup: Belt1 (0,0) -> Belt2 (1,0). Belt1 has 2 slots.
        const belt1 = createConveyorBelt(Direction.RIGHT, 1, 2); // (0,0)
        world.setTile(0, 0, belt1);
        const belt2 = createConveyorBelt(Direction.RIGHT, 1, 1); // (1,0)
        world.setTile(1, 0, belt2);

        belt1.items[0] = itemIron; // Item A at start of belt1

        // Tick 1: Item A moves from slot 0 to slot 1 of belt1
        updateBelt(belt1, world, 0, 0);
        expect(belt1.items[0]).toBeNull();
        expect(belt1.items[1]).toEqual(itemIron);
        expect(belt2.items[0]).toBeNull(); // Belt2 still empty

        // Tick 2: Item A (at end of belt1) moves to belt2
        updateBelt(belt1, world, 0, 0);
        expect(belt1.items[1]).toBeNull();
        expect(belt2.items[0]).toEqual(itemIron);
    });
});
