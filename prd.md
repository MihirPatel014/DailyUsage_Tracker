Phase 1 PRD – DailyUsage Tracker (MVP)
1. Product Summary (Phase 1 Scope)

DailyUsage Tracker Phase 1 is a mobile-friendly PWA that allows users to track daily consumption of routine household items such as milk, water jars, ironing, and similar services.

The focus is on:

Adding items

Logging daily usage

Basic routine flow

Monthly cycle reset

Simple history view

No backend

Full offline support

This phase builds the foundation for future features.

2. Phase 1 Goals
Primary Goals

Allow users to define household items with custom units and rates.

Provide a fast way to record daily usage.

Support multiple entries per day.

Maintain a running monthly total.

Allow manual monthly reset with confirmation.

Keep all logs permanently.

Work offline and install as a PWA.

Simple light/dark mode.

Not Included in Phase 1

Analytics and charts

Export/Import

Cloud sync

Multi-user/cloud sharing

Advanced reminders

Providers-based reporting

These will come later.

3. Core Features (Phase 1)
A. Item Management (Create/Edit/Delete)

Each item includes:

Name

Unit (free text)

Rate per unit

Provider (optional)

Routine toggle (Yes/No)

Requirements:

User can create unlimited items.

Each item appears in the daily routine list if marked as routine.

Items are stored in IndexedDB.

B. Daily Routine Dashboard

This is the main home screen.

Elements:

List of routine items

“Add Entry” button for each

“Add Item” button

Flow:

Tapping “Add Entry” opens a popup:

Quantity

Provider (default shown)

Optional note

Save

Upon saving:

Log is created

Monthly total for item updated

C. Logging Entries

Each entry saves:

Item ID

Quantity

Provider

Cost (auto: quantity × rate)

Date & time

Optional note

The app must support multiple entries per day.

Logs are permanent.

D. Monthly Cycle Reset (Manual)
Flow:

User taps “End Cycle” →
Popup shows:

“Do you want to reset monthly totals?
Your logs will remain saved.”

Buttons:

Yes, Reset

Cancel

Behavior:

Only totals reset

Logs remain

New cycle starts (end date saved internally)

E. History Screen

Simple history list:

Grouped by date

Shows entries per date

Filter by item

Design:

No charts

No sorting needed (simple reverse chronological order)

F. PWA Features

Installable

Offline-first

Service worker caching

Works fully without internet

Mobile responsive

G. Appearance

Light mode

Dark mode

System mode (auto-switch)

4. Phase 1 Non-Functional Requirements
Performance

App must load in <2 seconds.

Daily entry should take ≤ 3 taps.

Offline Support

Entire app works offline.

Data stored in IndexedDB (Dexie.js).

Usability

Large tap areas

Clean minimal UI

Works on small mobile screens

5. Technical Requirements (Phase 1)
Tech Stack

React + Vite

IndexedDB via Dexie.js

Tailwind or CSS Modules

Workbox or custom service worker

Manifest.json for PWA

Data Models (Phase 1 Only)
Items

id

name

unit

rate

provider

isRoutine

createdAt

Logs

id

itemId

date

time

quantity

cost

provider

note

Cycle

id

startDate

endDate

6. User Flow (Phase 1)
First Use

User opens app → no login

Sees empty dashboard

Taps “Add Item”

Creates:

Name

Unit

Rate

Routine?

Item now appears on routine list.

Daily Use

Open app

Tap “Add Entry” for routine items

Fill quantity → Save

Entry stored instantly

Monthly totals update

Monthly Reset

User taps “End Cycle”

Confirmation popup

Monthly totals reset

Logs remain in history

View History

Go to History tab

See all logs by date

7. Success Criteria (Phase 1)

User can track daily usage effortlessly.

Routine items reduce manual effort.

Monthly cycles reflect real household billing.

No data loss even with app restart or offline usage.

Users install PWA on their phone.

8. Phase 1 Deliverables

Functional PWA

Item management

Daily routine dashboard

Entry logging

Monthly reset

Basic history

Offline support

Dark/light mode

Clean UI

This completes Phase 1.