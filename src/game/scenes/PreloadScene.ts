import Phaser from "phaser";
import { TN } from "../theme";

/** Genera texturas procedurales (sin assets externos). */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("Preload");
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(TN.bg);

    const title = this.add
      .text(width / 2, height / 2 - 36, "LOADING...", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#7dcfff",
      })
      .setOrigin(0.5);

    this.add.rectangle(width / 2, height / 2, 240, 14, TN.panel).setStrokeStyle(1, TN.border);
    const bar = this.add
      .rectangle(width / 2 - 118, height / 2, 4, 10, TN.cyan)
      .setOrigin(0, 0.5);

    this.makeTextures();

    this.tweens.add({
      targets: bar,
      width: 236,
      duration: 600,
      ease: "Cubic.easeOut",
      onComplete: () => {
        title.destroy();
        this.scene.start("Menu");
      },
    });
  }

  private makeTextures() {
    const ship = this.make.graphics({ x: 0, y: 0 });
    ship.fillStyle(TN.blue, 1);
    ship.fillTriangle(16, 0, 32, 36, 0, 36);
    ship.fillStyle(TN.cyan, 1);
    ship.fillRect(12, 14, 8, 8);
    ship.generateTexture("player", 32, 36);
    ship.destroy();

    const bullet = this.make.graphics({ x: 0, y: 0 });
    bullet.fillStyle(TN.green, 1);
    bullet.fillRoundedRect(0, 0, 4, 12, 2);
    bullet.generateTexture("bullet", 4, 12);
    bullet.destroy();

    this.drawBug("bug", TN.red);
    this.drawBug("bug-yellow", TN.yellow);
    this.drawBug("bug-magenta", TN.magenta);

    const orb = this.make.graphics({ x: 0, y: 0 });
    orb.fillStyle(TN.green, 1);
    orb.fillCircle(10, 10, 10);
    orb.fillStyle(TN.bg, 1);
    orb.fillRect(6, 8, 8, 4);
    orb.generateTexture("powerup", 20, 20);
    orb.destroy();
  }

  private drawBug(key: string, color: number) {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(color, 1);
    g.fillEllipse(14, 16, 26, 18);
    g.fillStyle(TN.bg, 1);
    g.fillCircle(8, 12, 2.5);
    g.fillCircle(20, 12, 2.5);
    g.lineStyle(2, color, 1);
    g.lineBetween(4, 16, 0, 24);
    g.lineBetween(24, 16, 28, 24);
    g.generateTexture(key, 28, 28);
    g.destroy();
  }
}
