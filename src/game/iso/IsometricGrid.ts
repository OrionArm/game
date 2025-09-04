import Phaser from 'phaser';

export interface IsoGridConfig {
  cols: number;
  rows: number;
  tileWidth: number; // width of diamond tile
  tileHeight: number; // height of diamond tile
  offsetX?: number;
  offsetY?: number;
}

export class IsometricGrid {
  private readonly scene: Phaser.Scene;

  private readonly config: IsoGridConfig;

  constructor(scene: Phaser.Scene, config: IsoGridConfig) {
    this.scene = scene;
    this.config = { offsetX: 0, offsetY: 0, ...config };
  }

  // Convert grid (x,y) to screen (x,y) for isometric diamond
  public worldPositionFromGrid(gridX: number, gridY: number): Phaser.Math.Vector2 {
    const { tileWidth, tileHeight, offsetX = 0, offsetY = 0 } = this.config;
    const x = (gridX - gridY) * (tileWidth / 2) + offsetX;
    const y = (gridX + gridY) * (tileHeight / 2) + offsetY;
    return new Phaser.Math.Vector2(x, y);
  }

  public drawDebugGraphics(): Phaser.GameObjects.Graphics {
    const g = this.scene.add.graphics();
    g.lineStyle(1, 0x999999, 0.5);
    for (let y = 0; y < this.config.rows; y += 1) {
      for (let x = 0; x < this.config.cols; x += 1) {
        const p = this.worldPositionFromGrid(x, y);
        this.drawDiamond(g, p.x, p.y);
      }
    }
    return g;
  }

  private drawDiamond(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    const { tileWidth, tileHeight } = this.config;
    const hw = tileWidth / 2;
    const hh = tileHeight / 2;
    g.beginPath();
    g.moveTo(x, y - hh);
    g.lineTo(x + hw, y);
    g.lineTo(x, y + hh);
    g.lineTo(x - hw, y);
    g.closePath();
    g.strokePath();
  }
}


