import { World } from './world.js';
import { Tile, TileType } from './tiletypes.js';
import { ConveyorBelt, Direction as ConveyorDirection, Item as ConveyorItem } from './conveyor.js';
import { Inserter, InserterDirection } from './inserter.js';
import { Assembler } from './assembler.js';
import { MiningDrill } from './miningdrill.js'; // Added MiningDrill

export class Renderer {
    private world: World;
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private tileSize: number;

    constructor(world: World, canvas: HTMLCanvasElement, tileSize: number = 20) {
        this.world = world;
        this.canvas = canvas;
        this.context = canvas.getContext('2d')!;
        this.tileSize = tileSize;
        this.canvas.width = world.getWidth() * this.tileSize;
        this.canvas.height = world.getHeight() * this.tileSize;
    }

    public render(
        selectedEntityType: TileType | null = null,
        selectedConveyorDirection: ConveyorDirection | null = null,
        selectedInserterDirection: InserterDirection | null = null,
        mouseTileX: number | null = null,
        mouseTileY: number | null = null
    ): void {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clear canvas

        for (let y = 0; y < this.world.getHeight(); y++) {
            for (let x = 0; x < this.world.getWidth(); x++) {
                const tile = this.world.getTile(x, y);
                if (tile) {
                    this.drawTileBackground(x, y, tile); // Draw common background / base color
                    this.drawTileEntity(x, y, tile);    // Draw specific entity features
                }
            }
        }

        // Draw ghost entity for placement preview
        if (selectedEntityType !== null && mouseTileX !== null && mouseTileY !== null) {
            this.drawGhostEntity(
                selectedEntityType,
                selectedConveyorDirection,
                selectedInserterDirection,
                mouseTileX,
                mouseTileY
            );
        }
    }

    private drawTileBackground(x: number, y: number, tile: Tile): void {
        this.context.fillStyle = this.getBaseColorForTile(tile);
        this.context.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
        this.context.strokeStyle = '#ccc'; // Light border for all tiles
        this.context.strokeRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
    }

    private getBaseColorForTile(tile: Tile): string {
        switch (tile.type) {
            case TileType.GRASS: return 'green';
            case TileType.WATER: return 'blue';
            case TileType.STONE: return 'gray';
            case TileType.IRON_ORE: return 'darkred';
            case TileType.CONVEYOR_BELT: return '#555'; // Dark gray for belt background
            case TileType.INSERTER: return '#777'; // Medium gray for inserter base
            case TileType.ASSEMBLER: return '#4a3b3c'; // Dark brownish for assembler
            case TileType.MINING_DRILL: return '#333'; // Very dark gray for drill
            default: return 'black';
        }
    }

    private drawTileEntity(x: number, y: number, tile: Tile): void {
        const cX = x * this.tileSize;
        const cY = y * this.tileSize;

        switch (tile.type) {
            case TileType.CONVEYOR_BELT:
                this.drawConveyorBelt(cX, cY, tile as ConveyorBelt);
                break;
            case TileType.INSERTER:
                this.drawInserter(cX, cY, tile as Inserter);
                break;
            case TileType.ASSEMBLER:
                this.drawAssembler(cX, cY, tile as Assembler);
                break;
            case TileType.MINING_DRILL: // Added MiningDrill
                this.drawMiningDrill(cX, cY, tile as MiningDrill);
                break;
            // Other tile types might have specific visuals too
        }
    }

