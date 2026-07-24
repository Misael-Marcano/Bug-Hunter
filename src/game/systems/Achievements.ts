import { STORAGE_ACHIEVEMENTS } from "../theme";

export type AchievementId =
  | "first_bug"
  | "score_100"
  | "wave_3"
  | "hotfix_used"
  | "survivor"
  | "stash_used"
  | "coffee_used"
  | "merge_resolved";

export type AchievementDef = {
  id: AchievementId;
  title: string;
  hint: string;
};

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first_bug", title: "FIRST BLOOD", hint: "Caza tu primer bug" },
  { id: "score_100", title: "HOTFIX HERO", hint: "Llega a 100 puntos" },
  { id: "wave_3", title: "NIGHT SHIFT", hint: "Sobrevive 3 olas" },
  { id: "hotfix_used", title: "PATCH APPLIED", hint: "Usa un hotfix" },
  { id: "stash_used", title: "SAFE STASH", hint: "Activa git stash (escudo)" },
  { id: "coffee_used", title: "CAFFEINE FIX", hint: "Toma un coffee (+vida)" },
  { id: "merge_resolved", title: "MERGE RESOLVED", hint: "Derrota un merge conflict" },
  { id: "survivor", title: "SYSTEM STABLE", hint: "Termina con ≥50 pts" },
];

const loadUnlocked = (): Set<AchievementId> => {
  try {
    const raw = localStorage.getItem(STORAGE_ACHIEVEMENTS);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as AchievementId[]);
  } catch {
    return new Set();
  }
};

const persist = (set: Set<AchievementId>) => {
  localStorage.setItem(STORAGE_ACHIEVEMENTS, JSON.stringify([...set]));
};

export class AchievementTracker {
  private unlocked = loadUnlocked();
  private freshlyUnlocked: AchievementDef[] = [];

  has(id: AchievementId): boolean {
    return this.unlocked.has(id);
  }

  tryUnlock(id: AchievementId): AchievementDef | null {
    if (this.unlocked.has(id)) return null;
    this.unlocked.add(id);
    persist(this.unlocked);
    const def = ACHIEVEMENTS.find((a) => a.id === id) ?? null;
    if (def) this.freshlyUnlocked.push(def);
    return def;
  }

  drainFresh(): AchievementDef[] {
    const list = [...this.freshlyUnlocked];
    this.freshlyUnlocked = [];
    return list;
  }

  getUnlockedCount(): number {
    return this.unlocked.size;
  }
}
