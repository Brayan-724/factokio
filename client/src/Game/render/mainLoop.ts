import Renderer from './Renderer';
import Scene, { clearScene } from './Scene';
import Camera from './Camera';

export type FrameListener = (delta: number) => void;
export type FrameListenerWithTag = { listener: FrameListener; tag: string };

const frameListenersBeforeRender: FrameListenerWithTag[] = [];
const frameListenersAfterRender: FrameListenerWithTag[] = [];

function factoryClear(list: FrameListenerWithTag[], tag?: string) {
  for (const index in list) {
    if (Object.prototype.hasOwnProperty.call(list, index)) {
      if (typeof tag === 'string') {
        if (list[index].tag === tag) {
          delete list[index];
        }
      } else {
        delete list[index];
      }
    }
  }
}

export function clearAll(tag?: string) {
  factoryClear(frameListenersBeforeRender, tag);
  factoryClear(frameListenersAfterRender, tag);
}

function factoryOnFrame(list: FrameListenerWithTag[]) {
  return function (listener: FrameListener, tag: string = 'default') {
    const index = list.findIndex(
      listenerWithTag =>
        listenerWithTag && listenerWithTag.listener === listener,
    );

    if (index === -1) {
      list.push({ listener, tag });
    } else {
      list[index].tag = tag;
    }
  };
}

function factoryOffFrame(list: FrameListenerWithTag[]) {
  return function (listener: FrameListener) {
    const index = list.findIndex(
      listenerWithTag =>
        listenerWithTag && listenerWithTag.listener === listener,
    );

    if (index !== -1) {
      delete list[index];
    }
  };
}

export const onFrame = factoryOnFrame(frameListenersBeforeRender);
export const offFrame = factoryOffFrame(frameListenersBeforeRender);

export const onFrameBefore = onFrame;
export const offFrameBefore = offFrame;

export const onFrameAfter = factoryOnFrame(frameListenersAfterRender);
export const offFrameAfter = factoryOffFrame(frameListenersAfterRender);

// Save interval timer id for cleanup
let lastTimer: number | undefined;

export function mainLoop(fps: number = 30) {
  // Clear last interval timer
  if (lastTimer) {
    clearInterval(lastTimer);
  }

  clearScene();

  // Last render time (Just for delta)
  let lastTime = Date.now();

  // Render loop
  lastTimer = setInterval(() => {
    const deltaTime = Date.now() - lastTime;

    frameListenersBeforeRender.forEach(listener =>
      listener.listener(deltaTime),
    );

    Renderer.get().render(Scene.get(), Camera.get());

    frameListenersAfterRender.forEach(listener => listener.listener(deltaTime));

    lastTime = Date.now();
  }, 1000 / fps);
}

export default mainLoop;
