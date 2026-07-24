import Phaser from "phaser";
import { PORTFOLIO_URL, TN } from "../theme";
import { getHighScore } from "../systems/Score";
import { ACHIEVEMENTS, AchievementTracker } from "../systems/Achievements";

export class MenuScene extends Phaser.Scene {
  private achievements = new AchievementTracker();

  constructor() {
    super("Menu");
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(TN.bg);
    this.drawGrid();

    this.add
      .text(width / 2, 48, "△  ○  ✕  □", {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#7dcfff",
      })
      .setOrigin(0.5)
      .setAlpha(0.85);

    this.add
      .text(width / 2, height * 0.28, "BUG HUNTER", {
        fontFamily: "monospace",
        fontSize: "42px",
        color: "#c0caf5",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.28 + 42, "night shift // hotfix mode", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#7982a9",
      })
      .setOrigin(0.5);

    const blink = this.add
      .text(width / 2, height * 0.52, "PRESS START", {
        fontFamily: "monospace",
        fontSize: "22px",
        color: "#9ece6a",
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: blink,
      alpha: 0.25,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    this.add
      .text(width / 2, height * 0.52 + 36, "ENTER / TAP  ·  WASD + SPACE", {
        fontFamily: "monospace",
        fontSize: "12px",
        color: "#565f89",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.68, `HI-SCORE  ${getHighScore()}`, {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#e0af68",
      })
      .setOrigin(0.5);

    this.add
      .text(
        width / 2,
        height * 0.68 + 28,
        `ACHIEVEMENTS  ${this.achievements.getUnlockedCount()}/${ACHIEVEMENTS.length}`,
        {
          fontFamily: "monospace",
          fontSize: "12px",
          color: "#bb9af7",
        },
      )
      .setOrigin(0.5);

    const back = this.add
      .text(width / 2, height - 36, "← back to portfolio", {
        fontFamily: "monospace",
        fontSize: "13px",
        color: "#7aa2f7",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    back.on("pointerover", () => back.setColor("#7dcfff"));
    back.on("pointerout", () => back.setColor("#7aa2f7"));
    back.on("pointerup", () => {
      window.open(PORTFOLIO_URL, "_blank", "noopener,noreferrer");
    });

    const start = () => this.scene.start("Game");
    this.input.keyboard?.once("keydown-ENTER", start);
    this.input.keyboard?.once("keydown-SPACE", start);
    this.input.once("pointerdown", (pointer: Phaser.Input.Pointer) => {
      // Evita que el click en “portfolio” arranque el juego
      if (pointer.y > height - 56) return;
      start();
    });
  }

  private drawGrid() {
    const g = this.add.graphics();
    g.lineStyle(1, TN.blue, 0.08);
    for (let x = 0; x < this.scale.width; x += 32) {
      g.lineBetween(x, 0, x, this.scale.height);
    }
    for (let y = 0; y < this.scale.height; y += 32) {
      g.lineBetween(0, y, this.scale.width, y);
    }
  }
}
