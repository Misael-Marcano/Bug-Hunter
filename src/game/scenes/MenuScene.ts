import Phaser from "phaser";
import { TN } from "../theme";
import { getHighScore } from "../systems/Score";
import { ACHIEVEMENTS, AchievementTracker } from "../systems/Achievements";
import { hex, paintAtmosphere } from "../ui/atmosphere";
import { fadeIn, fadeToScene, makePortfolioLink } from "../ui/transitions";

type MenuItem = { label: string; scene?: string; action?: "start" };

const ITEMS: MenuItem[] = [
  { label: "START", action: "start" },
  { label: "ACHIEVEMENTS", scene: "Achievements" },
  { label: "CONTROLS", scene: "Controls" },
  { label: "CREDITS", scene: "Credits" },
];

export class MenuScene extends Phaser.Scene {
  private achievements = new AchievementTracker();
  private cursor = 0;
  private labels: Phaser.GameObjects.Text[] = [];
  private markers: Phaser.GameObjects.Text[] = [];

  constructor() {
    super("Menu");
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(TN.bg);
    paintAtmosphere(this, { stars: 56, grid: 36 });
    fadeIn(this);
    this.cursor = 0;
    this.labels = [];
    this.markers = [];

    const faces = this.add
      .text(width / 2, 36, "△   ○   ✕   □", {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "15px",
        color: hex(TN.cyan),
      })
      .setOrigin(0.5)
      .setAlpha(0.7);

    this.tweens.add({
      targets: faces,
      alpha: 0.35,
      duration: 1400,
      yoyo: true,
      repeat: -1,
    });

    this.add
      .rectangle(width / 2, 118, width - 48, 88, TN.panel, 0.55)
      .setStrokeStyle(1, TN.border, 0.85);

    this.add
      .text(width / 2, 100, "BUG HUNTER", {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "36px",
        color: hex(TN.text),
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .rectangle(width / 2, 128, 140, 2, TN.cyan, 0.9)
      .setOrigin(0.5);

    this.add
      .text(width / 2, 148, "night shift  //  hotfix mode", {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "12px",
        color: hex(TN.muted),
      })
      .setOrigin(0.5);

    // PS-style vertical menu
    const menuTop = 210;
    ITEMS.forEach((item, i) => {
      const y = menuTop + i * 48;
      const row = this.add
        .rectangle(width / 2, y, 280, 40, TN.panel2, 0.7)
        .setStrokeStyle(1, TN.border, 0.6)
        .setInteractive({ useHandCursor: true });

      const marker = this.add
        .text(width / 2 - 120, y, "▶", {
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "16px",
          color: hex(TN.green),
        })
        .setOrigin(0.5)
        .setAlpha(0);

      const label = this.add
        .text(width / 2, y, item.label, {
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "18px",
          color: hex(TN.text),
          fontStyle: "bold",
        })
        .setOrigin(0.5);

      this.labels.push(label);
      this.markers.push(marker);

      row.on("pointerover", () => {
        this.cursor = i;
        this.refreshCursor();
      });
      row.on("pointerup", () => {
        this.cursor = i;
        this.refreshCursor();
        this.activate();
      });
    });

    this.add
      .text(width / 2, menuTop + ITEMS.length * 48 + 16, "↑↓  select   ·   ENTER / TAP  confirm", {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "11px",
        color: hex(TN.comment),
      })
      .setOrigin(0.5);

    this.add
      .rectangle(width / 2, height * 0.72, width - 64, 56, TN.panel, 0.5)
      .setStrokeStyle(1, TN.border, 0.7);

    this.add
      .text(width / 2 - 70, height * 0.72 - 8, "HI-SCORE", {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "10px",
        color: hex(TN.comment),
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2 - 70, height * 0.72 + 12, `${getHighScore()}`, {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "18px",
        color: hex(TN.yellow),
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2 + 70, height * 0.72 - 8, "ACHIEVEMENTS", {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "10px",
        color: hex(TN.comment),
      })
      .setOrigin(0.5);

    this.add
      .text(
        width / 2 + 70,
        height * 0.72 + 12,
        `${this.achievements.getUnlockedCount()}/${ACHIEVEMENTS.length}`,
        {
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "18px",
          color: hex(TN.magenta),
          fontStyle: "bold",
        },
      )
      .setOrigin(0.5);

    makePortfolioLink(this, height - 36);

    this.refreshCursor();

    this.input.keyboard?.on("keydown-UP", () => {
      this.cursor = (this.cursor - 1 + ITEMS.length) % ITEMS.length;
      this.refreshCursor();
    });
    this.input.keyboard?.on("keydown-DOWN", () => {
      this.cursor = (this.cursor + 1) % ITEMS.length;
      this.refreshCursor();
    });
    this.input.keyboard?.on("keydown-W", () => {
      this.cursor = (this.cursor - 1 + ITEMS.length) % ITEMS.length;
      this.refreshCursor();
    });
    this.input.keyboard?.on("keydown-S", () => {
      this.cursor = (this.cursor + 1) % ITEMS.length;
      this.refreshCursor();
    });
    this.input.keyboard?.on("keydown-ENTER", () => this.activate());
    this.input.keyboard?.on("keydown-SPACE", () => this.activate());
  }

  private refreshCursor() {
    this.labels.forEach((label, i) => {
      const on = i === this.cursor;
      label.setColor(on ? hex(TN.green) : hex(TN.text));
      this.markers[i].setAlpha(on ? 1 : 0);
    });
  }

  private activate() {
    const item = ITEMS[this.cursor];
    if (item.action === "start") {
      fadeToScene(this, "Game");
      return;
    }
    if (item.scene) fadeToScene(this, item.scene);
  }
}
