import Phaser from "phaser";
import { TN } from "./theme";
import { BootScene } from "./scenes/BootScene";
import { PreloadScene } from "./scenes/PreloadScene";
import { MenuScene } from "./scenes/MenuScene";
import { AchievementsScene } from "./scenes/AchievementsScene";
import { ControlsScene } from "./scenes/ControlsScene";
import { CreditsScene } from "./scenes/CreditsScene";
import { GameScene } from "./scenes/GameScene";
import { GameOverScene } from "./scenes/GameOverScene";

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-root",
  backgroundColor: TN.bg,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 540,
    height: 810,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [
    BootScene,
    PreloadScene,
    MenuScene,
    AchievementsScene,
    ControlsScene,
    CreditsScene,
    GameScene,
    GameOverScene,
  ],
  input: {
    activePointers: 3,
  },
};
