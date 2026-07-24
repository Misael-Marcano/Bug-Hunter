/** Respeta prefers-reduced-motion para shake/partículas/tweens. */
export function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

export function shakeIntensity(base: number): number {
  return prefersReducedMotion() ? base * 0.15 : base;
}

export function shakeDuration(base: number): number {
  return prefersReducedMotion() ? Math.min(base, 40) : base;
}

export function particleCount(base: number): number {
  return prefersReducedMotion() ? Math.max(2, Math.floor(base * 0.25)) : base;
}

export function motionDuration(base: number): number {
  return prefersReducedMotion() ? Math.min(base, 120) : base;
}
