import { BoxGeometry, type Material, MeshNormalMaterial, Mesh } from 'three';
import GameElement from '.';
import { Coords3D } from '../Coords3D';

export default class Box extends GameElement {
  #material: Material = new MeshNormalMaterial();

  constructor(public position: Coords3D, public size: Coords3D) {
    super();
  }

  setMaterial(material: Material) {
    this.#material = material;
  }

  getMaterial(): Material {
    return this.#material;
  }

  onStart(): Mesh {
    const geometry = new BoxGeometry(this.size.x, this.size.y);
    const mesh = new Mesh(geometry, this.getMaterial());

    mesh.position.set(this.position.x, this.position.y, this.position.z);

    super.onStart();

    return mesh;
  }
}
