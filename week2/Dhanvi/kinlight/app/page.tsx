"use client";

import { useState, useEffect, useRef } from "react";
import AddPersonForm from "./components/AddPersonForm";
import VillageIsland from "./components/VillageIsland";
import VillageHealth from "./components/VillageHealth";
import {
  daysSince,
  overdueRatio,
  villageHealth,
  randomMessage,
  loadPeople,
  savePeople,
  lightLevel,
  moodLabel,
} from "./lib/village";
import type { Person } from "./lib/village";

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

export default function HomePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [messagePersonId, setMessagePersonId] = useState<string | null>(null);
  const [suggestedMessage, setSuggestedMessage] = useState("");
  const [checkedInPersonId, setCheckedInPersonId] = useState<string | null>(
    null
  );
  const [showPlaces, setShowPlaces] = useState(false);
  const [, setTick] = useState(0);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPeople(loadPeople());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    setSaveFailed(!savePeople(people));
  }, [people, isLoaded]);

  useEffect(() => {
    const timer = setInterval(() => setTick((tick) => tick + 1), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  function addPerson(person: Person) {
    setPeople((previousPeople) => [...previousPeople, person]);
  }

  function checkIn(id: string) {
    const now = new Date().toISOString();

    setPeople((previousPeople) =>
      previousPeople.map((person) =>
        person.id === id
          ? {
              ...person,
              lastCheckIn: now,
              checkInHistory: [...person.checkInHistory, now],
            }
          : person
      )
    );

    setCheckedInPersonId(id);

    window.setTimeout(() => {
      setCheckedInPersonId(null);
    }, 2500);
  }

  function removePerson(person: Person) {
    if (!window.confirm(`Remove ${person.name} from your village?`)) return;

    setPeople((previousPeople) =>
      previousPeople.filter((savedPerson) => savedPerson.id !== person.id)
    );

    if (messagePersonId === person.id) {
      setMessagePersonId(null);
    }
  }

  function openMessage(person: Person) {
    setMessagePersonId(person.id);
    setSuggestedMessage(randomMessage(person.name));
  }

  function copyMessage() {
    navigator.clipboard?.writeText(suggestedMessage);
  }

  function focusAddForm() {
    nameInputRef.current?.focus();
    nameInputRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  const sortedPeople = [...people].sort(
    (personA, personB) => overdueRatio(personB) - overdueRatio(personA)
  );

  const health = villageHealth(people);

  const checkInsThisWeek = people.reduce(
    (count, person) =>
      count +
      person.checkInHistory.filter((date) => daysSince(date) < 7).length,
    0
  );

  const peopleByPlace: Record<string, Person[]> = {};

  people.forEach((person) => {
    const place = person.city || "Place not set";

    if (!peopleByPlace[place]) {
      peopleByPlace[place] = [];
    }

    peopleByPlace[place].push(person);
  });

  return (
    <div
      className="page"
      style={{
        background: `radial-gradient(ellipse at top, rgba(219, 183, 93, ${health * 0.16}), transparent 65%), #f7f5ed`,
      }}
    >
      <main className="page-content">
        <h1 className="brand-title">Kinlight</h1>

        <p className="intro-question">
          Who would you like to check in on?
        </p>

        {saveFailed && (
          <p className="save-error">
            Your browser couldn&apos;t save your village. Changes may be lost
            when you close this tab.
          </p>
        )}

        {people.length > 0 && (
          <VillageHealth
            health={health}
            checkInsThisWeek={checkInsThisWeek}
          />
        )}

        <div className="add-person">
          <AddPersonForm
            onAdd={addPerson}
            nameInputRef={nameInputRef}
          />
        </div>

        <div className="village">
          {sortedPeople.map((person) => (
            <div key={person.id}>
              <VillageIsland
                person={person}
                isCheckedIn={checkedInPersonId === person.id}
                onCheckIn={() => checkIn(person.id)}
                onMessage={() => openMessage(person)}
                onRemove={() => removePerson(person)}
              />

              {messagePersonId === person.id && (
                <div className="message-box">
                  <p>{suggestedMessage}</p>

                  <div className="message-actions">
                    <button className="btn" onClick={copyMessage}>
                      Copy
                    </button>

                    <button
                      className="btn"
                      onClick={() => openMessage(person)}
                    >
                      Try another
                    </button>

                    <button
                      className="btn btn-ghost"
                      onClick={() => setMessagePersonId(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            className="island island-add"
            style={{
              borderRadius: "48% 52% 44% 56% / 56% 44% 56% 44%",
            }}
            onClick={focusAddForm}
          >
            <span className="add-icon">＋</span>
            {people.length === 0
              ? "Your village is empty. Add your first person."
              : "Add someone"}
          </button>
        </div>

        {people.length > 0 && (
          <section className="places-section">
            <button
              className="btn places-button"
              onClick={() => setShowPlaces(!showPlaces)}
              aria-expanded={showPlaces}
            >
              {showPlaces ? "Hide places" : "Explore by place"}
            </button>

            {showPlaces && (
              <div className="places-grid">
                {Object.entries(peopleByPlace).map(([place, placePeople]) => (
                  <section className="place-village" key={place}>
                    <h2>{place}</h2>
                    <p>
                      {placePeople.length}{" "}
                      {placePeople.length === 1 ? "person" : "people"}
                    </p>

                    <div className="place-people">
                      {placePeople.map((person) => {
                        const light = lightLevel(person);
                        const colorIndex =
                          person.id.charCodeAt(0) % pastelColors.length;
                        const color = pastelColors[colorIndex];

                        return (
                          <div className="place-person" key={person.id}>
                            <span
                              className="place-dot"
                              style={{
                                backgroundColor: color,
                                opacity: 0.3 + light * 0.7,
                              }}
                            />
                            <span>{person.name}</span>
                            <span className="place-mood">
                              {moodLabel(light)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}