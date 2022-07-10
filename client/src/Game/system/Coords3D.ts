import { Vector3 } from 'three/src/math/Vector3';

export class Coords3D extends Vector3 {
  constructor(x: number = 0, y: number = 0, z: number = 0) {
    super(x, y, z);
  }

  static from(coords: Coords3D): Coords3D;
  static from(coords: number[]): Coords3D;
  static from(coords: { x?: number; y?: number; z?: number }): Coords3D;
  static from(
    coords: Coords3D | number[] | { x?: number; y?: number; z?: number },
  ): Coords3D {
    if (coords instanceof Coords3D) {
      return coords.clone();
    }

    if (Array.isArray(coords)) {
      return new Coords3D(coords[0], coords[1], coords[2]);
    }

    return new Coords3D(coords.x, coords.y, coords.z);
  }
}
