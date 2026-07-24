import Phaser from "phaser";
import { TN } from "../theme";
import { hex, paintAtmosphere } from "../ui/atmosphere";
import { fadeToScene } from "../ui/transitions";

/** Genera texturas procedurales (sin assets externos). */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("Preload");
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(TN.bg);
    paintAtmosphere(this, { stars: 36, grid: 40 });

    this.add
      .text(width / 2, height / 2 - 42, "COMPILING MODULES", {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "16px",
        color: hex(TN.cyan),
      })
      .setOrigin(0.5);

    this.add
      .rectangle(width / 2, height / 2, 260, 16, TN.panel)
      .setStrokeStyle(1, TN.border);

    const bar = this.add
      .rectangle(width / 2 - 128, height / 2, 4, 10, TN.cyan)
      .setOrigin(0, 0.5);

    this.makeTextures();

    this.tweens.add({
      targets: bar,
      width: 256,
      duration: 520,
      ease: "Cubic.easeOut",
      onComplete: () => fadeToScene(this, "Menu", undefined, 200),
    });
  }

  private makeTextures() {
    const ship = this.make.graphics({ x: 0, y: 0 });
    ship.fillStyle(TN.blue, 1);
    ship.fillTriangle(18, 0, 36, 40, 0, 40);
    ship.fillStyle(TN.cyan, 1);
    ship.fillTriangle(18, 6, 26, 28, 10, 28);
    ship.fillStyle(TN.panel, 1);
    ship.fillRect(14, 18, 8, 10);
    ship.fillStyle(TN.green, 1);
    ship.fillTriangle(10, 40, 18, 34, 26, 40);
    ship.generateTexture("player", 36, 40);
    ship.destroy();

    this.drawBullet("bullet", TN.green, 5, 14);
    this.drawBullet("bullet-twin", TN.cyan, 4, 12);
    this.drawBullet("bullet-spread", TN.magenta, 5, 12);
    this.drawPierceBullet();

    this.drawBug("bug", TN.red);
    this.drawBug("bug-yellow", TN.yellow);
    this.drawBug("bug-magenta", TN.magenta);
    this.drawBoss();

    this.drawOrb("powerup-hotfix", TN.green, "H");
    this.drawOrb("powerup-stash", TN.cyan, "S");
    this.drawOrb("powerup-coffee", TN.yellow, "C");
    this.drawOrb("powerup-twin", TN.blue, "T");
    this.drawOrb("powerup-spread", TN.magenta, "W");
    this.drawOrb("powerup-pierce", 0xff9e64, "P");
    this.drawOrb("powerup", TN.green, "H");

    const spark = this.make.graphics({ x: 0, y: 0 });
    spark.fillStyle(0xffffff, 1);
    spark.fillCircle(3, 3, 3);
    spark.generateTexture("spark", 6, 6);
    spark.destroy();

    const pad = this.make.graphics({ x: 0, y: 0 });
    pad.fillStyle(TN.panel, 0.55);
    pad.fillCircle(40, 40, 40);
    pad.lineStyle(2, TN.border, 0.9);
    pad.strokeCircle(40, 40, 38);
    pad.generateTexture("touch-pad", 80, 80);
    pad.destroy();

    // Shield ring overlay hint (used as tint target only via circle in scene)
    const shield = this.make.graphics({ x: 0, y: 0 });
    shield.lineStyle(3, TN.cyan, 1);
    shield.strokeCircle(22, 22, 20);
    shield.generateTexture("shield-ring", 44, 44);
    shield.destroy();
  }

  private drawBullet(key: string, color: number, w: number, h: number) {
    const bullet = this.make.graphics({ x: 0, y: 0 });
    bullet.fillStyle(color, 1);
    bullet.fillRoundedRect(0, 0, w, h, 2);
    bullet.fillStyle(0xffffff, 0.7);
    bullet.fillRoundedRect(1, 1, Math.max(1, w - 2), Math.floor(h * 0.4), 1);
    bullet.generateTexture(key, w, h);
    bullet.destroy();
  }

  private drawPierceBullet() {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xff9e64, 1);
    g.fillRoundedRect(2, 0, 4, 20, 2);
    g.fillStyle(0xffffff, 0.85);
    g.fillRoundedRect(3, 0, 2, 8, 1);
    g.generateTexture("bullet-pierce", 8, 20);
    g.destroy();
  }

  private drawOrb(key: string, color: number, letter = "?") {
    const orb = this.make.graphics({ x: 0, y: 0 });
    orb.fillStyle(color, 0.25);
    orb.fillCircle(12, 12, 12);
    orb.fillStyle(color, 1);
    orb.fillCircle(12, 12, 8);
    orb.fillStyle(TN.bg, 1);
    if (letter === "H") {
      orb.fillRect(7, 10, 10, 4);
    } else if (letter === "S") {
      orb.fillRect(8, 7, 8, 3);
      orb.fillRect(8, 14, 8, 3);
      orb.fillRect(8, 7, 3, 10);
    } else if (letter === "T") {
      orb.fillRect(7, 7, 10, 3);
      orb.fillRect(10, 7, 3, 10);
    } else if (letter === "W") {
      orb.fillTriangle(12, 6, 7, 16, 17, 16);
    } else if (letter === "P") {
      orb.fillRect(10, 6, 3, 12);
      orb.fillCircle(11.5, 9, 3);
    } else {
      orb.fillRect(8, 8, 8, 9);
      orb.fillRect(16, 10, 3, 5);
    }
    orb.generateTexture(key, 24, 24);
    orb.destroy();
  }

  private drawBoss() {
    const g = this.make.graphics({ x: 0, y: 0 });
    // Merge conflict node
    g.fillStyle(TN.red, 0.35);
    g.fillRoundedRect(4, 8, 56, 40, 8);
    g.fillStyle(TN.panel, 1);
    g.fillRoundedRect(8, 12, 48, 32, 6);
    g.lineStyle(2, TN.red, 1);
    g.strokeRoundedRect(8, 12, 48, 32, 6);
    g.lineStyle(3, TN.yellow, 1);
    g.lineBetween(18, 20, 30, 36);
    g.lineBetween(30, 20, 18, 36);
    g.lineBetween(34, 20, 46, 36);
    g.lineBetween(46, 20, 34, 36);
    g.fillStyle(TN.magenta, 1);
    g.fillCircle(32, 8, 5);
    g.generateTexture("boss-merge", 64, 52);
    g.destroy();
  }

  private drawBug(key: string, color: number) {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(color, 0.3);
    g.fillEllipse(16, 16, 30, 22);
    g.fillStyle(color, 1);
    g.fillEllipse(16, 17, 26, 18);
    g.fillStyle(TN.bg, 1);
    g.fillCircle(10, 13, 3);
    g.fillCircle(22, 13, 3);
    g.fillStyle(color, 1);
    g.fillCircle(10, 13, 1.2);
    g.fillCircle(22, 13, 1.2);
    g.lineStyle(2, color, 1);
    g.lineBetween(5, 18, 1, 26);
    g.lineBetween(27, 18, 31, 26);
    g.lineBetween(8, 8, 4, 2);
    g.lineBetween(24, 8, 28, 2);
    g.generateTexture(key, 32, 30);
    g.destroy();
  }
}
