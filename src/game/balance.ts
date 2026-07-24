/** Constantes de jugabilidad — ajustar aquí para tunear la partida. */
export const BALANCE = {
  playerSpeed: 300,
  bulletSpeed: 480,
  fireCooldownMs: 200,
  rapidFireMultiplier: 0.42,

  startLives: 3,
  maxLives: 5,
  invincibleMs: 1400,

  bugBaseSpeed: 48,
  bugSpeedPerWave: 12,
  bugSpeedJitter: 22,
  bugZigzagAmp: 55,
  bugZigzagFreq: 0.0028,

  waveBaseCount: 5,
  waveCountPerWave: 2,
  waveSpawnBaseMs: 780,
  waveSpawnPerWaveMs: 35,
  waveSpawnMinMs: 320,
  waveGapMs: 1100,

  /** Cada N olas aparece un merge conflict (boss). */
  bossEveryWaves: 5,
  bossHpBase: 14,
  bossHpPerTier: 4,
  bossSpeed: 70,
  bossZigzagAmp: 120,
  bossPoints: 120,

  powerupChance: 0.16,
  powerupFallSpeed: 85,
  rapidFireDurationMs: 5000,
  shieldDurationMs: 6000,
  weaponDurationMs: 8000,
  pierceHits: 3,

  shakeHit: { duration: 160, intensity: 0.006 },
  shakeKill: { duration: 70, intensity: 0.003 },
  shakeBoss: { duration: 220, intensity: 0.01 },
} as const;

/** Power-ups de soporte + armas. */
export type PowerUpKind =
  | "hotfix"
  | "stash"
  | "coffee"
  | "twin"
  | "spread"
  | "pierce";

export const POWERUP_KEYS: Record<PowerUpKind, string> = {
  hotfix: "powerup-hotfix",
  stash: "powerup-stash",
  coffee: "powerup-coffee",
  twin: "powerup-twin",
  spread: "powerup-spread",
  pierce: "powerup-pierce",
};

export const POWERUP_WEIGHTS: { kind: PowerUpKind; weight: number }[] = [
  { kind: "hotfix", weight: 22 },
  { kind: "stash", weight: 18 },
  { kind: "coffee", weight: 14 },
  { kind: "twin", weight: 16 },
  { kind: "spread", weight: 16 },
  { kind: "pierce", weight: 14 },
];
