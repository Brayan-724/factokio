import { Mesh, BoxGeometry, MeshPhongMaterial, MeshBasicMaterial } from 'three';
import Camera from '../render/Camera';
import { Coords3D } from '../system/Coords3D';
import GameElement from '../system/Element';
import singleton from '../utils/factory/singleton';

const Player = singleton(
  class Player extends GameElement {
    constructor() {
      super();
    }

    onStart(): Mesh {
      const geometry = new BoxGeometry();
      const material = new MeshPhongMaterial({
        // shininess: 30,
        color: 0x049ef4,
        emissive: 0x049ef4,
      });

      const mesh = new Mesh(geometry, material);
      mesh.add(Camera.get())
      Camera.get().rotation.set(0, 0.25, 0);
      Camera.get().position.set(0, -1, 2);

      super.onStart();

      mesh.position.set(0, 0, 1);

      return mesh;
    }

    onFrame(): void {
    }
  },
);

export type PlayerType = InstanceType<typeof Player>;
export default Player;
