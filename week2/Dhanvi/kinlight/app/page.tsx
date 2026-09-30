"use client";

import { useState, useEffect } from "react";
import { geocodeCity } from "./lib/time";
import LocalTime from "./components/LocalTime";

type Frequency = "daily" | "weekly" | "biweekly" | "monthly";

type Person = {
  id: string;
  name: string;
  relationship: string;
  frequency: Frequency;
  lastCheckIn: string; // ISO date string
  checkInHistory: string[]; // ISO dates of every check-in ever
  city?: string;
  timezone?: string;
};

const FREQUENCY_DAYS: Record<Frequency, number> = {
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

// shared styles so the JSX below stays short
const inputStyle = {
  flex: 1,
  minWidth: 120,
  padding: "0.5rem",
  background: "transparent",
  border: "1px solid #444",
  borderRadius: 6,
  color: "inherit",
} as const;

const smallButton = {
  padding: "0.4rem 0.8rem",
  borderRadius: 6,
  border: "1px solid #666",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
} as const;

const ghostButton = {
  padding: "0.4rem 0.6rem",
  borderRadius: 6,
  border: "none",
  background: "transparent",
  color: "#999",
  cursor: "pointer",
} as const;

function daysSince(dateStr: string) {
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

function overdueRatio(person: Person) {
  const elapsed = daysSince(person.lastCheckIn);
  const target = FREQUENCY_DAYS[person.frequency];
  return elapsed / target;
}

function houseGlow(ratio: number) {
  if (ratio < 0.5) return { emoji: "🏠", label: "glowing" };
  if (ratio < 1) return { emoji: "🏡", label: "warm" };
  if (ratio < 1.5) return { emoji: "🏚️", label: "dimming" };
  return { emoji: "🌑", label: "dark" };
}

function randomMessage(name: string) {
  const base =
    MESSAGE_TEMPLATES[Math.floor(Math.random() * MESSAGE_TEMPLATES.length)];
  return base.replace("Hey!", `Hey ${name}!`).replace("Hi!", `Hi ${name}!`);
}

export default function HomePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [city, setCity] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("weekly");
  const [isLoaded, setIsLoaded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [messagePersonId, setMessagePersonId] = useState<string | null>(null);
  const [suggestedMessage, setSuggestedMessage] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("kinlight:people");
    if (saved) setPeople(JSON.parse(saved));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("kinlight:people", JSON.stringify(people));
    }
  }, [people, isLoaded]);

  async function addPerson(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setFormError(null);
    setAdding(true);

    let cityName: string | undefined;
    let timezone: string | undefined;

    try {
      if (city.trim()) {
        const place = await geocodeCity(city.trim());
        if (!place) {
          setFormError("We couldn't find that city. Try a nearby larger one.");
          return;
        }
        cityName = place.name;
        timezone = place.timezone;
      }
    } catch {
      setFormError("Couldn't look up that city. Try again.");
      return;
    } finally {
      setAdding(false);
    }

    const newPerson: Person = {
      id: crypto.randomUUID(),
      name: name.trim(),
      relationship: relationship.trim() || "friend",
      frequency,
      lastCheckIn: new Date().toISOString(),
      checkInHistory: [],
      city: cityName,
      timezone,
    };

    setPeople((prev) => [...prev, newPerson]);
    setName("");
    setRelationship("");
    setCity("");
    setFrequency("weekly");
  }

  function checkIn(id: string) {
    const now = new Date().toISOString();
    setPeople((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, lastCheckIn: now, checkInHistory: [...p.checkInHistory, now] }
          : p
      )
    );
  }

  function removePerson(id: string) {
    setPeople((prev) => prev.filter((p) => p.id !== id));
    if (messagePersonId === id) setMessagePersonId(null);
  }

  function openMessageSuggestion(person: Person) {
    setMessagePersonId(person.id);
    setSuggestedMessage(randomMessage(person.name));
  }

  function copyMessage() {
    navigator.clipboard?.writeText(suggestedMessage);
  }

  // sort most overdue first
  const sortedPeople = [...people].sort(
    (a, b) => overdueRatio(b) - overdueRatio(a)
  );

  // playful tracker: how many check-ins happened in the last 7 days
  const checkInsThisWeek = people.reduce((count, p) => {
    const recent = p.checkInHistory.filter((d) => daysSince(d) < 7).length;
    return count + recent;
  }, 0);

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>
        🏠 Kinlight
      </h1>
      <p style={{ opacity: 0.7, marginBottom: "0.5rem" }}>
        Life gets busy, and the people you love most are often the easiest to
        lose track of.
      </p>

      {people.length > 0 && (
        <p style={{ opacity: 0.6, fontSize: "0.9rem", marginBottom: "2rem" }}>
          ✨ You've checked in with {checkInsThisWeek}{" "}
          {checkInsThisWeek === 1 ? "person" : "people"} this week
        </p>
      )}

      <form
        onSubmit={addPerson}
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "2.5rem",
          flexWrap: "wrap",
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          style={inputStyle}
        />
        <input
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          placeholder="Relationship"
          style={inputStyle}
        />
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City, Country (e.g. Mangalore, India)"
          style={inputStyle}
        />
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as Frequency)}
          style={{ ...inputStyle, flex: "none", minWidth: 0 }}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="biweekly">Bi-weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <button
          type="submit"
          disabled={adding}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: 6,
            border: "1px solid #666",
            background: "#fff",
            color: "#000",
            cursor: "pointer",
          }}
        >
          {adding ? "Adding..." : "Add"}
        </button>
      </form>

      {formError && (
        <p style={{ color: "#e07a7a", marginTop: "-1.5rem", marginBottom: "1.5rem" }}>
          {formError}
        </p>
      )}

      {sortedPeople.length === 0 ? (
        <p style={{ opacity: 0.6 }}>Your village is empty. Add someone above.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {sortedPeople.map((person) => {
            const ratio = overdueRatio(person);
            const glow = houseGlow(ratio);
            const days = daysSince(person.lastCheckIn);

            return (
              <div key={person.id}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "1rem",
                    border: "1px solid #333",
                    borderRadius: 10,
                  }}
                >
                  <span style={{ fontSize: "2rem" }}>{glow.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{person.name}</div>
                    <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>
                      {person.relationship} · {days}{" "}
                      {days === 1 ? "day" : "days"} since last check-in ·{" "}
                      {glow.label}
                    </div>

                    {person.timezone && person.city && (
                      <div style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                        <LocalTime timezone={person.timezone} city={person.city} />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => openMessageSuggestion(person)}
                    style={smallButton}
                  >
                    💬
                  </button>
                  <button onClick={() => checkIn(person.id)} style={smallButton}>
                    Check in
                  </button>
                  <button
                    onClick={() => removePerson(person.id)}
                    style={ghostButton}
                    aria-label={`Remove ${person.name}`}
                  >
                    ✕
                  </button>
                </div>

                {messagePersonId === person.id && (
                  <div
                    style={{
                      marginTop: "0.5rem",
                      padding: "0.75rem",
                      border: "1px dashed #555",
                      borderRadius: 8,
                      fontSize: "0.9rem",
                    }}
                  >
                    <p style={{ marginBottom: "0.5rem" }}>{suggestedMessage}</p>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={copyMessage}
                        style={{ ...smallButton, padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => openMessageSuggestion(person)}
                        style={{ ...smallButton, padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}
                      >
                        Try another
                      </button>
                      <button
                        onClick={() => setMessagePersonId(null)}
                        style={{ ...ghostButton, padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}