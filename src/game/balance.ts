/** Constantes de jugabilidad — ajustar aquí para tunear la partida. */
export const BALANCE = {
  playerSpeed: 300,
  bulletSpeed: 460,
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

  powerupChance: 0.14,
  powerupFallSpeed: 85,
  rapidFireDurationMs: 5000,
  shieldDurationMs: 6000,

  shakeHit: { duration: 160, intensity: 0.006 },
  shakeKill: { duration: 70, intensity: 0.003 },
  shakeBoss: { duration: 220, intensity: 0.01 },
} as const;

export type PowerUpKind = "hotfix" | "stash" | "coffee";

export const POWERUP_KEYS: Record<PowerUpKind, string> = {
  hotfix: "powerup-hotfix",
  stash: "powerup-stash",
  coffee: "powerup-coffee",
};
