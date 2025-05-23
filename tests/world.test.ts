import { World } from '../src/world';
import { TileType } from '../src/tiletypes';
import { Assembler, createAssembler } from '../src/assembler'; // For testing active entities

describe('World', () => {
    let world: World;
    const width = 10;
    const height = 8;

    beforeEach(() => {
        world = new World(width, height);
    });

    test('should create a world with correct dimensions', () => {
        expect(world.getWidth()).toBe(width);
        expect(world.getHeight()).toBe(height);
    });

    test('should initialize with default GRASS tiles', () => {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const tile = world.getTile(x, y);
                expect(tile).toBeDefined();
                expect(tile?.type).toBe(TileType.GRASS);
                expect(tile?.walkable).toBe(true);
            }
        }
    });

    test('getTile should return undefined for out-of-bounds coordinates', () => {
        expect(world.getTile(-1, 0)).toBeUndefined();
        expect(world.getTile(0, -1)).toBeUndefined();
        expect(world.getTile(width, 0)).toBeUndefined();
        expect(world.getTile(0, height)).toBeUndefined();
    });

    test('setTile should place a tile correctly and getTile should retrieve it', () => {
        const testTile = { type: TileType.STONE, walkable: true };
        world.setTile(2, 3, testTile);
        const retrievedTile = world.getTile(2, 3);
        expect(retrievedTile).toEqual(testTile);
    });

    test('setTile should add active entities (like Assembler) to activeEntities list', () => {
        const assembler = createAssembler();
        // Initially, activeEntities might be empty or contain entities from beforeEach if any were set.
        // For this test, let's ensure it's clean or account for previous state if necessary.
        // Since world is new in beforeEach, activeEntities should be empty.
        expect((world as any).activeEntities.length).toBe(0); 

        world.setTile(1, 1, assembler);
        expect((world as any).activeEntities.length).toBe(1);
        expect((world as any).activeEntities[0]).toBe(assembler);
        expect((assembler as any).x).toBe(1); // Check if coordinates are set on the entity
        expect((assembler as any).y).toBe(1);
    });
    
    test('setTile should replace an existing tile and update activeEntities if necessary', () => {
        const assembler1 = createAssembler();
        world.setTile(1, 1, assembler1);
        expect((world as any).activeEntities.length).toBe(1);

        const stoneTile = { type: TileType.STONE, walkable: true };
        world.setTile(1, 1, stoneTile); // Replace assembler with a non-active tile
        
        expect((world as any).activeEntities.length).toBe(0); // Assembler should be removed
        expect(world.getTile(1,1)?.type).toBe(TileType.STONE);

        const assembler2 = createAssembler();
        world.setTile(1,1, assembler2); // Replace stone with another assembler
        expect((world as any).activeEntities.length).toBe(1);
        expect((world as any).activeEntities[0]).toBe(assembler2);
    });


    // Test for generateRandomWorld if it were still the primary way of init.
    // Since it's initializeEmptyWorld now, we test that.
    // If generateRandomWorld was to be used, tests would be statistical or snapshot based.
});
