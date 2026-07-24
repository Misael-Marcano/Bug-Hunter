import Phaser from "phaser";
import { TN } from "../theme";
import { hex, paintAtmosphere } from "../ui/atmosphere";
import { fadeIn, fadeToScene, makePortfolioLink } from "../ui/transitions";

const ROWS: [string, string][] = [
  ["A / D  or  ← →", "Move"],
  ["SPACE  or  ↑", "Fire"],
  ["P  /  ESC", "Pause"],
  ["M", "Mute toggle"],
  ["Touch pads", "Steer / hold fire"],
  ["Green · HOTFIX", "Rapid fire"],
  ["Cyan · STASH", "Shield"],
  ["Yellow · COFFEE", "+1 life"],
  ["Blue · TWIN", "Dual shot"],
  ["Magenta · SPREAD", "3-way fan"],
  ["Orange · PIERCE", "Through bugs"],
  ["Every 5 waves", "MERGE CONFLICT boss"],
];

export class ControlsScene extends Phaser.Scene {
  constructor() {
    super("Controls");
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(TN.bg);
    paintAtmosphere(this, { stars: 32, grid: 40 });
    fadeIn(this);

    this.add
      .text(width / 2, 36, "CONTROLS", {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "26px",
        color: hex(TN.cyan),
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .rectangle(width / 2, height * 0.48, width - 40, height * 0.64, TN.panel, 0.55)
      .setStrokeStyle(1, TN.border, 0.8);

    ROWS.forEach(([key, desc], i) => {
      const y = 78 + i * 42;
      this.add
        .text(36, y, key, {
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "12px",
          color: hex(TN.green),
        })
        .setOrigin(0, 0.5);
      this.add
        .text(width - 36, y, desc, {
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "12px",
          color: hex(TN.text),
        })
        .setOrigin(1, 0.5);
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
