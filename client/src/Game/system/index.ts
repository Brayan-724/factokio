import mainLoop, { clearAll, onFrame } from '../render/mainLoop';
import GameElement from './Element';
import Scene from '../render/Scene';
import Camera from '../render/Camera';
import Renderer from '../render/Renderer';
import InputManager from '../utils/managers/InputManager';
import singleton from '../utils/factory/singleton';

const GameSystem = singleton(
  class GameSystem {
    elements: GameElement[] = [];

    #queueElements: GameElement[] = [];

    constructor(canvas: HTMLCanvasElement) {
      new InputManager();
      InputManager.get().init();

      Camera.set();
      Scene.set();
      Renderer.set(canvas);

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      Camera.get().aspect = canvas.width / canvas.height;
      Camera.get().updateProjectionMatrix();

      Renderer.get().setSize(canvas.width, canvas.height);

      Camera.get().position.z = 5;

      clearAll('__GameSystem__');
    }

    reset(canvas: HTMLCanvasElement) {
      Camera.set();
      Scene.set();
      Renderer.set(canvas);

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      Camera.get().aspect = canvas.width / canvas.height;
      Camera.get().updateProjectionMatrix();

      Renderer.get().setSize(canvas.width, canvas.height);


      Camera.get().position.z = 5;
    }

    addElement(element: GameElement) {
      this.#queueElements.push(element);
    }

    loop() {
      onFrame(() => {
        if (this.#queueElements.length > 0) {
          for (let element of this.#queueElements) {
            this.elements.push(element);
            const maybeMesh = element.onStart();

            if (maybeMesh) {
              element.mesh = maybeMesh;
              Scene.get().add(maybeMesh);
            }
          }

          this.#queueElements = [];
        }
      }, '__GameSystem__');

      mainLoop();
    }
  },
);

export default GameSystem;
