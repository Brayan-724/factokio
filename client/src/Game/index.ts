import singleton from './utils/factory/singleton';
import Player, { PlayerType } from './player';
import GameSystem from './system';
import Box from './system/Element/Box';
import { Coords3D } from './system/Coords3D';
import { AmbientLight, PointLight } from 'three';
import Scene from './render/Scene';

const Game = singleton(
  class Game {
    player: PlayerType = new Player();

    constructor() {
      const box1 = new Box(new Coords3D(0, 0, 0), new Coords3D(10, 10, 0.5));
      const light = new AmbientLight(0xffffff);
      const light1 = new PointLight(0xffffff, 1, 100);
      light1.position.set(0, 200, 0);

      const light2 = new PointLight(0xffffff, 1, 100);
      light2.position.set(100, 200, 100);

      const light3 = new PointLight(0xffffff, 1, 100);
      light3.position.set(-100, -200, -100);

      Scene.get().add(light);
      Scene.get().add(light1);
      Scene.get().add(light2);
      Scene.get().add(light3);
      GameSystem.get().addElement(this.player);
      GameSystem.get().addElement(box1);
    }
  },
);

export default Game;
