import { useEffect, useState } from 'react';
import { useFrame } from '../hooks/useFrame';
import UIElement from './Element';

let _fps_counter = 0;

function UIFps(): JSX.Element {
  const [fps, setFps] = useState(0);

  useFrame(() => {
    _fps_counter++;
  });

  useEffect(() => {
    setTimeout(() => {
      setFps(_fps_counter);
      _fps_counter = 0;
    }, 1000);
  }, []);

  return (
    <UIElement as="span" top="2" left="2" fontSize="lg">
      FPS: {fps}
    </UIElement>
  );
}

export default UIFps;