    private drawConveyorBelt(cX: number, cY: number, belt: ConveyorBelt): void {
        this.context.fillStyle = 'yellow'; // Arrow color
        const arrowSize = this.tileSize / 4;
        const centerX = cX + this.tileSize / 2;
        const centerY = cY + this.tileSize / 2;

        this.context.beginPath();
        switch (belt.direction) {
            case ConveyorDirection.UP:
                this.context.moveTo(centerX, centerY - arrowSize);
                this.context.lineTo(centerX - arrowSize, centerY);
                this.context.lineTo(centerX + arrowSize, centerY);
                break;
            case ConveyorDirection.DOWN:
                this.context.moveTo(centerX, centerY + arrowSize);
                this.context.lineTo(centerX - arrowSize, centerY);
                this.context.lineTo(centerX + arrowSize, centerY);
                break;
            case ConveyorDirection.LEFT:
                this.context.moveTo(centerX - arrowSize, centerY);
                this.context.lineTo(centerX, centerY - arrowSize);
                this.context.lineTo(centerX, centerY + arrowSize);
                break;
            case ConveyorDirection.RIGHT:
                this.context.moveTo(centerX + arrowSize, centerY);
                this.context.lineTo(centerX, centerY - arrowSize);
                this.context.lineTo(centerX, centerY + arrowSize);
                break;
        }
        this.context.closePath();
        this.context.fill();

        // Draw items on belt
        belt.items.forEach((item, index) => {
            if (item) {
                // Simple item representation: a small colored circle
                // Position items along the belt (simplified)
                const itemRadius = this.tileSize / 5;
                let itemX = cX + this.tileSize / 2;
                let itemY = cY + this.tileSize / 2;

                // This is a very basic positioning, assuming items are somewhat centered
                // A real implementation would have items moving smoothly.
                const progress = (index + 0.5) / belt.maxItems; // Distribute items along the belt segment

                if (belt.maxItems > 1) { // Only adjust if belt can hold multiple items visibly in one tile
                    switch (belt.direction) {
                        case ConveyorDirection.UP: itemY = cY + this.tileSize * (1 - progress); break;
                        case ConveyorDirection.DOWN: itemY = cY + this.tileSize * progress; break;
                        case ConveyorDirection.LEFT: itemX = cX + this.tileSize * (1 - progress); break;
                        case ConveyorDirection.RIGHT: itemX = cX + this.tileSize * progress; break;
                    }
                }

                this.context.fillStyle = this.getItemColor(item.name);
                this.context.beginPath();
                this.context.arc(itemX, itemY, itemRadius, 0, Math.PI * 2);
                this.context.fill();
            }
        });
    }

    private drawInserter(cX: number, cY: number, inserter: Inserter): void {
        const armLength = this.tileSize * 0.8;
        const armWidth = this.tileSize * 0.2;
        const baseRadius = this.tileSize * 0.3;

        // Draw base
        this.context.fillStyle = '#666'; // Darker base
        this.context.beginPath();
        this.context.arc(cX + this.tileSize / 2, cY + this.tileSize / 2, baseRadius, 0, Math.PI * 2);
        this.context.fill();

        // Draw arm
        this.context.save();
        this.context.translate(cX + this.tileSize / 2, cY + this.tileSize / 2);

        // Rotate based on pickup/dropoff or current state. For now, use main direction.
        let angle = 0;
        // The visual rotation should represent the arm swinging from pickup to dropoff.
        // This requires knowing the current state of the inserter (picking up, dropping off, idle).
        // For simplicity, we'll draw a static arm pointing towards its dropoff direction for now.
        switch (inserter.direction) {
            case InserterDirection.UP: angle = -Math.PI / 2; break;
            case InserterDirection.DOWN: angle = Math.PI / 2; break;
            case InserterDirection.LEFT: angle = Math.PI; break;
            case InserterDirection.RIGHT: angle = 0; break;
        }
        // If it's holding an item, perhaps rotate towards dropoff, otherwise towards pickup.
        // Let's make it point towards its dropoff target.
        const dX = inserter.dropoffTarget.x - (inserter as any).x; // (inserter as any).x is the inserter's own x
        const dY = inserter.dropoffTarget.y - (inserter as any).y; // (inserter as any).y is the inserter's own y
        angle = Math.atan2(dY, dX);


        this.context.rotate(angle);
        this.context.fillStyle = inserter.currentItem ? 'orange' : 'silver'; // Color changes if holding item
        this.context.fillRect(0 - armWidth / 2, -armWidth / 2, armLength, armWidth); // Centered arm base
        this.context.restore();

        // Draw item if held (simple representation)
        if (inserter.currentItem) {
            this.context.fillStyle = this.getItemColor(inserter.currentItem.name);
            this.context.beginPath();
            // Draw item at the "hand" of the inserter, considering its angle
            const handOffsetX = Math.cos(angle) * (armLength * 0.8);
            const handOffsetY = Math.sin(angle) * (armLength * 0.8);
            this.context.arc(
                cX + this.tileSize / 2 + handOffsetX,
                cY + this.tileSize / 2 + handOffsetY,
                this.tileSize / 5, 0, Math.PI * 2);
            this.context.fill();
        }
    }

