import Phaser from "phaser";
import { PORTFOLIO_URL, TN } from "../theme";

/** Fade Tokyo Night entre escenas. */
export function fadeToScene(
  scene: Phaser.Scene,
  target: string,
  data?: object,
  duration = 280,
) {
  scene.cameras.main.fadeOut(duration, 26, 27, 38);
  scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
    scene.scene.start(target, data);
  });
}

export function fadeIn(scene: Phaser.Scene, duration = 320) {
  scene.cameras.main.fadeIn(duration, 26, 27, 38);
}

export function openPortfolio() {
  window.open(PORTFOLIO_URL, "_blank", "noopener,noreferrer");
}

/** Botón portfolio más visible, reutilizable. */
export function makePortfolioLink(scene: Phaser.Scene, y?: number) {
  const { width, height } = scene.scale;
  const yy = y ?? height - 36;

  const bg = scene.add
    .rectangle(width / 2, yy, 260, 34, TN.panel, 0.9)
    .setStrokeStyle(1, TN.blue, 0.85)
    .setInteractive({ useHandCursor: true })
    .setDepth(60)
    .setScrollFactor(0);

  const label = scene.add
    .text(width / 2, yy, "←  BACK TO PORTFOLIO", {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: "13px",
      color: "#7aa2f7",
      fontStyle: "bold",
    })
    .setOrigin(0.5)
    .setDepth(61)
    .setScrollFactor(0);

  const go = () => openPortfolio();
  bg.on("pointerup", go);
  bg.on("pointerover", () => {
    bg.setStrokeStyle(1, TN.cyan, 1);
    label.setColor("#7dcfff");
  });
  bg.on("pointerout", () => {
    bg.setStrokeStyle(1, TN.blue, 0.85);
    label.setColor("#7aa2f7");
  });
  label.setInteractive({ useHandCursor: true });
  label.on("pointerup", go);

  return { bg, label };
}
