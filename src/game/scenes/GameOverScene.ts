import Phaser from "phaser";
import { TN } from "../theme";
import { getHighScore, setHighScore } from "../systems/Score";
import { AchievementTracker } from "../systems/Achievements";
import { hex, paintAtmosphere } from "../ui/atmosphere";
import { fadeIn, fadeToScene, makePortfolioLink } from "../ui/transitions";

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
    paintAtmosphere(this, { stars: 28, grid: 40 });
    fadeIn(this);
    this.cameras.main.flash(220, 247, 118, 142, false);

    this.add
      .rectangle(width / 2, height * 0.26, width - 48, 100, TN.panel, 0.6)
      .setStrokeStyle(1, TN.red, 0.65);

    const title = this.add
      .text(width / 2, height * 0.26 - 16, "SYSTEM FAILURE", {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "30px",
        color: hex(TN.red),
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: title,
      alpha: 0.55,
      duration: 500,
      yoyo: true,
      repeat: 3,
    });

    this.add
      .text(width / 2, height * 0.26 + 22, "deploy aborted  //  bugs win", {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "12px",
        color: hex(TN.muted),
      })
      .setOrigin(0.5);

    this.add
      .rectangle(width / 2, height * 0.48, width - 72, 130, TN.panel2, 0.75)
      .setStrokeStyle(1, TN.border, 0.8);

    this.add
      .text(width / 2, height * 0.48 - 36, `SCORE  ${score}`, {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "24px",
        color: hex(TN.text),
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.48, `WAVE  ${wave}`, {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "15px",
        color: hex(TN.cyan),
      })
      .setOrigin(0.5);

    this.add
      .text(
        width / 2,
        height * 0.48 + 36,
        isNew ? `★  NEW HI-SCORE  ${high}` : `HI-SCORE  ${getHighScore()}`,
        {
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "15px",
          color: isNew ? hex(TN.green) : hex(TN.yellow),
        },
      )
      .setOrigin(0.5);

    const retry = this.add
      .rectangle(width / 2, height * 0.68, 200, 44, TN.panel, 0.95)
      .setStrokeStyle(1, TN.green, 0.8)
      .setInteractive({ useHandCursor: true });

    const retryLabel = this.add
      .text(width / 2, height * 0.68, "[ R ]  RETRY", {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "16px",
        color: hex(TN.green),
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const menu = this.add
      .text(width / 2, height * 0.68 + 42, "[ M ]  MENU", {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "15px",
        color: hex(TN.blue),
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const goRetry = () => fadeToScene(this, "Game");
    const goMenu = () => fadeToScene(this, "Menu");

    retry.on("pointerup", goRetry);
    retryLabel.setInteractive({ useHandCursor: true });
    retryLabel.on("pointerup", goRetry);
    menu.on("pointerup", goMenu);

    this.input.keyboard?.once("keydown-R", goRetry);
    this.input.keyboard?.once("keydown-M", goMenu);
    this.input.keyboard?.once("keydown-ENTER", goRetry);

    makePortfolioLink(this, height - 36);
  }
}
