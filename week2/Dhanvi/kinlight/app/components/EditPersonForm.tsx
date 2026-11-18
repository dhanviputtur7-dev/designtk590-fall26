"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { geocodeCity } from "../lib/time";
import type { Frequency, Person } from "../lib/village";
import BirthdayPicker from "./BirthdayPicker";

/*
  Edit someone without deleting and re-adding them. Opens inside their
  neighborhood's details. Every field from the add form can be changed;
  the city is only looked up again if it was actually changed.
*/

type Props = {
  person: Person;
  onSave: (person: Person) => void;
  onCancel: () => void;
};

function toDateInput(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function today() {
  return toDateInput(new Date().toISOString());
}

export default function EditPersonForm({ person, onSave, onCancel }: Props) {
  const originalDate = toDateInput(person.lastCheckIn);
  const [name, setName] = useState(person.name);
  const [relationship, setRelationship] = useState(person.relationship);
  const [lastContactDate, setLastContactDate] = useState(originalDate);
  const [birthday, setBirthday] = useState(person.birthday ?? "");
  const [city, setCity] = useState(person.city ?? "");
  const [frequency, setFrequency] = useState<Frequency>(person.frequency);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const prefix = `edit-${person.id}`;

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !lastContactDate) return;
    if (lastContactDate > today()) {
      setError("Choose today or an earlier date for when you last reached out.");
      return;
    }

    setError(null);
    let cityName = person.city;
    let timezone = person.timezone;
    const typedCity = city.trim();

    if (!typedCity) {
      cityName = undefined;
      timezone = undefined;
    } else if (typedCity !== person.city) {
      setSaving(true);
      try {
        const place = await geocodeCity(typedCity);
        if (!place) {
          setError("We couldn't find that city. Try adding the country, like Mangalore, India.");
          return;
        }
        cityName = place.name;
        timezone = place.timezone;
      } catch {
        setError("Couldn't look up that city. Check your connection and try again.");
        return;
      } finally {
        setSaving(false);
      }
    }

    const lastCheckIn =
      lastContactDate === originalDate
        ? person.lastCheckIn
        : lastContactDate === today()
          ? new Date().toISOString()
          : new Date(`${lastContactDate}T12:00:00`).toISOString();

    onSave({
      ...person,
      name: name.trim(),
      relationship: relationship.trim() || "friend",
      lastCheckIn,
      birthday: birthday || undefined,
      city: cityName,
      timezone,
      frequency,
    });
  }

  return (
    <form
      className="edit-person-form"
      onSubmit={handleSubmit}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onCancel();
        }
      }}
      aria-label={`Edit ${person.name}`}
    >
      <label htmlFor={`${prefix}-name`}>
        Name
        <input id={`${prefix}-name`} ref={nameRef} className="field" value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label htmlFor={`${prefix}-relationship`}>
        Relationship
        <input id={`${prefix}-relationship`} className="field" value={relationship} onChange={(e) => setRelationship(e.target.value)} />
      </label>
      <label htmlFor={`${prefix}-last`}>
        Last reached out
        <input
          id={`${prefix}-last`}
          className="field"
          type="date"
          value={lastContactDate}
          max={today()}
          onChange={(e) => setLastContactDate(e.target.value)}
          required
        />
      </label>
      <BirthdayPicker idPrefix={`${prefix}-birthday`} value={birthday} onChange={setBirthday} />
      <label htmlFor={`${prefix}-city`}>
        City, Country
        <input
          id={`${prefix}-city`}
          className="field"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="e.g. Mangalore, India"
        />
      </label>
      <label htmlFor={`${prefix}-frequency`}>
        Check-in rhythm
        <select id={`${prefix}-frequency`} className="field" value={frequency} onChange={(e) => setFrequency(e.target.value as Frequency)}>
          <option value="daily">Every day</option>
          <option value="weekly">Every week</option>
          <option value="biweekly">Every 2 weeks</option>
          <option value="monthly">Every month</option>
        </select>
      </label>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="edit-person-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
