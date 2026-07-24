import Phaser from "phaser";
import { TN } from "../theme";
import { hex, paintAtmosphere } from "../ui/atmosphere";
import { fadeIn, fadeToScene, makePortfolioLink } from "../ui/transitions";

export class CreditsScene extends Phaser.Scene {
  constructor() {
    super("Credits");
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(TN.bg);
    paintAtmosphere(this, { stars: 48, grid: 36 });
    fadeIn(this);

    this.add
      .text(width / 2, 48, "CREDITS", {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "26px",
        color: hex(TN.yellow),
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .rectangle(width / 2, height * 0.42, width - 48, 280, TN.panel, 0.6)
      .setStrokeStyle(1, TN.border, 0.85);

    const lines = [
      { t: "BUG HUNTER", c: hex(TN.text), s: "22px" },
      { t: "arcade showcase · Tokyo Night", c: hex(TN.muted), s: "13px" },
      { t: "", c: hex(TN.muted), s: "12px" },
      { t: "Built by Misael Marcano", c: hex(TN.cyan), s: "15px" },
      { t: "Vite · TypeScript · Phaser", c: hex(TN.green), s: "13px" },
      { t: "", c: hex(TN.muted), s: "12px" },
      { t: "Portfolio project — night shift mode", c: hex(TN.comment), s: "12px" },
      { t: "Hunt bugs. Ship hotfixes. Resolve merges.", c: hex(TN.magenta), s: "12px" },
    ];

    let y = height * 0.28;
    lines.forEach((line) => {
      if (line.t) {
        this.add
          .text(width / 2, y, line.t, {
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: line.s,
            color: line.c,
          })
          .setOrigin(0.5);
      }
      y += 28;
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

    makePortfolioLink(this, height - 36);
  }
}
