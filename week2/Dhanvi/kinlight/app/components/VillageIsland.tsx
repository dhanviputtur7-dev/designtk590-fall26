"use client";

import { useState } from "react";
import { daysSince, daysUntilBirthday, formatBirthday, lightLevel, moodLabel } from "../lib/village";
import type { Person } from "../lib/village";
import LocalTime from "./LocalTime";
import NeighborhoodArt from "./NeighborhoodArt";
import IslandShell from "./IslandShell";
import BirthdayDecor from "./BirthdayDecor";
import EditPersonForm from "./EditPersonForm";

type Props = {
  person: Person;
  isCheckedIn: boolean;
  onCheckIn: () => void;
  onRemove: () => void;
  onUpdate: (person: Person) => void;
};

export default function VillageIsland({
  person,
  isCheckedIn,
  onCheckIn,
  onRemove,
  onUpdate,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const birthdayIn = person.birthday ? daysUntilBirthday(person.birthday) : null;
  const light = lightLevel(person);
  const days = daysSince(person.lastCheckIn);
  const mood = moodLabel(light);
  const reachedOutDate = new Date(person.lastCheckIn);
  const formattedReachedOut = Number.isNaN(reachedOutDate.getTime())
    ? "Unknown"
    : new Intl.DateTimeFormat(undefined, { month: "long", day: "numeric", year: "numeric" }).format(reachedOutDate);
  const frequencyLabel: Record<typeof person.frequency, string> = {
    daily: "Every day",
    weekly: "Every week",
    biweekly: "Every 2 weeks",
    monthly: "Every month",
  };
  const detailsId = `person-details-${person.id}`;

  return (
    <div
      className={`island island--${mood}${light > 0.6 ? " breathing" : ""}${birthdayIn === 0 ? " island--birthday" : ""}`}
      role="group"
      aria-label={`${person.name}, ${person.relationship}. ${days} days since check-in. ${moodLabel(light)}.`}
      style={{
        background: "transparent",
        border: "none",
        boxShadow: "none",
      }}
    >
      <IslandShell person={person} light={light} />
      {birthdayIn !== null && birthdayIn <= 2 && <BirthdayDecor daysUntil={birthdayIn} name={person.name} />}
      <button
        className="island-main"
        type="button"
        aria-expanded={isExpanded}
        aria-controls={detailsId}
        aria-label={`${isExpanded ? "Hide" : "Show"} details for ${person.name}`}
        onClick={() => {
          setIsExpanded(!isExpanded);
          setIsEditing(false);
        }}
      >
        <NeighborhoodArt person={person} light={light} />
        <strong className="person-name">{person.name}</strong>
        <span className="person-meta">
          {person.relationship} · {days === 0 ? "checked in today" : `${days} ${days === 1 ? "day" : "days"} since you checked in`}
        </span>
        {!isExpanded && person.timezone && person.city && (
          <div className="person-time">
            <LocalTime timezone={person.timezone} city={person.city} />
          </div>
        )}
        <span className={`light-status light-status--${mood}`}>
          <span aria-hidden="true">{mood === "dark" || mood === "dimming" ? "☾" : "☀"}</span>
          {mood === "glowing" ? "Glowing" : mood === "warm" ? "Warm" : mood === "dimming" ? "Dimming" : "Gone dark"}
        </span>
        <span className="island-details-hint">{isExpanded ? "Close details" : "View details"}</span>
      </button>

      {isExpanded && (
        <section className="island-details" id={detailsId} aria-label={`${person.name}'s details`}>
          {isEditing ? (
            <EditPersonForm
              person={person}
              onCancel={() => setIsEditing(false)}
              onSave={(updated) => {
                onUpdate(updated);
                setIsEditing(false);
              }}
            />
          ) : (
            <>
              <dl>
                <div><dt>Relationship</dt><dd>{person.relationship}</dd></div>
                <div><dt>Last reached out</dt><dd>{formattedReachedOut} · {days} {days === 1 ? "day" : "days"} ago</dd></div>
                <div><dt>Check-in rhythm</dt><dd>{frequencyLabel[person.frequency]}</dd></div>
                <div><dt>Birthday</dt><dd>{person.birthday ? formatBirthday(person.birthday) : "Not added yet"}</dd></div>
                {person.timezone && person.city ? (
                  <div className="island-location-detail"><dt>Local time</dt><dd><LocalTime timezone={person.timezone} city={person.city} detailed /></dd></div>
                ) : (
                  <div><dt>Location</dt><dd>Not added yet</dd></div>
                )}
              </dl>
              <button type="button" className="btn btn-ghost island-edit-button" onClick={() => setIsEditing(true)} aria-label={`Edit ${person.name}`}>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M4 20h4L19 9l-4-4L4 16Z" fill="#f6cf71" stroke="#2c4337" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="m13.5 6.5 4 4" stroke="#2c4337" strokeWidth="1.8" />
                </svg>
                Edit
              </button>
            </>
          )}
        </section>
      )}

      <div className="person-actions">
        <button className="btn btn-primary" onClick={onCheckIn}>
          Check in
        </button>
        <button
          className="island-remove-button"
          onClick={onRemove}
          aria-label={`Remove ${person.name}`}
          title={`Remove ${person.name}`}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="m7 7 10 10M17 7 7 17" fill="none" stroke="#805f4c" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M5 5c3-2 5-2 7-1m7 2c2 3 2 5 1 7m-2 6c-3 2-5 2-7 1m-6-2c-2-3-2-5-1-7" fill="none" stroke="#c18b5c" strokeWidth="1" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* visible confirmation after Check in; also announced to screen readers */}
      <span className="check-in-toast-slot" role="status" aria-live="polite">
        {isCheckedIn && (
          <span className="check-in-toast">
            <span aria-hidden="true">✓</span> Checked in with {person.name}!
          </span>
        )}
      </span>
    </div>
  );
}
