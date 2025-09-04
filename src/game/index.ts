import Phaser from 'phaser';
import { CityScene } from '@/game/CityScene';

export function createGame(containerId: string): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: containerId,
    backgroundColor: '#0e0f12',
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: window.innerWidth,
      height: window.innerHeight,
    },
    physics: { default: 'arcade', arcade: { debug: false } },
    scene: [CityScene],
  };

  return new Phaser.Game(config);
}


