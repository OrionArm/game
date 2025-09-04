import Phaser from 'phaser';
import { IsometricGrid } from '@/game/iso/IsometricGrid';
import { useGameStore } from '@/state/store';

export class CityScene extends Phaser.Scene {
  private grid!: IsometricGrid;

  private debugGraphics!: Phaser.GameObjects.Graphics;

  private readonly tileWidth = 64;

  private readonly tileHeight = 32;

  constructor() {
    super('CityScene');
  }

  create(): void {
    const { cols, rows } = useGameStore.getState().gridSize;
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY + 50;

    this.grid = new IsometricGrid(this, {
      cols,
      rows,
      tileWidth: this.tileWidth,
      tileHeight: this.tileHeight,
      offsetX: centerX,
      offsetY: centerY,
    });
    this.debugGraphics = this.grid.drawDebugGraphics();

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const worldPoint = new Phaser.Math.Vector2(pointer.worldX, pointer.worldY);
      const gridPos = this.gridPosFromWorld(worldPoint.x, worldPoint.y);
      if (!gridPos) return;
      const { x, y } = gridPos;
      // По умолчанию строим магазин при клике для MVP
      useGameStore.getState().placeBuilding({ type: 'shop', x, y });
      this.drawBuildings();
    });

    this.drawBuildings();
  }

  private gridPosFromWorld(x: number, y: number): { x: number; y: number } | null {
    const { cols, rows } = useGameStore.getState().gridSize;
    const halfW = this.tileWidth / 2;
    const halfH = this.tileHeight / 2;
    const originX = this.grid['config'].offsetX as number; // eslint-disable-line dot-notation
    const originY = this.grid['config'].offsetY as number; // eslint-disable-line dot-notation

    const dx = x - originX;
    const dy = y - originY;
    const gridX = Math.floor((dy / halfH + dx / halfW) / 2);
    const gridY = Math.floor((dy / halfH - dx / halfW) / 2);
    if (gridX < 0 || gridY < 0 || gridX >= cols || gridY >= rows) return null;
    return { x: gridX, y: gridY };
  }

  private drawBuildings(): void {
    this.children.getAll().forEach((obj) => {
      if (obj !== this.debugGraphics) obj.destroy();
    });
    this.debugGraphics = this.grid.drawDebugGraphics();

    const { buildings } = useGameStore.getState();
    buildings.forEach((b) => {
      const pos = this.grid.worldPositionFromGrid(b.x, b.y);
      const color = b.type === 'shop' ? 0x4caf50 : b.type === 'factory' ? 0x2196f3 : 0xffc107;
      const rect = this.add.rectangle(pos.x, pos.y - 10, 40, 30, color, 0.9);
      rect.setStrokeStyle(2, 0x222222, 1);
      rect.setDepth(pos.y);
    });
  }
}


