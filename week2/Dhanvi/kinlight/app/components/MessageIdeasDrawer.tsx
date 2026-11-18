"use client";

import { useState } from "react";
import { daysUntilBirthday, formatBirthday } from "../lib/village";
import type { Person } from "../lib/village";

type Closeness = "very-close" | "close" | "getting-to-know";
type Intent = "casual" | "long-gap" | "specific" | "birthday";

type Props = {
  people: Person[];
  onClose: () => void;
  onAddPerson: () => void;
};

const CLOSENESS: { value: Closeness; label: string }[] = [
  { value: "very-close", label: "Very close" },
  { value: "close", label: "Close" },
  { value: "getting-to-know", label: "Still getting to know each other" },
];

const INTENTS: { value: Intent; label: string }[] = [
  { value: "casual", label: "A casual check-in" },
  { value: "long-gap", label: "It’s been a while" },
  { value: "specific", label: "Following up on something" },
  { value: "birthday", label: "A birthday message" },
];

/* when someone's birthday is relative to today */
function birthdayTiming(person: Person) {
  if (!person.birthday) return { kind: "today" as const, days: 0 };
  const days = daysUntilBirthday(person.birthday);
  if (days === null || days === 0) return { kind: "today" as const, days: 0 };
  if (365 - days <= 7) return { kind: "belated" as const, days };
  return { kind: "upcoming" as const, days };
}

function birthdayIdeas(name: string, closeness: Closeness, person: Person) {
  const timing = birthdayTiming(person);
  const when = timing.days === 1 ? "tomorrow" : `in ${timing.days} days`;

  if (timing.kind === "belated") {
    if (closeness === "very-close") return [
      `I’m late, but HAPPY BIRTHDAY ${name}! I still want to celebrate you. Call this week?`,
      `Belated birthday hugs, ${name}! Tell me everything about how you spent the day.`,
      `I missed the day but not the chance to say it: happy birthday! Let’s celebrate properly soon.`,
    ];
    if (closeness === "close") return [
      `Happy belated birthday, ${name}! Sorry I missed the day. I hope it was a good one.`,
      `Belated happy birthday! I hope this year is a great one for you, ${name}.`,
      `I’m a little late, but happy birthday, ${name}! Let’s catch up soon.`,
    ];
    return [
      `Happy belated birthday, ${name}! I hope you had a great day.`,
      `Belated birthday wishes, ${name}. Hope it was a lovely one!`,
      `Happy belated birthday! Wishing you a great year ahead, ${name}.`,
    ];
  }

  if (timing.kind === "upcoming") {
    if (closeness === "very-close") return [
      `Your birthday is ${when}! What are we doing to celebrate?`,
      `Counting down to your birthday ${when}, ${name}. Any plans? I want to help make it special.`,
      `Save this one for the day: Happy birthday, ${name}! Another year of you being one of my favorite people.`,
    ];
    if (closeness === "close") return [
      `I saw your birthday is ${when}, ${name}! Any fun plans?`,
      `Your birthday’s ${when}! I hope you’re doing something nice for yourself.`,
      `Save this one for the day: Happy birthday, ${name}! I hope your day is full of good food and people who love you.`,
    ];
    return [
      `I think your birthday is ${when}, ${name}. Hope you have something fun planned!`,
      `Early happy birthday wishes, ${name}! Hope the week leading up to it is a good one.`,
      `Save this one for the day: Happy birthday, ${name}! Hope you have a wonderful day.`,
    ];
  }

  if (closeness === "very-close") return [
    `Happy birthday, ${name}! I hope today feels as special as you are to me. Call me when you get a second.`,
    `HAPPY BIRTHDAY ${name}!! Another year of you being my favorite person. Celebrating you all day today.`,
    `Happy birthday! Wish I could be there to hug you. Let’s celebrate properly soon, my treat.`,
  ];
  if (closeness === "close") return [
    `Happy birthday, ${name}! I hope your day is full of good food and people who love you.`,
    `Happy birthday! Wishing you a really good year ahead. Let’s catch up soon and celebrate.`,
    `Thinking of you on your birthday, ${name}. Hope it’s a great one!`,
  ];
  return [
    `Happy birthday, ${name}! Hope you have a wonderful day.`,
    `Wishing you a happy birthday and a great year ahead, ${name}!`,
    `Happy birthday! I hope today brings you something nice, ${name}.`,
  ];
}

