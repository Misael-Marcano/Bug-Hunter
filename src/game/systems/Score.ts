import { STORAGE_HIGH_SCORE } from "../theme";

export const getHighScore = (): number => {
  const n = Number(localStorage.getItem(STORAGE_HIGH_SCORE) ?? "0");
  return Number.isFinite(n) ? n : 0;
};

export const setHighScore = (score: number): number => {
  const prev = getHighScore();
  const next = Math.max(prev, Math.floor(score));
  localStorage.setItem(STORAGE_HIGH_SCORE, String(next));
  return next;
};
