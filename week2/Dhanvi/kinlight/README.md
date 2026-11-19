# Kinlight

Kinlight helps people with busy schedules remember to check in with family and friends, especially people who live far away. Its village theme makes keeping in touch feel like less of a chore and personal.

**Live app:** https://kinlight-ten.vercel.app/  
**GitHub repository:** https://github.com/dhanviputtur7-dev/designtk590-fall26

## Audience

Kinlight is for people who want to stay connected with family and friends but find it hard keep track of everyone. - people with family or friends in other cities, countries and time zones
- People who are busy and always on their devices, and who lose track of who they haven't talked to in a while
- People who want to make the effort to keep up relationships, but don't want another app that feels like a to-do list

## Problem

Busy schedules make it easy to lose track of when you last reached out to someone. Calendar reminders can feel like chores, and relying on memory does not always work.

## Primary user flow

1. Add someone’s name, relationship, last-contact date, and preferred check-in frequency. You can also add their city.
2. See contacts as colorful house bubbles. The glow dims as time passes compared with the check-in frequency you chose.
3. Choose someone to contact and view a suggested message. Copy it or try another suggestion.
4. After reaching out, select **Check in**. Kinlight updates the last-contact date and briefly confirms the check-in.
5. Optionally, explore contacts grouped by place.


Other features:
- **Edit** anyone's details directly inside their neighborhood
- **Birthday reminders:** a cake appears 2 days before ("In 2 days," "Tomorrow"); on the day, candles light up and string lights hang across the neighborhood
- **Village glow** jar showing your overall check-in health and check-ins this week
- **Your clock:** your own time, time zone (e.g. EST) and date
- **Day and night sky:** the background follows your device's clock: sunrise around 5:30am, darkening from 8pm, with the real moon phase at night

## Technical stack

- Next.js
- React
- TypeScript
- CSS
- Browser `localStorage` for saving contacts


### Main components

| Component | What it does |
|---|---|
| `VillageIsland` | One person's neighborhood: details, check in, edit, remove |
| `NeighborhoodArt` | Draws the home, trees and details for a person's place |
| `IslandShell` | The clearing shape each neighborhood sits on |
| `VillageLandscape` | The hills and the day/night sky |
| `CrayonSky` | The crayon-style sun and moon |
| `VillageHealth` | The village glow jar |
| `YourClock` | The user's clock, time zone and date |
| `AddPersonForm` / `EditPersonForm` | Adding and editing people |
| `BirthdayPicker` / `BirthdayDecor` | Month and day birthday picker; cake and lights |
| `MessageIdeasDrawer` | Message and birthday ideas |
| `lib/places.ts` | Country detection, home styles, palettes and ground colors |
| `lib/sky.ts`, `lib/useSky.ts` | Sky colors, sun and moon position, moon phase |




## APIs

All APIs are free, public and need **no API keys**, so there are no credentials stored in the project.

| API | How Kinlight uses it |
|---|---|
| **Open-Meteo Geocoding** | Turns the city a user types into a full place name and time zone. The country also decides the home style and colors for that person's neighborhood. |
| **Time.Now** | Gets the live local time in each person's time zone, so users know if it's a good time to call. If it's unavailable, the browser calculates the time instead. |
| **US Naval Observatory (moon phases)** | Gets real new-moon dates so the moon in the night sky and on the clock shows the correct phase. If it's unavailable, the phase is calculated from the average lunar cycle. |



Color palettes for each region are adapted from [ColorArchive](https://colorarchive.org/regions/).

## Running the project locally

Requirements: Node.js 20 or newer.

```bash
git clone https://github.com/dhanviputtur7-dev/designtk590-fall26.git
cd designtk590-fall26/week2/Dhanvi/kinlight
npm install
npm run dev
```

Then open http://localhost:3000.

**Tip:** to preview the sky at a different time of day, add `?time=HH:MM` to the address, for example `http://localhost:3000/?time=22:00` for night.

To make a production build: `npm run build`, then `npm start`.

## Known limitations

- **Saved only in one browser.** People are stored in localStorage, so they don't sync across devices and are lost if browser data is cleared.
- **No reminders or notifications.** Kinlight only shows who's due when you are on the micro-app
- **Message ideas are templates,** not personalized to past conversations.
- **Sunrise and sunset times are fixed** (about 5:30am and 8pm) rather than based on the user's real location and season.
- **Designed mainly for laptop and desktop**; the phone layout works but needs more testing.
- **Limited user testing** so far.

## What I would improve next

- Gentle reminders (for example, a nudge when someone goes dark or a birthday is coming up)
- Accounts and syncing across devices
- A more polished layout
- Real sunrise and sunset times based on location
- Experiment on more regional home styles and palettes
- Tracking key events (check-ins, copied messages) to measure whether people stay more in touch
- something more with the "checked in" button feedback

## AI disclosure

I used Claude (Anthropic) to help build this version. It helped write the SVG illustrations,layout changes, working from my sketches, inspiration board and feedback. I directed the design decisions, tested each iteration, and rejected or reverted several directions.