function createSuggestions(person: Person, closeness: Closeness, intent: Intent) {
  const name = person.name;
  if (intent === "birthday") return birthdayIdeas(name, closeness, person);

  if (intent === "long-gap") {
    if (closeness === "very-close") return [
      `Hey ${name}, it’s been too long. I miss you—tell me everything when you get a minute.`,
      `I’ve been thinking about you, ${name}. Can we catch up soon?`,
      `Hey you, how have you really been? I want the full update.`,
    ];
    if (closeness === "close") return [
      `Hey ${name}, you’ve been on my mind lately. I’d love to catch up—how have you been?`,
      `Hi ${name}, it’s been a little while. No pressure, but I’d love to hear how things are going.`,
      `I’ve been meaning to reach out, ${name}. What’s something good from your week?`,
    ];
    return [
      `Hi ${name}, I realized it’s been a while since we caught up. How have you been?`,
      `Hey ${name}, I hope things have been going well. What have you been up to lately?`,
      `It’s been a bit, ${name}. Would you be up for catching up sometime?`,
    ];
  }

  if (intent === "specific") {
    if (closeness === "very-close") return [
      `Hey ${name}, how did things go with what you had coming up? I’ve been thinking of you.`,
      `I wanted to check back in, ${name}. How are you feeling about everything now?`,
      `I remembered you had a lot going on. Want to tell me the whole story?`,
    ];
    if (closeness === "close") return [
      `Hey ${name}, how did things go with what you had coming up? I’ve been thinking of you.`,
      `Hi ${name}, I wanted to check back in about how you were doing. How are things now?`,
      `I remembered you had a lot going on, ${name}. Want to tell me how it’s been?`,
    ];
    return [
      `Hi ${name}, I remembered you had something coming up. How did it go?`,
      `Hey ${name}, I wanted to follow up and see how things have been going.`,
      `How did everything turn out, ${name}? I hope it went smoothly.`,
    ];
  }

  if (closeness === "very-close") return [
    `Hey ${name}, what’s the latest? I want all the details.`,
    `Just checking in—how are you really doing this week, ${name}?`,
    `Can I call you later? I’ve got some catching up to do.`,
  ];
  if (closeness === "close") return [
    `Hey ${name}, I was thinking of you. How have you been?`,
    `It’s been a bit since we caught up. What’s new with you?`,
    `I’d love to hear what you’ve been up to lately, ${name}.`,
  ];
  return [
    `Hi ${name}, I hope your week’s going well. What have you been up to?`,
    `I came across something that made me think of you, ${name}. How are things?`,
    `Would you be up for catching up sometime soon, ${name}?`,
  ];
}

