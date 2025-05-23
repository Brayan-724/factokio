import { Tile, TileType } from './tiletypes';
import { ConveyorBelt, updateBelt, createConveyorBelt, Direction as ConveyorDirection, Item } from './conveyor';
import { Inserter, updateInserter, createInserter, InserterDirection } from './inserter';
import { Assembler, updateAssembler, createAssembler, setRecipe as setAssemblerRecipe, Recipe } from './assembler';
import { MiningDrill, updateMiningDrill, createMiningDrill as createDrill, checkMiningDrillResource } from './miningdrill'; // Added

export class World {
    private tiles: Tile[][];
    private width: number;
    private height: number;
    // Added MiningDrill to active entities
    private activeEntities: (ConveyorBelt | Inserter | Assembler | MiningDrill)[] = []; 

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.tiles = this.initializeEmptyWorld();
        // this.tiles = this.generateRandomWorld(); // Keep for later if needed
    }

    private initializeEmptyWorld(): Tile[][] {
        const newWorld: Tile[][] = [];
        for (let y = 0; y < this.height; y++) {
            newWorld[y] = [];
            for (let x = 0; x < this.width; x++) {
                // Default to GRASS, or make it configurable
                newWorld[y][x] = { type: TileType.GRASS, walkable: true };
            }
        }
        return newWorld;
    }

    // Example method to manually set a tile, e.g., for placing structures
    public setTile(x: number, y: number, tile: Tile): void {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            // Remove old entity from active list if it was one
            const oldTile = this.tiles[y][x];
            const oldEntityIndex = this.activeEntities.indexOf(oldTile as any);
            if (oldEntityIndex > -1) {
                this.activeEntities.splice(oldEntityIndex, 1);
            }

            this.tiles[y][x] = tile;

            // If the new tile is an "active" entity, add it to the list
            if (tile.type === TileType.CONVEYOR_BELT ||
                tile.type === TileType.INSERTER ||
                tile.type === TileType.ASSEMBLER ||
                tile.type === TileType.MINING_DRILL) { // Added MINING_DRILL
                this.activeEntities.push(tile as any);
                (tile as any).x = x; // Store coordinates on the entity
                (tile as any).y = y;

                if (tile.type === TileType.MINING_DRILL) {
                    // When a drill is placed, its 'resource' property should be set based on the
                    // original tile it's replacing, if that tile was a resource patch.
                    // This assumes the `tile` object passed to `setTile` for a new drill
                    // might already have its `resource` field populated by whatever logic placed it.
                    // Or, we check the *old* tile at this position.
                    // Let's assume the new drill tile might have its .resource field set if it's intended for a resource.
                    // checkMiningDrillResource(tile as MiningDrill, this);
                    // More robust: the tile being *replaced* at newWorld[y][x] during setup should inform the drill.
                    // For now, the drill's own `resource` field (from Tile interface) must be set prior to this if it's on a resource.
                    // The `checkMiningDrillResource` will use this tile's own `resource` property.
                    
                    // If the tile object itself (which is the drill) has its 'resource' property set,
                    // (e.g. world.setTile(x,y, createMiningDrill(x,y, speed, "iron_ore_patch_resource_name")))
                    // then checkMiningDrillResource can use it.
                    // We need to ensure the drill.resource is correctly assigned.
                    // Let's try to get the resource from the tile it's replacing, if not already set on the drill tile.
                    // This part is tricky. The game setup needs to handle this.
                    // For now, `checkMiningDrillResource` relies on the drill object having its `resource` field (from Tile interface) set.
                    // This can be done when creating the drill object if the underlying ground is a resource.
                    checkMiningDrillResource(tile as MiningDrill, this);
                }
            }
        } else {
            console.error(`Cannot set tile outside world bounds: (${x}, ${y})`);
        }
    }


    private generateRandomWorld(): Tile[][] { // Renamed from generateWorld
        const newWorld: Tile[][] = [];
        for (let y = 0; y < this.height; y++) {
            newWorld[y] = [];
            for (let x = 0; x < this.width; x++) {
                newWorld[y][x] = this.getRandomTile(x,y); // Pass coords if needed for complex generation
            }
        }
        return newWorld;
    }

    private getRandomTile(x: number, y: number): Tile { // Added x,y params
        const randomValue = Math.random();
        if (randomValue < 0.6) {
            return { type: TileType.GRASS, walkable: true };
        } else if (randomValue < 0.8) {
            return { type: TileType.WATER, walkable: false };
        } else if (randomValue < 0.9) {
            return { type: TileType.STONE, walkable: true };
        } else {
            return { type: TileType.IRON_ORE, walkable: true, resource: 'iron' };
        }
        // Conveyors, Inserters, Assemblers will be placed manually or by specific logic, not randomly here.
    }

    public update(): void {
        // Update all active entities
        for (const entity of this.activeEntities) {
            // Need to know the entity's own coordinates for some update functions
            // One way is to store x,y on the entity object itself when it's placed (as done in setTile)
            const entityX = (entity as any).x;
            const entityY = (entity as any).y;

            switch (entity.type) {
                case TileType.CONVEYOR_BELT:
                    updateBelt(entity as ConveyorBelt, this, entityX, entityY);
                    break;
                case TileType.INSERTER:
                    updateInserter(entity as Inserter, this); // Pass world instance
                    break;
                case TileType.ASSEMBLER:
                    updateAssembler(entity as Assembler);
                    break;
                case TileType.MINING_DRILL: // Added
                    updateMiningDrill(entity as MiningDrill, this);
                    break;
            }
        }
    }


    public getTile(x: number, y: number): Tile | undefined {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.tiles[y][x];
        }
        return undefined;
    }

    // This was a temporary solution in inserter.ts, let's make it proper if needed,
    // or ensure inserters know their own coords.
    // For now, I've added x,y to the entity object in setTile.
    /*
    public getTileCoordinates(tileToFind: Tile): {x: number, y: number} | null {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.tiles[y][x] === tileToFind) {
                    return { x, y };
                }
            }
        }
        return null;
    }
    */

    public getWidth(): number {
        return this.width;
    }

    public getHeight(): number {
        return this.height;
    }

    // --- Exposing creation methods for convenience ---
    public createConveyorBelt(direction: ConveyorDirection, speed?: number, maxItems?: number): ConveyorBelt {
        return createConveyorBelt(direction, speed, maxItems);
    }

    public createInserter(x:number, y:number, direction: InserterDirection, maxCooldown?: number): Inserter {
        return createInserter(x,y,direction, maxCooldown);
    }

    public createAssembler(): Assembler {
        return createAssembler();
    }

    public setAssemblerRecipe(assembler: Assembler, recipe: Recipe): void {
        setAssemblerRecipe(assembler, recipe);
    }

    // Added for MiningDrill
    public createMiningDrill(x: number, y: number, speed?: number, resourceName?: string): MiningDrill {
        const drill = createDrill(x, y, speed);
        if (resourceName) {
            // This is how we tell the drill what it's on, linking to the Tile's 'resource' property.
            drill.resource = resourceName; 
        }
        return drill;
    }

    // Helper to directly add an item to the world (e.g. from a cheat or initial setup)
    // This is useful for testing.
    public spawnItemAt(item: Item, x: number, y: number): boolean {
        const tile = this.getTile(x,y);
        if (tile && tile.type === TileType.CONVEYOR_BELT) {
            return (tile as ConveyorBelt).items.some((slot, i, arr) => {
                if(slot === null) {
                    arr[i] = item;
                    return true;
                }
                return false;
            });
        }
        // Could extend to drop on ground, etc.
        return false;
    }
}
