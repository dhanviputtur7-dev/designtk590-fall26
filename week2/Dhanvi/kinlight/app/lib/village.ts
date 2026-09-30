export type Frequency = "daily" | "weekly" | "biweekly" | "monthly";

export type Person = {
  id: string;
  name: string;
  relationship: string;
  frequency: Frequency;
  lastCheckIn: string; // ISO date string
  checkInHistory: string[]; // ISO date of every check-in
  city?: string;
  timezone?: string;
};

export const FREQUENCY_DAYS: Record<Frequency, number> = {
  daily: 1,
  weekly: 7,
  biweekly: 14,
  monthly: 30,
};

const MESSAGE_TEMPLATES = [
  "Hey! It's been a bit — how have you been?",
  "Thinking of you, wanted to check in!",
  "Hi! What's new with you lately?",
  "Been meaning to reach out — how's everything going?",
  "Hey stranger, catch me up on your life!",
];

export function randomMessage(name: string) {
  const base =
    MESSAGE_TEMPLATES[Math.floor(Math.random() * MESSAGE_TEMPLATES.length)];
  return base.replace("Hey!", `Hey ${name}!`).replace("Hi!", `Hi ${name}!`);
}

// ---------- light and darkness ----------

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// whole days, for showing to the user
export function daysSince(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / MS_PER_DAY);
}

// 0 = just checked in, 1 = check-in is due, 2 = twice as overdue as it should be
export function overdueRatio(person: Person) {
  const days = (Date.now() - new Date(person.lastCheckIn).getTime()) / MS_PER_DAY;
  return days / FREQUENCY_DAYS[person.frequency];
}

// 1 = fully lit, about 0.5 when due, 0.1 = dark (never fully invisible)
export function lightLevel(person: Person) {
  const light = 1 - overdueRatio(person) / 2;
  return Math.min(1, Math.max(0.1, light));
}

export function moodLabel(light: number) {
  if (light > 0.75) return "glowing";
  if (light > 0.5) return "warm";
  if (light > 0.25) return "dimming";
  return "dark";
}

// average light of every house: how "alive" the village is (0 to 1)
export function villageHealth(people: Person[]) {
  if (people.length === 0) return 0;
  const total = people.reduce((sum, p) => sum + lightLevel(p), 0);
  return total / people.length;
}

// ---------- organic shapes ----------

const BLOB_SHAPES = [
  "58% 42% 47% 53% / 45% 55% 45% 55%",
  "42% 58% 60% 40% / 55% 40% 60% 45%",
  "50% 50% 38% 62% / 60% 48% 52% 40%",
  "62% 38% 52% 48% / 42% 58% 42% 58%",
  "45% 55% 55% 45% / 50% 62% 38% 50%",
];

// the same person always gets the same shape
export function blobShape(id: string) {
  let sum = 0;
  for (const ch of id) sum += ch.charCodeAt(0);
  return BLOB_SHAPES[sum % BLOB_SHAPES.length];
}

// ---------- saving and loading (localStorage) ----------

const STORAGE_KEY = "kinlight:people";
const BACKUP_KEY = "kinlight:people:backup";

export function loadPeople(): Person[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("saved data is not a list");
    // fill in anything older saves might be missing
    return (parsed as Person[]).map((p) => ({
      ...p,
      checkInHistory: p.checkInHistory ?? [],
      frequency: FREQUENCY_DAYS[p.frequency] ? p.frequency : "weekly",
    }));
  } catch {
    // the data looks damaged: keep a copy so nothing is lost for good
    try {
      if (raw) localStorage.setItem(BACKUP_KEY, raw);
    } catch {
      /* nothing more we can do */
    }
    return [];
  }
}

// returns false if the browser refused to save
export function savePeople(people: Person[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(people));
    return true;
  } catch {
    return false;
  }
}