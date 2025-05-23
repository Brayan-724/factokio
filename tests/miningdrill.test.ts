import { World } from '../src/world';
import { Tile, TileType } from '../src/tiletypes';
import { MiningDrill, createMiningDrill, updateMiningDrill, checkMiningDrillResource, tryTakeItemFromDrillOutput } from '../src/miningdrill';
import { Item } from '../src/conveyor';

describe('MiningDrill', () => {
    let drill: MiningDrill;
    let world: World;
    const itemIronOre: Item = { name: 'iron_ore' };
    const drillX = 2, drillY = 2;

    beforeEach(() => {
        world = new World(5, 5);
        // Create drill and place it in the world.
        // The resource it's on will be set by world.setTile based on the underlying tile's 'resource' property.
        drill = createMiningDrill(drillX, drillY, 5); // Mining speed 5 ticks
    });

    test('should create a mining drill with default properties', () => {
        expect(drill.type).toBe(TileType.MINING_DRILL);
        expect(drill.resourceType).toBeNull();
        expect(drill.miningSpeed).toBe(5);
        expect(drill.miningProgress).toBe(0);
        expect(drill.outputBuffer).toBeNull();
        expect(drill.isActive).toBe(false);
        expect(drill.x).toBe(drillX);
        expect(drill.y).toBe(drillY);
    });

    test('checkMiningDrillResource should activate drill on a valid resource tile', () => {
        // Simulate placing the drill on an iron ore patch.
        // The world.setTile method is responsible for this connection.
        // Here, we manually mimic that by setting the 'resource' on the drill's tile object itself
        // before calling checkMiningDrillResource, as if world.setTile had done it.
        const oreTile: Tile = { type: TileType.IRON_ORE, walkable: true, resource: 'iron_ore' };
        world.setTile(drillX, drillY, oreTile); // Place the resource tile first

        const drillToTest = createMiningDrill(drillX, drillY);
        // In the actual game, world.setTile(drillX, drillY, drillToTest) would happen.
        // And world.setTile would assign drillToTest.resource = oreTile.resource
        // For this isolated test of checkMiningDrillResource, we set it directly:
        drillToTest.resource = oreTile.resource; // Manually set what world.setTile would do.
        
        checkMiningDrillResource(drillToTest, world); // Call the function being tested.

        expect(drillToTest.isActive).toBe(true);
        expect(drillToTest.resourceType).toBe('iron_ore');
    });
    
    test('checkMiningDrillResource should not activate drill on a non-resource tile', () => {
        const grassTile: Tile = { type: TileType.GRASS, walkable: true };
        world.setTile(drillX, drillY, grassTile); // Underlying tile is GRASS

        drill.resource = grassTile.resource; // which is undefined
        checkMiningDrillResource(drill, world);

        expect(drill.isActive).toBe(false);
        expect(drill.resourceType).toBeNull();
    });

    test('updateMiningDrill should not progress if not active', () => {
        drill.isActive = false; // Ensure it's inactive
        updateMiningDrill(drill, world);
        expect(drill.miningProgress).toBe(0);
    });

    test('updateMiningDrill should progress if active and output buffer empty', () => {
        drill.isActive = true;
        drill.resourceType = 'iron_ore'; // Manually set for test
        updateMiningDrill(drill, world);
        expect(drill.miningProgress).toBe(1);
    });

    test('updateMiningDrill should produce item when progress completes', () => {
        drill.isActive = true;
        drill.resourceType = 'iron_ore';
        drill.miningSpeed = 3; // For faster testing

        for (let i = 0; i < 3; i++) {
            updateMiningDrill(drill, world);
        }

        expect(drill.miningProgress).toBe(0); // Resets
        expect(drill.outputBuffer).toEqual({ name: 'iron_ore' });
    });

    test('updateMiningDrill should not progress if output buffer is full', () => {
        drill.isActive = true;
        drill.resourceType = 'iron_ore';
        drill.outputBuffer = itemIronOre; // Buffer is full

        updateMiningDrill(drill, world);
        expect(drill.miningProgress).toBe(0);
    });
    
    test('tryTakeItemFromDrillOutput should return item and clear buffer', () => {
        drill.outputBuffer = itemIronOre;
        const item = tryTakeItemFromDrillOutput(drill);
        expect(item).toEqual(itemIronOre);
        expect(drill.outputBuffer).toBeNull();
        expect(drill.miningProgress).toBe(0); // Should reset progress
    });

    test('tryTakeItemFromDrillOutput should return null if buffer is empty', () => {
        const item = tryTakeItemFromDrillOutput(drill);
        expect(item).toBeNull();
    });

    // Test to simulate the world's role in setting the drill's resource property
    // This is more of an integration check conceptually.
    test('drill placed on resource by world.setTile should become active', () => {
        const oreResourceName = 'gold_ore';
        // 1. Define the ground tile as a resource patch
        const underlyingOreTile: Tile = { type: TileType.STONE, walkable: true, resource: oreResourceName };
        world.setTile(1, 1, underlyingOreTile);

        // 2. Create a new drill instance (without resource initially)
        const newDrill = world.createMiningDrill(1, 1, 10); // world.createMiningDrill doesn't automatically link resource

        // 3. Manually assign the resource name as world.setTile would if placing on a known resource patch
        // This is the crucial step that the actual game logic in world.setTile handles via `tile.resource = underlyingTile.resource`
        // or by passing it to createMiningDrill like `world.createMiningDrill(x,y,speed, underlyingTile.resource)`
        // For this test, we will modify the drill object before setting it, simulating the world's knowledge.
        newDrill.resource = oreResourceName; // This simulates the world knowing the drill is on a resource.

        // 4. Place the drill. world.setTile will call checkMiningDrillResource.
        world.setTile(1, 1, newDrill);
        
        const placedDrill = world.getTile(1,1) as MiningDrill;
        expect(placedDrill.type).toBe(TileType.MINING_DRILL);
        expect(placedDrill.isActive).toBe(true);
        expect(placedDrill.resourceType).toBe(oreResourceName);
    });
});
