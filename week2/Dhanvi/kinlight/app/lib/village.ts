export type Frequency = "daily" | "weekly" | "biweekly" | "monthly";

export type Person = {
  id: string;
  name: string;
  relationship: string;
  frequency: Frequency;
  lastCheckIn: string;
  checkInHistory: string[];
  city?: string;
  timezone?: string;
  birthday?: string; // Stored as MM-DD, without the birth year
};

export const FREQUENCY_DAYS: Record<Frequency, number> = {
  daily: 1,
  weekly: 7,
  biweekly: 14,
  monthly: 30,
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function daysSince(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / MS_PER_DAY);
}

export function daysUntilBirthday(
  birthday: string,
  fromDate = new Date()
): number | null {
  const [month, day] = birthday.split("-").map(Number);

  if (
    !month ||
    !day ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > new Date(2000, month, 0).getDate()
  ) {
    return null;
  }

  const year = fromDate.getFullYear();
  const today = Date.UTC(year, fromDate.getMonth(), fromDate.getDate());

  function birthdayDate(targetYear: number) {
    const lastDayOfMonth = new Date(targetYear, month, 0).getDate();

    return Date.UTC(
      targetYear,
      month - 1,
      Math.min(day, lastDayOfMonth)
    );
  }

  let nextBirthday = birthdayDate(year);

  if (nextBirthday < today) {
    nextBirthday = birthdayDate(year + 1);
  }

  return Math.round((nextBirthday - today) / MS_PER_DAY);
}

export function formatBirthday(birthday: string) {
  const [month, day] = birthday.split("-").map(Number);

  if (!month || !day) return birthday;

  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
  }).format(new Date(2000, month - 1, day));
}

export function overdueRatio(person: Person) {
  const days =
    (Date.now() - new Date(person.lastCheckIn).getTime()) / MS_PER_DAY;

  return days / FREQUENCY_DAYS[person.frequency];
}

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

export function villageHealth(people: Person[]) {
  if (people.length === 0) return 0;

  const total = people.reduce((sum, person) => sum + lightLevel(person), 0);

  return total / people.length;
}

const BLOB_SHAPES = [
  "58% 42% 47% 53% / 45% 55% 45% 55%",
  "42% 58% 60% 40% / 55% 40% 60% 45%",
  "50% 50% 38% 62% / 60% 48% 52% 40%",
  "62% 38% 52% 48% / 42% 58% 42% 58%",
  "45% 55% 55% 45% / 50% 62% 38% 50%",
];

export function blobShape(id: string) {
  let sum = 0;

  for (const character of id) {
    sum += character.charCodeAt(0);
  }

  return BLOB_SHAPES[sum % BLOB_SHAPES.length];
}

const STORAGE_KEY = "kinlight:people";
const BACKUP_KEY = "kinlight:people:backup";

export function loadPeople(): Person[] {
  let raw: string | null = null;

  try {
    raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      throw new Error("Saved data is not a list.");
    }

    return (parsed as Person[]).map((person) => ({
      ...person,
      checkInHistory: person.checkInHistory ?? [],
      frequency: FREQUENCY_DAYS[person.frequency] ? person.frequency : "weekly",
    }));
  } catch {
    try {
      if (raw) {
        localStorage.setItem(BACKUP_KEY, raw);
      }
    } catch {
      // The app can still load if the backup cannot be saved.
    }

    return [];
  }
}

export function savePeople(people: Person[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(people));
    return true;
  } catch {
    return false;
  }
}