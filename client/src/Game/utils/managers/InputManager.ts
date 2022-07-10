import singleton from '../factory/singleton';

export enum Keys {
  ARROWS_LEFT = 'ArrowLeft',
  ARROWS_RIGHT = 'ArrowRight',
  ARROWS_UP = 'ArrowUp',
  ARROWS_DOWN = 'ArrowDown',

  SPACE = 'Space',
  ENTER = 'Enter',
  ESCAPE = 'Escape',

  //#region letters
  A = 'KeyA',
  B = 'KeyB',
  C = 'KeyC',
  D = 'KeyD',
  E = 'KeyE',
  F = 'KeyF',
  G = 'KeyG',
  H = 'KeyH',
  I = 'KeyI',
  J = 'KeyJ',
  K = 'KeyK',
  L = 'KeyL',
  M = 'KeyM',
  N = 'KeyN',
  O = 'KeyO',
  P = 'KeyP',
  Q = 'KeyQ',
  R = 'KeyR',
  S = 'KeyS',
  T = 'KeyT',
  U = 'KeyU',
  V = 'KeyV',
  W = 'KeyW',
  X = 'KeyX',
  Y = 'KeyY',
  Z = 'KeyZ',
  //#endregion

  //#region numbers
  NUM_0 = 'Digit0',
  NUM_1 = 'Digit1',
  NUM_2 = 'Digit2',
  NUM_3 = 'Digit3',
  NUM_4 = 'Digit4',
  NUM_5 = 'Digit5',
  NUM_6 = 'Digit6',
  NUM_7 = 'Digit7',
  NUM_8 = 'Digit8',
  NUM_9 = 'Digit9',
  //#endregion
}

class KeyboardManager {
  keys: Keys[] = [
    Keys.ARROWS_LEFT,
    Keys.ARROWS_RIGHT,
    Keys.ARROWS_UP,
    Keys.ARROWS_DOWN,

    Keys.SPACE,
    Keys.ENTER,
    Keys.ESCAPE,

    //#region letters
    Keys.A,
    Keys.B,
    Keys.C,
    Keys.D,
    Keys.E,
    Keys.F,
    Keys.G,
    Keys.H,
    Keys.I,
    Keys.J,
    Keys.K,
    Keys.L,
    Keys.M,
    Keys.N,
    Keys.O,
    Keys.P,
    Keys.Q,
    Keys.R,
    Keys.S,
    Keys.T,
    Keys.U,
    Keys.V,
    Keys.W,
    Keys.X,
    Keys.Y,
    Keys.Z,
    //#endregion
  
    //#region numbers
    Keys.NUM_0,
    Keys.NUM_1,
    Keys.NUM_2,
    Keys.NUM_3,
    Keys.NUM_4,
    Keys.NUM_5,
    Keys.NUM_6,
    Keys.NUM_7,
    Keys.NUM_8,
    Keys.NUM_9,
    //#endregion
  ];
  pressed: Keys[] = [];

  constructor() {}

  init(): void {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('keyup', this.handleKeyUp.bind(this));
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.repeat) return;

    // Just accept mapped keys
    if (!this.keys.includes(event.code as Keys)) return;
    event.preventDefault();

    // If key is already pressed, ignore
    if (this.pressed.includes(event.code as Keys)) {
      return;
    }

    this.pressed.push(event.code as Keys);
  }

  handleKeyUp(event: KeyboardEvent): void {
    if (event.repeat) return;
    
    // Just accept mapped keys
    if(!this.keys.includes(event.code as Keys)) return;
    event.preventDefault();

    // Get index of key
    const index = this.pressed.indexOf(event.code as Keys);

    // If key was not pressed, ignore
    if(index === -1) return;

    this.pressed.splice(index, 1);
  }

  isPressed(key: Keys): boolean {
    return this.pressed.includes(key);
  }
}

const InputManager = singleton(
  class InputManager {
    private keyboardManager: KeyboardManager;

    constructor() {
      this.keyboardManager = new KeyboardManager();
    }

    init(): void {
      this.keyboardManager.init();
    }

    destroy(): void {
      this.keyboardManager.destroy();
    }

    isKeyPressed(key: Keys): boolean {
      return this.keyboardManager.isPressed(key);
    }
  },
);

export default InputManager;
