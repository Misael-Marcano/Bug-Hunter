import "./style.css";
import Phaser from "phaser";
import { gameConfig } from "./game/config";

// Evita scroll/zoom accidental en móvil durante la partida
document.addEventListener(
  "touchmove",
  (e) => {
    if ((e.target as HTMLElement)?.closest?.("#game-root")) {
      e.preventDefault();
    }
  },
  { passive: false },
);

new Phaser.Game(gameConfig);
