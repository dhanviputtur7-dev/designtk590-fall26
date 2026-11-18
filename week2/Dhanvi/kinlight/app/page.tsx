"use client";

import { useEffect, useRef, useState } from "react";
import AddPersonForm from "./components/AddPersonForm";
import KinlightWordmark from "./components/KinlightWordmark";
import VillageLandscape from "./components/VillageLandscape";
import YourClock from "./components/YourClock";
import SketchFilters from "./components/SketchFilters";
import CornerActions from "./components/CornerActions";
import VillageIsland from "./components/VillageIsland";
import VillageHealth from "./components/VillageHealth";
import MessageIdeasDrawer from "./components/MessageIdeasDrawer";
import {
  daysSince,
  daysUntilBirthday,
  formatBirthday,
  loadPeople,
  overdueRatio,
  savePeople,
  villageHealth,
} from "./lib/village";
import type { Person } from "./lib/village";

export default function HomePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [checkedInPersonId, setCheckedInPersonId] = useState<string | null>(
    null
  );
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [isIdeasPanelOpen, setIsIdeasPanelOpen] = useState(false);
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

  useEffect(() => {
    if (!isAddPanelOpen && !isIdeasPanelOpen) return;

    if (isAddPanelOpen) nameInputRef.current?.focus();
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsAddPanelOpen(false);
        setIsIdeasPanelOpen(false);
      }
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isAddPanelOpen, isIdeasPanelOpen]);

  function addPerson(person: Person) {
    setPeople((previousPeople) => [...previousPeople, person]);
    setIsAddPanelOpen(false);
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

    // the "Checked in!" confirmation stays up for about 4 seconds
    window.setTimeout(() => {
      setCheckedInPersonId((current) => (current === id ? null : current));
    }, 4000);
  }

  function updatePerson(updated: Person) {
    setPeople((previousPeople) =>
      previousPeople.map((person) => (person.id === updated.id ? updated : person))
    );
  }

  function removePerson(person: Person) {
    if (!window.confirm(`Remove ${person.name} from your village?`)) return;

    setPeople((previousPeople) =>
      previousPeople.filter((savedPerson) => savedPerson.id !== person.id)
    );
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

  const upcomingBirthdays = people
    .flatMap((person) => {
      if (!person.birthday) return [];

      const days = daysUntilBirthday(person.birthday);

      if (days === null || days > 30) return [];

      return [{ person, days, birthday: person.birthday }];
    })
    .sort((a, b) => a.days - b.days);

  return (
    <div className="page">
      <SketchFilters />
      <VillageLandscape />
      <main className="page-content">
        <header className="village-header">
          {people.length > 0 && <div className="header-health-slot"><VillageHealth health={health} checkInsThisWeek={checkInsThisWeek} /></div>}
          <div className="brand-lockup">
            <h1 className="brand-title" aria-label="Kinlight"><KinlightWordmark /></h1>
            <CornerActions
              onAddPerson={() => setIsAddPanelOpen(true)}
              onMessageIdeas={() => setIsIdeasPanelOpen(true)}
              isAddOpen={isAddPanelOpen}
            />
          </div>
          <div className="header-actions">
          <YourClock />
          </div>
        </header>

        {saveFailed && <p className="save-error" role="alert">Your browser couldn&apos;t save your village. Changes may be lost when you close this tab.</p>}

        <section className="village-scene" aria-labelledby="village-heading">
          <div className="scene-heading">
            <h2 id="village-heading">Your village</h2>
          </div>
          {people.length === 0 ? (
            <div className="empty-village"><span className="empty-village-art" aria-hidden="true">⌂</span><p>Your village is waiting for its first neighbor.</p><button className="btn btn-primary" onClick={() => setIsAddPanelOpen(true)}>Add your first person</button></div>
          ) : (
            <div className="village">
              {sortedPeople.map((person) => (
                <div key={person.id}>
                  <VillageIsland person={person} isCheckedIn={checkedInPersonId === person.id} onCheckIn={() => checkIn(person.id)} onRemove={() => removePerson(person)} onUpdate={updatePerson} />
                </div>
              ))}
            </div>
          )}
        </section>

        {people.length > 0 && <div className="village-supporting">
          {upcomingBirthdays.length > 0 && <section className="birthday-section" aria-labelledby="birthdays-heading">
            <div className="birthday-heading"><h2 id="birthdays-heading">Upcoming birthdays in your village</h2><span>Next 30 days</span></div>
            <ul className="birthday-list">{upcomingBirthdays.map(({ person, days, birthday }) => <li className="birthday-item" key={person.id}><span className="birthday-flower" aria-hidden="true">✿</span><div className="birthday-person"><strong>{person.name}</strong><span>{formatBirthday(birthday)}</span></div><span className="birthday-countdown">{days === 0 ? "Today!" : days === 1 ? "Tomorrow" : `In ${days} days`}</span></li>)}</ul>
          </section>}
        </div>}


      </main>

      {/* Add person + message ideas live in the bottom-right corner */}

      {isIdeasPanelOpen && <MessageIdeasDrawer
        people={people}
        onClose={() => setIsIdeasPanelOpen(false)}
        onAddPerson={() => { setIsIdeasPanelOpen(false); setIsAddPanelOpen(true); }}
      />}

      {isAddPanelOpen && <div className="drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsAddPanelOpen(false); }}>
        <section className="add-person-drawer" role="dialog" aria-modal="true" aria-labelledby="add-person-title">
          <div className="drawer-heading"><div><p className="eyebrow">Make room in your village</p><h2 id="add-person-title">Add a person</h2></div><button className="drawer-close" onClick={() => setIsAddPanelOpen(false)} aria-label="Close add person panel">×</button></div>
          <p className="drawer-copy">A few details help Kinlight keep their neighborhood in view.</p>
          <AddPersonForm onAdd={addPerson} nameInputRef={nameInputRef} />
        </section>
      </div>}
    </div>
  );
}
