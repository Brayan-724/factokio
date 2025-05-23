import { World } from './world.js';
import { Renderer } from './renderer.js';
import { Tile, TileType } from './tiletypes.js'; // TileType needed for selection
import { Direction as ConveyorDirection } from './conveyor.js';
import { InserterDirection } from './inserter.js';
import { Recipe } from './assembler.js';

// --- Global state for player interaction ---
let selectedEntityType: TileType | null = null;
let selectedConveyorDirection: ConveyorDirection = ConveyorDirection.RIGHT;
let selectedInserterDirection: InserterDirection = InserterDirection.RIGHT;
let mouseTileX: number | null = null;
let mouseTileY: number | null = null;

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    const conveyorDirectionSelect = document.getElementById('conveyor-direction') as HTMLSelectElement;
    const inserterDirectionSelect = document.getElementById('inserter-direction') as HTMLSelectElement;
    const conveyorControls = document.getElementById('conveyor-direction-controls') as HTMLDivElement;
    const inserterControls = document.getElementById('inserter-direction-controls') as HTMLDivElement;

    const entityButtons = [
        document.getElementById('select-conveyor'),
        document.getElementById('select-inserter'),
        document.getElementById('select-assembler'),
        document.getElementById('select-mining-drill'),
        document.getElementById('select-none')
    ];

    if (!canvas || !conveyorDirectionSelect || !inserterDirectionSelect || !conveyorControls || !inserterControls || entityButtons.some(b => !b)) {
        console.error("One or more UI elements not found!");
        return;
    }

    const worldWidth = 30;
    const worldHeight = 20;
    const tileSize = 24; // Slightly larger for better visibility

    const world = new World(worldWidth, worldHeight);
    const renderer = new Renderer(world, canvas, tileSize);

    // --- Clear initial test scenario ---
    // The world is now initialized empty, player will place entities.

    // --- UI Event Listeners ---
    function updateSelectedButtonUI(selectedBtnId: string | null) {
        entityButtons.forEach(btn => {
            if (btn) {
                btn.classList.remove('selected');
                if (btn.id === selectedBtnId) {
                    btn.classList.add('selected');
                }
            }
        });
    }

    entityButtons.forEach(button => {
        if (button) {
            button.addEventListener('click', () => {
                const entityTypeStr = button.dataset.entity;
                conveyorControls.style.display = 'none';
                inserterControls.style.display = 'none';
                updateSelectedButtonUI(button.id);

                if (entityTypeStr === "NONE" || !entityTypeStr) {
                    selectedEntityType = null;
                    console.log("Selection cleared");
                } else {
                    selectedEntityType = TileType[entityTypeStr as keyof typeof TileType];
                    console.log(`Selected entity type: ${TileType[selectedEntityType!]}`);
                    if (selectedEntityType === TileType.CONVEYOR_BELT) {
                        conveyorControls.style.display = 'block';
                    } else if (selectedEntityType === TileType.INSERTER) {
                        inserterControls.style.display = 'block';
                    }
                }
            });
        }
    });

    conveyorDirectionSelect.addEventListener('change', (e) => {
        selectedConveyorDirection = ConveyorDirection[(e.target as HTMLSelectElement).value as keyof typeof ConveyorDirection];
        console.log(`Selected conveyor direction: ${ConveyorDirection[selectedConveyorDirection]}`);
    });

    inserterDirectionSelect.addEventListener('change', (e) => {
        selectedInserterDirection = InserterDirection[(e.target as HTMLSelectElement).value as keyof typeof InserterDirection];
        console.log(`Selected inserter direction: ${InserterDirection[selectedInserterDirection]}`);
    });

    // Initialize default directions
    selectedConveyorDirection = ConveyorDirection[conveyorDirectionSelect.value as keyof typeof ConveyorDirection];
    selectedInserterDirection = InserterDirection[inserterDirectionSelect.value as keyof typeof InserterDirection];
    updateSelectedButtonUI(null); // No button selected by default


    // --- Canvas Click Listener for Placing Entities ---
    canvas.addEventListener('click', (event) => {
        if (selectedEntityType === null) {
            console.log("No entity selected to place.");
            return;
        }

        const rect = canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        const tileX = Math.floor(clickX / tileSize);
        const tileY = Math.floor(clickY / tileSize);

        console.log(`Attempting to place ${TileType[selectedEntityType]} at (${tileX}, ${tileY})`);

        let newEntity: Tile | null = null;
        const currentTile = world.getTile(tileX, tileY);

        switch (selectedEntityType) {
            case TileType.CONVEYOR_BELT:
                newEntity = world.createConveyorBelt(selectedConveyorDirection);
                break;
            case TileType.INSERTER:
                newEntity = world.createInserter(tileX, tileY, selectedInserterDirection);
                break;
            case TileType.ASSEMBLER:
                newEntity = world.createAssembler();
                break;
            case TileType.MINING_DRILL:
                // Drills need to know the resource of the tile they are on.
                // The 'resource' property should come from the tile being replaced.
                const resourceName = currentTile?.resource;
                if (resourceName) {
                    newEntity = world.createMiningDrill(tileX, tileY, 120, resourceName);
                } else {
                    console.warn(`Cannot place Mining Drill: No resource at (${tileX}, ${tileY})`);
                    // Optionally, provide feedback to the player (e.g. change cursor, show message)
                }
                break;
        }

        if (newEntity) {
            world.setTile(tileX, tileY, newEntity);
            console.log(`Placed ${TileType[newEntity.type]} at (${tileX}, ${tileY})`);
            // No need to call render here, game loop does it.
        } else if (selectedEntityType === TileType.MINING_DRILL && !currentTile?.resource) {
            // Message already logged
        } else {
            console.error(`Failed to create entity of type ${TileType[selectedEntityType!]} for placement.`);
        }
    });


    // --- Game Loop ---
    let gameTick = 0;
    function gameLoop() {
        gameTick++;
        // console.log(`Game Tick: ${gameTick}`);

        // Update world state
        world.update();

        // Render the world
        renderer.render();

        requestAnimationFrame(gameLoop); // Use rAF for smoother animations
    }

    // Start the game loop
    console.log("Starting game loop...");
    gameLoop();

    // Example: Manually spawn an item for testing after a delay
    // setTimeout(() => {
    //     console.log("Spawning test item on belt1 (3,2)");
    //     world.spawnItemAt({ name: 'iron_ore' }, 3, 2);
    // }, 2000);

    // --- Mouse Move Listener for Ghost Preview ---
    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        const hoverX = event.clientX - rect.left;
        const hoverY = event.clientY - rect.top;
        mouseTileX = Math.floor(hoverX / tileSize);
        mouseTileY = Math.floor(hoverY / tileSize);
        // No direct render call here, game loop handles it.
    });

    canvas.addEventListener('mouseleave', () => {
        mouseTileX = null;
        mouseTileY = null;
        // No direct render call here.
    });

    // Initial render
    // Pass initial null values for mouse position and selection to renderer
    renderer.render(null, null, null, null, null); 
});
