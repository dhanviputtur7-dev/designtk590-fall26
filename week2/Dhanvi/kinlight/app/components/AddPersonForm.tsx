"use client";

import { useState, type FormEvent, type RefObject } from "react";
import { geocodeCity } from "../lib/time";
import type { Frequency, Person } from "../lib/village";

type Props = {
  onAdd: (person: Person) => void;
  nameInputRef: RefObject<HTMLInputElement | null>;
};

function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function AddPersonForm({ onAdd, nameInputRef }: Props) {
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [city, setCity] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("weekly");
  const [lastContactDate, setLastContactDate] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!name.trim() || !lastContactDate) return;

    if (lastContactDate > getToday()) {
      setError("Choose today or an earlier date.");
      return;
    }

    setError(null);
    setAdding(true);

    let cityName: string | undefined;
    let timezone: string | undefined;

    try {
      if (city.trim()) {
        const place = await geocodeCity(city.trim());

        if (!place) {
          setError(
            "We couldn't find that city. Try adding the country, like Mangalore, India."
          );
          return;
        }

        cityName = place.name;
        timezone = place.timezone;
      }
    } catch {
      setError("Couldn't look up that city. Check your connection and try again.");
      return;
    } finally {
      setAdding(false);
    }

    const selectedDate = new Date(`${lastContactDate}T12:00:00`);
    const lastCheckIn =
      lastContactDate === getToday()
        ? new Date().toISOString()
        : selectedDate.toISOString();

    onAdd({
      id: crypto.randomUUID(),
      name: name.trim(),
      relationship: relationship.trim() || "friend",
      frequency,
      lastCheckIn,
      checkInHistory: [],
      city: cityName,
      timezone,
    });

    setName("");
    setRelationship("");
    setCity("");
    setFrequency("weekly");
    setLastContactDate("");
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
      >
        <input
          ref={nameInputRef}
          className="field"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Name"
          required
        />

        <input
          className="field"
          value={relationship}
          onChange={(event) => setRelationship(event.target.value)}
          placeholder="Relationship"
        />

        <label className="date-field">
          Last reached out
          <input
            className="field"
            type="date"
            value={lastContactDate}
            max={getToday()}
            onChange={(event) => setLastContactDate(event.target.value)}
            required
          />
        </label>

        <input
          className="field"
          style={{ minWidth: 230 }}
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="City, Country (e.g. Mangalore, India)"
        />

        <select
          className="field"
          style={{ flex: "none", minWidth: 0 }}
          value={frequency}
          onChange={(event) =>
            setFrequency(event.target.value as Frequency)
          }
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="biweekly">Bi-weekly</option>
          <option value="monthly">Monthly</option>
        </select>

        <button type="submit" className="btn btn-primary" disabled={adding}>
          {adding ? "Adding..." : "Add"}
        </button>
      </form>

      {error && <p className="form-error">{error}</p>}
    </>
  );
}