    private drawAssembler(cX: number, cY: number, assembler: Assembler): void {
        this.context.fillStyle = '#b0a080'; // A lighter color for contrast
        this.context.fillRect(cX + this.tileSize * 0.1, cY + this.tileSize * 0.1, this.tileSize * 0.8, this.tileSize * 0.8);

        // Indicate activity or recipe
        if (assembler.currentRecipe) {
            this.context.fillStyle = 'lightgreen'; // Crafting progress bar
            const progressHeight = this.tileSize * 0.15;
            const progressWidth = (assembler.craftingProgress / assembler.currentRecipe.craftingTime) * this.tileSize * 0.8;
            this.context.fillRect(cX + this.tileSize * 0.1, cY + this.tileSize * 0.85 - progressHeight, progressWidth, progressHeight);

            // Show output item if ready
            if (assembler.outputBuffer) {
                this.context.fillStyle = this.getItemColor(assembler.outputBuffer.name);
                this.context.beginPath();
                this.context.arc(cX + this.tileSize / 2, cY + this.tileSize / 2, this.tileSize / 4, 0, Math.PI * 2);
                this.context.fill();
                this.context.strokeStyle = "white";
                this.context.stroke();
            }
        } else {
            this.context.fillStyle = 'red';
            this.context.font = `${this.tileSize * 0.5}px Arial`;
            this.context.textAlign = 'center';
            this.context.fillText('?', cX + this.tileSize / 2, cY + this.tileSize / 1.5);
        }
    }

    private getItemColor(itemName: string): string {
        // Basic item colors, can be expanded
        if (itemName.includes('iron_plate')) return 'slategrey';
        if (itemName.includes('gear')) return 'darkgrey';
        if (itemName.includes('iron_ore')) return 'darkred';
        if (itemName.includes('copper_plate')) return 'chocolate';
        if (itemName.includes('copper_ore')) return 'saddlebrown'; // Should match ore tile for copper
        return 'purple'; // Default for unknown items
    }

    private drawMiningDrill(cX: number, cY: number, drill: MiningDrill): void {
        // Base of the drill
        this.context.fillStyle = drill.isActive ? '#5a5a5a' : '#404040'; // Darker if inactive
        this.context.fillRect(cX + this.tileSize * 0.1, cY + this.tileSize * 0.1, this.tileSize * 0.8, this.tileSize * 0.8);

        // Drill head area
        this.context.fillStyle = '#888';
        this.context.beginPath();
        this.context.arc(cX + this.tileSize / 2, cY + this.tileSize / 2, this.tileSize * 0.3, 0, Math.PI * 2);
        this.context.fill();

        // Indicate activity / resource type
        if (drill.isActive && drill.resourceType) {
            this.context.fillStyle = this.getItemColor(drill.resourceType);
            this.context.beginPath();
            this.context.arc(cX + this.tileSize / 2, cY + this.tileSize / 2, this.tileSize * 0.15, 0, Math.PI * 2);
            this.context.fill();
        }

        // Show output item if ready
        if (drill.outputBuffer) {
            this.context.fillStyle = this.getItemColor(drill.outputBuffer.name);
            this.context.beginPath();
            this.context.rect(cX + this.tileSize * 0.3, cY + this.tileSize * 0.05, this.tileSize * 0.4, this.tileSize * 0.2);
            this.context.fill();
            this.context.strokeStyle = "white";
            this.context.stroke();
        }

        // Mining progress (small bar at the bottom)
        if (drill.isActive) {
            this.context.fillStyle = 'yellow';
            const progressHeight = this.tileSize * 0.1;
            const progressWidth = (drill.miningProgress / drill.miningSpeed) * this.tileSize * 0.8;
            this.context.fillRect(cX + this.tileSize * 0.1, cY + this.tileSize * 0.9 - progressHeight, progressWidth, progressHeight);
        }
    }

