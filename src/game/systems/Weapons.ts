import Phaser from "phaser";
import { BALANCE } from "../balance";

export type WeaponMode = "single" | "twin" | "spread" | "pierce";

export type ShotSpec = {
  texture: string;
  offsetX: number;
  offsetY: number;
  vx: number;
  vy: number;
  pierce: number;
};

export function weaponLabel(mode: WeaponMode): string {
  switch (mode) {
    case "twin":
      return "TWIN";
    case "spread":
      return "SPREAD";
    case "pierce":
      return "PIERCE";
    default:
      return "";
  }
}

/** Genera balas según el modo de arma activo. */
export function buildShots(mode: WeaponMode): ShotSpec[] {
  const speed = BALANCE.bulletSpeed;

  if (mode === "twin") {
    return [
      { texture: "bullet-twin", offsetX: -8, offsetY: -20, vx: 0, vy: -speed, pierce: 0 },
      { texture: "bullet-twin", offsetX: 8, offsetY: -20, vx: 0, vy: -speed, pierce: 0 },
    ];
  }

  if (mode === "spread") {
    const angle = Phaser.Math.DegToRad(18);
    const mk = (a: number): ShotSpec => ({
      texture: "bullet-spread",
      offsetX: 0,
      offsetY: -20,
      vx: Math.sin(a) * speed,
      vy: -Math.cos(a) * speed,
      pierce: 0,
    });
    return [mk(-angle), mk(0), mk(angle)];
  }

  if (mode === "pierce") {
    return [
      {
        texture: "bullet-pierce",
        offsetX: 0,
        offsetY: -22,
        vx: 0,
        vy: -speed * 1.15,
        pierce: BALANCE.pierceHits,
      },
    ];
  }

  return [
    { texture: "bullet", offsetX: 0, offsetY: -22, vx: 0, vy: -speed, pierce: 0 },
  ];
}
