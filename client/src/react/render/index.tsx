import { useEffect, useRef } from 'react';
import { Box } from '@chakra-ui/react';
import GameSystem from '../../Game/system';
import Game from '../../Game';
import Camera from '../../Game/render/Camera';
import Renderer from '../../Game/render/Renderer';

// Create canvas here and pass it to GameSystem for hot reload
const canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.width = '100%';
canvas.style.height = '100%';
document.body.appendChild(canvas);

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  Camera.get().aspect = canvas.width / canvas.height;
  Camera.get().updateProjectionMatrix();

  Renderer.get().setSize(canvas.width, canvas.height);
})

new GameSystem(canvas);

new Game();
GameSystem.get().loop();

function GameRender() {
  const canvasFatherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (canvasFatherRef.current) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      
      // Hot reload prevent multiple canvas
      if (canvasFatherRef.current.firstElementChild) {
        canvasFatherRef.current.innerHTML = '';
      }

      canvas.className = canvasFatherRef.current.className;
      canvasFatherRef.current.appendChild(canvas);
    }
  }, [canvasFatherRef]);

  return <Box ref={canvasFatherRef} />;
}

export default GameRender;
