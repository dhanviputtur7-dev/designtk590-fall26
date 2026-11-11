# Kinlight

Kinlight helps people with busy schedules remember to check in with family and friends, especially people who live far away. Its village theme makes keeping in touch feel like less of a chore and personal.

**Live app:** https://kinlight-ten.vercel.app/  
**GitHub repository:** https://github.com/dhanviputtur7-dev/designtk590-fall26

## Audience

Kinlight is for people who want to stay connected with family and friends but find it hard keep track of everyone.

## Problem

Busy schedules make it easy to lose track of when you last reached out to someone. Calendar reminders can feel like chores, and relying on memory does not always work.

## Primary user flow

1. Add someone’s name, relationship, last-contact date, and preferred check-in frequency. You can also add their city.
2. See contacts as colorful house bubbles. The glow dims as time passes compared with the check-in frequency you chose.
3. Choose someone to contact and view a suggested message. Copy it or try another suggestion.
4. After reaching out, select **Check in**. Kinlight updates the last-contact date and briefly confirms the check-in.
5. Optionally, explore contacts grouped by place.

## Technical stack

- Next.js
- React
- TypeScript
- CSS
- Browser `localStorage` for saving contacts

## APIs

My app uses the Open-Meteo Geocoding API to look up a city and its time zone. It uses the Time.Now Timezone API to show the local time for a contact’s location. The browser provides a local-time fallback if the time service is unavailable.

These APIs do not require an API key. Kinlight’s message ideas come from built-in templates; the app does not send messages.

## Run locally

You’ll need Node.js and npm.

1. Clone the repository:

   ```bash
   git clone ADD_YOUR_REPOSITORY_URL