    private drawGhostEntity(
        entityType: TileType,
        conveyorDirection: ConveyorDirection | null,
        inserterDirection: InserterDirection | null,
        tileX: number,
        tileY: number
    ): void {
        const cX = tileX * this.tileSize;
        const cY = tileY * this.tileSize;
        this.context.globalAlpha = 0.5; // Semi-transparent for ghost

        let isValidPlacement = true; // Assume valid by default

        switch (entityType) {
            case TileType.CONVEYOR_BELT: {
                const ghostTile: ConveyorBelt = { type: entityType, direction: conveyorDirection || ConveyorDirection.RIGHT, items: [], maxItems: 1, walkable: true, speed: 2 };
                this.context.fillStyle = this.getBaseColorForTile(ghostTile);
                this.context.fillRect(cX, cY, this.tileSize, this.tileSize);
                this.drawConveyorBelt(cX, cY, ghostTile);
                break;
            }
            case TileType.INSERTER:
                // For Inserter ghost, we need its own future coords for arm rendering if it depends on them
                // The createInserter function sets pickup/dropoff based on its own (tileX, tileY) and direction
                // So, we can construct a temporary inserter object for rendering.
                const tempInserter: Inserter = { // Partial<Inserter>
                    type: TileType.INSERTER,
                    direction: inserterDirection ?? InserterDirection.RIGHT,
                    pickupTarget: { x: 0, y: 0 }, // Will be recalculated by drawInserter logic if needed or use dummy
                    dropoffTarget: { x: 0, y: 0 },
                    currentItem: null,
                    x: tileX, // Pass current mouse tile coords
                    y: tileY,
                    walkable: false,
                    cooldown: 2,
                    maxCooldown: 3
                };
                // Adjust pickup/dropoff for visualization if drawInserter uses them relative to inserter's own x/y
                switch (tempInserter.direction) {
                    case InserterDirection.UP: tempInserter.dropoffTarget = { x: tileX, y: tileY - 1 }; break;
                    case InserterDirection.DOWN: tempInserter.dropoffTarget = { x: tileX, y: tileY + 1 }; break;
                    case InserterDirection.LEFT: tempInserter.dropoffTarget = { x: tileX - 1, y: tileY }; break;
                    case InserterDirection.RIGHT: tempInserter.dropoffTarget = { x: tileX + 1, y: tileY }; break;
                }

                this.context.fillStyle = this.getBaseColorForTile(tempInserter);
                this.context.fillRect(cX, cY, this.tileSize, this.tileSize);
                this.drawInserter(cX, cY, tempInserter);
                break;
            case TileType.ASSEMBLER: {
                const ghostTile: Assembler = { type: entityType, currentRecipe: null, craftingProgress: 0, inputBuffer: new Map(), outputBuffer: null, walkable: false };
                this.context.fillStyle = this.getBaseColorForTile(ghostTile);
                this.context.fillRect(cX, cY, this.tileSize, this.tileSize);
                this.drawAssembler(cX, cY, ghostTile);
                break;
            }
            case TileType.MINING_DRILL: {
                const targetTile = this.world.getTile(tileX, tileY);
                isValidPlacement = !!(targetTile && targetTile.resource);
                const ghostTile: MiningDrill = { type: entityType, isActive: isValidPlacement, resourceType: targetTile?.resource || null, miningProgress: 0, outputBuffer: null, miningSpeed: 100, walkable: false };

                this.context.fillStyle = isValidPlacement ? this.getBaseColorForTile(ghostTile as Tile) : 'rgba(255,0,0,0.7)'; // Red if invalid
                if (!isValidPlacement && this.getBaseColorForTile(ghostTile as Tile) === 'rgba(255,0,0,0.7)') { // if base color is also red make it more visible
                    this.context.fillStyle = 'rgba(255,100,100,0.7)';
                } else if (isValidPlacement) {
                    this.context.fillStyle = this.getBaseColorForTile(ghostTile as Tile);
                }


                this.context.fillRect(cX, cY, this.tileSize, this.tileSize);
                this.drawMiningDrill(cX, cY, ghostTile as MiningDrill);
                break;
            }
            default: // GRASS, WATER, STONE, IRON_ORE etc. are not placeable entities via this UI
                this.context.globalAlpha = 1; // Reset alpha
                return;
        }

        // Draw border for ghost to indicate validity (optional, color already shows it)
        // this.context.strokeStyle = isValidPlacement ? 'rgba(0,255,0,0.8)' : 'rgba(255,0,0,0.8)';
        // this.context.strokeRect(cX, cY, this.tileSize, this.tileSize);

        this.context.globalAlpha = 1; // Reset alpha
    }
}
