import type { Profile, RawParts } from "@/lib/battery/score";

const KEY = "cadran-sessions-v1";
const DRAFT_KEY = "cadran-draft-v1";

export type SessionResult = Profile & {
  id: string;
  at: string;
  raw: RawParts;
};

export type Draft = {
  step: number;
  raw: RawParts;
  seed: number;
  savedAt: string;
};

export function loadHistory(): SessionResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SessionResult[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s) => typeof s?.global === "number" && typeof s.at === "string");
  } catch {
    return [];
  }
}

export function saveHistory(sessions: SessionResult[]) {
  window.localStorage.setItem(KEY, JSON.stringify(sessions.slice(0, 12)));
}

export function loadDraft(): Draft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Draft;
    if (typeof parsed?.step !== "number" || !parsed.raw || typeof parsed.seed !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveDraft(draft: Draft) {
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function clearDraft() {
  window.localStorage.removeItem(DRAFT_KEY);
}
