const STORAGE_MUTE = "bug-hunter-mute";

export function isMuted(): boolean {
  try {
    return localStorage.getItem(STORAGE_MUTE) === "1";
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean): void {
  try {
    localStorage.setItem(STORAGE_MUTE, muted ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function toggleMuted(): boolean {
  const next = !isMuted();
  setMuted(next);
  return next;
}
