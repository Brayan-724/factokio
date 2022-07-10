import { Scene as ThreeScene } from 'three/src/scenes/Scene';
import threeSingleton from '../utils/factory/threeSingleton';

const Scene = threeSingleton<ThreeScene>(() => new ThreeScene(), 'Scene');

export default Scene;

export function clearScene() {
    Scene.get().children.forEach(child => {
        Scene.get().remove(child);
    })
}