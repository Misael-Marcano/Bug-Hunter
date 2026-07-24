import Phaser from "phaser";
import { PORTFOLIO_URL, TN } from "../theme";
import { getHighScore, setHighScore } from "../systems/Score";
import { AchievementTracker } from "../systems/Achievements";

type GameOverData = {
  score: number;
  wave: number;
};

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOver");
  }

  create(data: GameOverData) {
    const { width, height } = this.scale;
    const score = data?.score ?? 0;
    const wave = data?.wave ?? 1;
    const high = setHighScore(score);
    const isNew = score >= high && score > 0;

    const tracker = new AchievementTracker();
    if (score >= 50) tracker.tryUnlock("survivor");

    this.cameras.main.setBackgroundColor(TN.bg);

    this.add
      .text(width / 2, height * 0.22, "SYSTEM FAILURE", {
        fontFamily: "monospace",
        fontSize: "32px",
        color: "#f7768e",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.22 + 40, "deploy aborted // bugs win", {
        fontFamily: "monospace",
        fontSize: "13px",
        color: "#7982a9",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.42, `SCORE  ${score}`, {
        fontFamily: "monospace",
        fontSize: "22px",
        color: "#c0caf5",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.42 + 32, `WAVE  ${wave}`, {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#7dcfff",
      })
      .setOrigin(0.5);

    this.add
      .text(
        width / 2,
        height * 0.42 + 64,
        isNew ? `NEW HI-SCORE  ${high}` : `HI-SCORE  ${getHighScore()}`,
        {
          fontFamily: "monospace",
          fontSize: "16px",
          color: isNew ? "#9ece6a" : "#e0af68",
        },
      )
      .setOrigin(0.5);

    const retry = this.add
      .text(width / 2, height * 0.68, "[ R ]  RETRY", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#9ece6a",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const menu = this.add
      .text(width / 2, height * 0.68 + 36, "[ M ]  MENU", {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#7aa2f7",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const portfolio = this.add
      .text(width / 2, height - 36, "← back to portfolio", {
        fontFamily: "monospace",
        fontSize: "13px",
        color: "#7982a9",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    retry.on("pointerup", () => this.scene.start("Game"));
    menu.on("pointerup", () => this.scene.start("Menu"));
    portfolio.on("pointerup", () => {
      window.open(PORTFOLIO_URL, "_blank", "noopener,noreferrer");
    });

    this.input.keyboard?.once("keydown-R", () => this.scene.start("Game"));
    this.input.keyboard?.once("keydown-M", () => this.scene.start("Menu"));
    this.input.keyboard?.once("keydown-ENTER", () => this.scene.start("Game"));
  }
}
