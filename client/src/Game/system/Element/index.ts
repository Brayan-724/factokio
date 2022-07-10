import type { Mesh } from 'three';
import { onFrame } from '../../render/mainLoop';
import { Coords3D } from '../Coords3D';

export default class GameElement {
  mesh: Mesh | null = null;

  constructor() {}

  // Life cycle
  onStart(): void | Mesh {
    onFrame(() => {
      this.onFrame();
    });
  }

  onFrame() {}

  // Mesh interaction
  setPosition(position: Coords3D) {
    if (!this.mesh) return;

    this.mesh.position.x = position.x;
    this.mesh.position.y = position.y;
    this.mesh.position.z = position.z;
  }

  setRotation(rotation: Coords3D) {
    if (!this.mesh) return;

    this.mesh.rotation.x = rotation.x;
    this.mesh.rotation.y = rotation.y;
    this.mesh.rotation.z = rotation.z;
  }

  rotate(rotation: Coords3D) {
    if (!this.mesh) return;

    this.mesh.rotateX(rotation.x);
    this.mesh.rotateY(rotation.y);
    this.mesh.rotateZ(rotation.z);
  }

  translate(translation: Coords3D) {
    if (!this.mesh) return;

    this.mesh.translateX(translation.x);
    this.mesh.translateY(translation.y);
    this.mesh.translateZ(translation.z);
  }
}