export default function MessageIdeasDrawer({ people, onClose, onAddPerson }: Props) {
  const [personId, setPersonId] = useState(people[0]?.id ?? "");
  const [closeness, setCloseness] = useState<Closeness>("close");
  const [intent, setIntent] = useState<Intent>("casual");
  const [ideas, setIdeas] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const person = people.find((savedPerson) => savedPerson.id === personId);

  // birthdays in the next 30 days, or in the past week (for belated notes)
  const birthdays = people
    .flatMap((savedPerson) => {
      if (!savedPerson.birthday) return [];
      const days = daysUntilBirthday(savedPerson.birthday);
      if (days === null) return [];
      if (days <= 30) return [{ person: savedPerson, days, label: days === 0 ? "Today!" : days === 1 ? "Tomorrow" : `In ${days} days` }];
      if (365 - days <= 7) return [{ person: savedPerson, days: days - 366, label: "Just passed" }];
      return [];
    })
    .sort((a, b) => a.days - b.days);

  function generate(forPerson = person, forIntent = intent, forCloseness = closeness) {
    if (!forPerson) return;
    setIdeas(createSuggestions(forPerson, forCloseness, forIntent));
    setCopiedIndex(null);
  }

  function birthdayIdeasFor(target: Person) {
    setPersonId(target.id);
    setIntent("birthday");
    generate(target, "birthday");
  }

  async function copyIdea(idea: string, index: number) {
    await navigator.clipboard?.writeText(idea);
    setCopiedIndex(index);
    window.setTimeout(() => setCopiedIndex(null), 1800);
  }

  return (
    <div className="drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="add-person-drawer message-ideas-drawer" role="dialog" aria-modal="true" aria-labelledby="message-ideas-title">
        <div className="drawer-heading">
          <div>
            <p className="eyebrow">Message ideas</p>
            <h2 id="message-ideas-title">Find a way to start the conversation</h2>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close message ideas">×</button>
        </div>
        <p className="drawer-copy">A few starting points, shaped around the person and the moment.</p>

        {people.length === 0 ? (
          <div className="ideas-empty-state">
            <p>Add someone to your village first, then I can help you find the words.</p>
            <button className="btn btn-primary" onClick={onAddPerson}>Add a person</button>
          </div>
        ) : (
          <>
            <section className="birthday-ideas" aria-labelledby="birthday-ideas-title">
              <h3 id="birthday-ideas-title">
                <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
                  <path d="M11 9V5m5 4V4m5 5V5" stroke="#2c4337" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M5 17v10h22V17Z" fill="#f6cf71" stroke="#2c4337" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M7 11h18v6H7Z" fill="#ff9fc4" stroke="#2c4337" strokeWidth="1.8" strokeLinejoin="round" />
                </svg>
                Birthday messages
              </h3>
              {birthdays.length === 0 ? (
                <p className="birthday-ideas-empty">No birthdays in the next month. You can still pick “A birthday message” below.</p>
              ) : (
                <ul>
                  {birthdays.map(({ person: birthdayPerson, label }) => (
                    <li key={birthdayPerson.id}>
                      <span className="birthday-ideas-who">
                        <strong>{birthdayPerson.name}</strong>
                        <span>{formatBirthday(birthdayPerson.birthday!)} · {label}</span>
                      </span>
                      <button type="button" className="btn" onClick={() => birthdayIdeasFor(birthdayPerson)}>
                        Birthday ideas
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <div className="ideas-fields">
              <label className="date-field">
                Who are you reaching out to?
                <select className="field" value={personId} onChange={(event) => { setPersonId(event.target.value); setIdeas([]); }}>
                  {people.map((savedPerson) => <option key={savedPerson.id} value={savedPerson.id}>{savedPerson.name}</option>)}
                </select>
              </label>

              <label className="date-field">
                How close are you?
                <select className="field" value={closeness} onChange={(event) => { setCloseness(event.target.value as Closeness); setIdeas([]); }}>
                  {CLOSENESS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label className="date-field">
                What kind of note do you want to send?
                <select className="field" value={intent} onChange={(event) => { setIntent(event.target.value as Intent); setIdeas([]); }}>
                  {INTENTS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
            </div>
            <button className="btn btn-primary ideas-generate" onClick={() => generate()}>Give me a few ideas</button>
            {ideas.length > 0 && <section className="message-idea-results" aria-live="polite" aria-label="Message suggestions">
              {ideas.map((idea, index) => <article className="message-idea-card" key={`${personId}-${intent}-${index}`}>
                <label className="sr-only" htmlFor={`message-idea-${index}`}>Edit message idea {index + 1}</label>
                <textarea id={`message-idea-${index}`} value={idea} onChange={(event) => setIdeas((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} rows={3} />
                <button className="btn" onClick={() => copyIdea(idea, index)}>{copiedIndex === index ? "Copied" : "Copy"}</button>
              </article>)}
            </section>}
          </>
        )}
      </section>
    </div>
  );
}
