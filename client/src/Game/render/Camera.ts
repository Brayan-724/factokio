import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import threeSingleton from '../utils/factory/threeSingleton';

const Camera = threeSingleton<PerspectiveCamera>(
  () =>
    new PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    ),
  'Camera',
);

export default Camera;
