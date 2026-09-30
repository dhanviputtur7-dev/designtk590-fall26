"use client";

import { daysSince, lightLevel, moodLabel, blobShape } from "../lib/village";
import type { Person } from "../lib/village";
import LocalTime from "./LocalTime";

type Props = {
  person: Person;
  isCheckedIn: boolean;
  onCheckIn: () => void;
  onMessage: () => void;
  onRemove: () => void;
};

const pastelColors = [
  "#66C5CC",
  "#F6CF71",
  "#F89C74",
  "#DCB0F2",
  "#87C55F",
  "#9EB9F3",
  "#FE88B1",
  "#C9DB74",
  "#8BE0A4",
  "#B497E7",
  "#B3B3B3",
];

export default function VillageIsland({
  person,
  isCheckedIn,
  onCheckIn,
  onMessage,
  onRemove,
}: Props) {
  const light = lightLevel(person);
  const days = daysSince(person.lastCheckIn);
  const colorIndex = person.id.charCodeAt(0) % pastelColors.length;
  const lightColor = pastelColors[colorIndex];
  const fillAmount = Math.round(18 + light * 18);
  const glowAmount = Math.round(light * 28);

  return (
    <div
      className={light > 0.6 ? "island breathing" : "island"}
      style={{
        borderRadius: blobShape(person.id),
        background: `color-mix(in srgb, ${lightColor} ${fillAmount}%, transparent)`,
        border: `1px solid ${lightColor}`,
        boxShadow: `0 0 ${glowAmount}px color-mix(in srgb, ${lightColor} 35%, transparent)`,
      }}
    >
      <span
        className="house-icon"
        style={{
          filter: `grayscale(${1 - light}) brightness(${0.35 + light * 0.65})`,
        }}
      >
        🏠
      </span>

      <strong className="person-name">{person.name}</strong>

      <span className="person-detail">
        {person.relationship} · {moodLabel(light)}
      </span>

      <span className="person-detail">
        {days} {days === 1 ? "day" : "days"} since check-in
      </span>

      {person.timezone && person.city && (
        <div className="person-time">
          <LocalTime timezone={person.timezone} city={person.city} />
        </div>
      )}

      <div className="person-actions">
        <button className="btn btn-primary" onClick={onCheckIn}>
          Check in
        </button>

        <button
          className="btn"
          onClick={onMessage}
          aria-label={`Message ideas for ${person.name}`}
        >
          💬
        </button>

        <button
          className="btn btn-ghost"
          onClick={onRemove}
          aria-label={`Remove ${person.name}`}
        >
          ✕
        </button>
      </div>

      {isCheckedIn && (
        <p className="check-in-success" role="status">
          ✓ Checked in!
        </p>
      )}
    </div>
  );
}