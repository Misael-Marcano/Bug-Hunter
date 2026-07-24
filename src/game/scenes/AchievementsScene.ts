import Phaser from "phaser";
import { TN } from "../theme";
import { ACHIEVEMENTS, AchievementTracker } from "../systems/Achievements";
import { hex, paintAtmosphere } from "../ui/atmosphere";
import { fadeIn, fadeToScene, makePortfolioLink } from "../ui/transitions";

export class AchievementsScene extends Phaser.Scene {
  private tracker = new AchievementTracker();

  constructor() {
    super("Achievements");
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(TN.bg);
    paintAtmosphere(this, { stars: 36, grid: 40 });
    fadeIn(this);

    this.add
      .text(width / 2, 40, "ACHIEVEMENTS", {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "26px",
        color: hex(TN.magenta),
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(
        width / 2,
        68,
        `${this.tracker.getUnlockedCount()}/${ACHIEVEMENTS.length} unlocked`,
        {
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "12px",
          color: hex(TN.muted),
        },
      )
      .setOrigin(0.5);

    const startY = 96;
    const rowH = 52;

    ACHIEVEMENTS.forEach((def, i) => {
      const unlocked = this.tracker.has(def.id);
      const y = startY + i * rowH;

      this.add
        .rectangle(width / 2, y, width - 40, rowH - 6, TN.panel, unlocked ? 0.75 : 0.4)
        .setStrokeStyle(1, unlocked ? TN.magenta : TN.border, unlocked ? 0.8 : 0.5);

      this.add
        .text(36, y - 8, unlocked ? "★" : "○", {
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "14px",
          color: unlocked ? hex(TN.yellow) : hex(TN.comment),
        })
        .setOrigin(0, 0.5);

      this.add
        .text(58, y - 8, unlocked ? def.title : "??????????", {
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "13px",
          color: unlocked ? hex(TN.text) : hex(TN.comment),
          fontStyle: "bold",
        })
        .setOrigin(0, 0.5);

      this.add
        .text(58, y + 10, unlocked ? def.hint : "Locked — keep hunting", {
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "10px",
          color: hex(TN.muted),
        })
        .setOrigin(0, 0.5);
    });

    const back = this.add
      .text(width / 2, height - 78, "[ ESC ]  BACK", {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "14px",
        color: hex(TN.cyan),
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    back.on("pointerup", () => fadeToScene(this, "Menu"));
    this.input.keyboard?.once("keydown-ESC", () => fadeToScene(this, "Menu"));
    this.input.keyboard?.once("keydown-BACKSPACE", () => fadeToScene(this, "Menu"));

    makePortfolioLink(this, height - 36);
  }
}
