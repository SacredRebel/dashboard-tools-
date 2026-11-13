# Calendar UI rules

How to design and build any calendar view so it looks considered and works for everyone. These rules add to the [design rulebook](../design/02-rulebook.md). They don't replace it. Live references: showcase site → **Calendars**.

[← Calendar hub](README.md)

---

## 1. Universal rules (every style)

**Layout**
- One style per screen (Month, Week, Agenda, Picker, Heatmap, Booking, Strip, Meeting grid). Name it before building, like a page pattern.
- Header = title (month and year, or the range), **Today** button, previous / next buttons, view switcher. In that order, the same on every view.
- Week start follows the locale (Sunday in the US, Monday in most of Europe). Make it a setting, not a constant.
- Grids never change height when navigating (Month always shows 6 rows). No layout shift.

**Color**
- Event colors come from the chart tokens (`--chart-1…5`) or the stage colors. Never a rainbow of random hues. Maximum 5 calendar colors visible at once.
- Today: filled accent circle on the date number. Selected: ring. Never two filled markers.
- Weekends and past days: a slightly sunken background (`--surface-sunken`) or muted text, not both.
- Event chips need text contrast ≥ 4.5:1 on their own fill. Use a tinted fill (`color-mix` 14–18%) with full-strength text and a 3px left bar, which works in light and dark themes.

**Type**
- Date numbers in tabular figures (`.num`). Day names abbreviated (Mon), sentence case, never all caps.
- Event chip: time first (muted), then title. Truncate the title with an ellipsis, and show the full text on focus or in the detail panel.
- Body text never below 14px. Grid chips can go to 13px if a full-size detail view is one click away.

**Interaction**
- Every day cell and event is reachable by keyboard. The month grid is an ARIA `grid` with roving tabindex: arrows move a day or a week, Home/End go to the week's start or end, PageUp/PageDown change month, Enter opens.
- Click empty time = create (with the time prefilled). Click event = details panel (side sheet on desktop, bottom sheet on phone).
- Drag to move or resize only in Week/Day, and always with a keyboard alternative (an edit form with date and time).
- Tap targets ≥ 44px on phones. Month cells on phones show dots, and tapping opens that day's agenda.

**Motion**
- Month/week change: 150–200ms slide or fade on transform/opacity, direction matching the arrow pressed. None under `prefers-reduced-motion`.
- Current-time line: updates once a minute, **paused offscreen and in background tabs**.

**States**
- Loading: skeleton chips in the grid, not a spinner over the calendar.
- Empty: the grid still shows, with a quiet line such as "No meetings this week", and the create action.
- Error: inline banner above the grid: "Couldn't reach Google Calendar. Showing what we had at 2:14 PM. Try again."
- Disconnected provider: banner with **Reconnect**, never a silent empty calendar.

**Time zones**
- Show the zone in the header when the viewer's zone differs from the calendar's ("Times in ET").
- Booking pages always show the visitor's zone and let them change it.

---

## 2. Style by style

### Month grid
- 7 columns × 6 rows, day name header row. Cells show the date top-left and up to 3 chips. Overflow becomes "+2 more", which opens the day.
- All-day and multi-day events become bars that span cells. Timed events become chips with a time.
- Phone (< 640px): dots instead of chips, and the selected day's agenda below the grid.
- Reference: Nextcloud, Fossify, FullCalendar dayGrid, kizitonwose month.

### Week time grid
- Time gutter (hourly labels), 7 day columns (5 for work week), all-day lane on top.
- 1 hour ≈ 48–64px. Overlapping events split the column width, ordered by start time then duration.
- Current-time line on today only. Opens scrolled to 8:00 or to the first event.
- Phone: 3-day or 1-day view, or switch to Agenda.
- Reference: FullCalendar timeGrid, Schedule-X week, react-native-calendars Timeline.

### Agenda list
- Grouped by day with sticky day headers ("Today · Thu, Nov 13"). Rows show time range, title, then person or client (link).
- Skip empty days. End with "Nothing else this week" plus a link to the next week.
- The most accessible calendar. Offer it as the default on phones and as a toggle everywhere.
- Reference: gcalcli agenda, react-native-calendars AgendaList, the retired Chrome extension popup.

### Date and range picker
- Mini month (≈ 280px wide), 40px day buttons, previous/next month buttons with labels.
- Always paired with a typed input that accepts "Nov 18" or "11/18/2026". The picker is a helper, not the only way in.
- Range: start and end filled, the days between tinted. A second click before the start resets the start.
- Disabled dates are greyed and explain why on focus ("Past date").
- Reference: React DayPicker (shadcn Calendar), rc-calendar panels, JTAppleCalendar range.

### Year heatmap
- 53 columns × 7 rows of small squares (12–14px, 3px gap). One hue, 5 steps from `--surface-sunken` to the accent.
- Month labels above, Mon/Wed/Fri labels left. Legend "Less ■■■■■ More" with the real ranges in a tooltip or caption.
- Provide a text summary ("214 calls this year, busiest week: Mar 10") for screen readers.
- Reference: kizitonwose HeatMap calendar.

### Booking slots
- Step 1: pick a day (mini month, only days with free slots enabled). Step 2: pick a time from a list of free slots. Step 3: confirm (name, email, note) and see a summary.
- Show duration, the host's name, the video provider and the time zone.
- After booking: confirmation screen with **Add to calendar** (ICS) and the Meet link.
- Reference: Cal.com, Nextcloud appointments.

### Week strip
- 7 day pills in a row (day name + number + dot if busy). Selected pill filled. Arrow buttons or swipe for the next week.
- The selected day's agenda below. The strip stays sticky while the list scrolls.
- Reference: react-native-calendars CalendarProvider + WeekCalendar, kizitonwose week mode, JTAppleCalendar one-row mode.

### Meeting grid
- Tiles keep 16:9 and reflow by participant count (1 → full, 2 → 2 columns, 3–4 → 2×2, 5–9 → 3×3).
- Speaker highlight = a 2px accent ring and a label. Never change tile size (no layout shift).
- Name label on every tile, and initials avatar when video is off. Controls (mic, camera, share, leave) in a bottom bar with labels for screen readers.
- Reference: google-meet-grid-view (ideas only), google-meet-clone (layout only).

---

## 3. Theming calendar libraries with the tokens

| Library | How to theme |
|---|---|
| shadcn Calendar | Already uses the shadcn variables from `design-system/tailwind.preset.js` |
| FullCalendar | Set `--fc-border-color: var(--border)`, `--fc-today-bg-color: color-mix(in oklab, var(--accent) 8%, transparent)`, `--fc-event-bg-color: var(--accent)`, `--fc-page-bg-color: var(--surface)` on a wrapper |
| Schedule-X | Override its `--sx-*` color variables with token values in a wrapper class |
| react-native-calendars | Build the `theme` prop from a JS object generated from `tokens.css` values |
| Android (kizitonwose / CalendarView) | Map tokens into the Compose `ColorScheme` or `colors.xml` |
| iOS (JTAppleCalendar) | Map tokens into an asset catalog and use them in cell classes |

Wrap any third-party calendar in a container with the theme's tokens, and check contrast in **every** theme you ship, dark ones included.
