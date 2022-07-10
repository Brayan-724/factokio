import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import threeSingleton from '../utils/factory/threeSingleton';

const Renderer = threeSingleton<WebGLRenderer>((canvas: HTMLCanvasElement) => {
  const current = new WebGLRenderer({ canvas });
  current.setPixelRatio(window.devicePixelRatio);
  current.setSize(canvas.width, canvas.height);
  current.setClearColor(0x000000, 1);

  return current;
}, 'Renderer');

export default Renderer;
