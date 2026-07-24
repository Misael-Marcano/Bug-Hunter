import Phaser from "phaser";
import { TN } from "../theme";

/** Fondo Tokyo Night: viñeta, rejilla suave y estrellas. */
export function paintAtmosphere(scene: Phaser.Scene, opts?: { stars?: number; grid?: number }) {
  const { width, height } = scene.scale;
  const stars = opts?.stars ?? 48;
  const gridStep = opts?.grid ?? 36;

  const g = scene.add.graphics().setDepth(-20);

  g.fillStyle(TN.panel2, 0.45);
  g.fillRect(0, 0, width, height * 0.22);
  g.fillStyle(TN.cyan, 0.04);
  g.fillEllipse(width / 2, -20, width * 1.1, height * 0.45);

  g.lineStyle(1, TN.blue, 0.05);
  for (let x = 0; x < width; x += gridStep) {
    g.lineBetween(x, 0, x, height);
  }
  for (let y = 0; y < height; y += gridStep) {
    g.lineBetween(0, y, width, y);
  }

  const starG = scene.add.graphics().setDepth(-19);
  for (let i = 0; i < stars; i++) {
    const x = Phaser.Math.Between(4, width - 4);
    const y = Phaser.Math.Between(4, height - 4);
    const a = Phaser.Math.FloatBetween(0.15, 0.55);
    const c = i % 5 === 0 ? TN.cyan : i % 7 === 0 ? TN.magenta : TN.text;
    starG.fillStyle(c, a);
    starG.fillCircle(x, y, i % 11 === 0 ? 1.4 : 0.9);
  }

  // Scanline sutil
  const scan = scene.add.graphics().setDepth(40).setAlpha(0.04).setScrollFactor(0);
  scan.fillStyle(0x000000, 1);
  for (let y = 0; y < height; y += 3) {
    scan.fillRect(0, y, width, 1);
  }

  return { g, starG, scan };
}

export function hex(n: number): string {
  return `#${n.toString(16).padStart(6, "0")}`;
}

export function makePanel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  depth = 18,
) {
  const panel = scene.add
    .rectangle(x, y, w, h, TN.panel, 0.88)
    .setStrokeStyle(1, TN.border, 0.9)
    .setDepth(depth)
    .setScrollFactor(0);
  return panel;
}

export function makeGhostButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  color: string,
  fontSize = "18px",
) {
  const text = scene.add
    .text(x, y, label, {
      fontFamily: '"JetBrains Mono", "Cascadia Code", monospace',
      fontSize,
      color,
      fontStyle: "bold",
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

  text.on("pointerover", () => text.setAlpha(0.75));
  text.on("pointerout", () => text.setAlpha(1));
  return text;
}
