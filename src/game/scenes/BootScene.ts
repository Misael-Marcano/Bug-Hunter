import Phaser from "phaser";
import { TN } from "../theme";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  create() {
    this.cameras.main.setBackgroundColor(TN.bg);
    this.scene.start("Preload");
  }
}
