# Recipes by business type

> Generated from [catalog/recipes.json](../../catalog/recipes.json) by `scripts/build.mjs`. Edit the JSON, not this file.

A recipe is a starting point the AI proposes during [intake](01-intake.md) and the person edits. Looks link to the live gallery.

## Service business CRM (`service-crm`)

**Fits:** coach, consultant, freelancer, agency, photographer, designer, lawyer, accountant, contractor, wedding, clients, leads

**Who uses it:** Owner or a small team selling a service to a few dozen clients at a time

**The job:** See who needs attention today and move every client one step forward

| Page | Pattern | Purpose |
|---|---|---|
| Today | Dashboard | KPIs, needs-attention list, upcoming follow-ups |
| Clients | List | Search, filter, add; row opens the client |
| Client | Detail | Overview, activity, notes, next step |
| Pipeline | Board | Stages as columns, drag or 'Move to' |
| Calendar | Calendar | Meetings and follow-ups |
| Settings | Settings | Stages, profile, import and export |

**Records:** client, contact, deal, activity, task, note

**Numbers:** Active clients · Open pipeline value · Follow-ups due today · Won this month · Average days to close

**Steps:** New lead → Discovery call → Proposal sent → Negotiating → Won → Lost

**Often connects to:** Google Calendar, Gmail, meeting notes (Fathom, Zoom), invoicing

**Looks:** [orchard-sales](https://dashboard-tools-three.vercel.app/#/dashboards/orchard-sales) · [mauve-ledger](https://dashboard-tools-three.vercel.app/#/dashboards/mauve-ledger) · [kumo-payroll](https://dashboard-tools-three.vercel.app/#/dashboards/kumo-payroll)

**Themes:** atelier, linen, blush

**Note:** Full blueprint in docs/crm/. Stage names come from the client's own words.

## Appointments and bookings (`booking`)

**Fits:** salon, spa, barber, clinic, dentist, therapist, tutor, studio, appointments, booking, schedule, classes

**Who uses it:** Front desk or owner who lives in the calendar

**The job:** Fill the calendar, cut no-shows, know each customer's history

| Page | Pattern | Purpose |
|---|---|---|
| Today | Dashboard | Today's appointments, gaps, no-show risk |
| Calendar | Calendar | Day and week by staff member, drag to reschedule |
| Customers | List | History, preferences, notes |
| Customer | Detail | Visits, spend, next booking |
| Services | List | Durations, prices, staff |
| Settings | Settings | Hours, staff, reminders |

**Records:** customer, appointment, service, staff, payment

**Numbers:** Bookings today · Utilisation this week · No-show rate · Revenue this week · Rebooking rate

**Steps:** Requested → Confirmed → Checked in → Completed → No-show

**Often connects to:** Google Calendar, SMS or email reminders, payments

**Looks:** [pearlwell-dental](https://dashboard-tools-three.vercel.app/#/dashboards/pearlwell-dental) · [vitalis-care](https://dashboard-tools-three.vercel.app/#/dashboards/vitalis-care) · [meridian-labs](https://dashboard-tools-three.vercel.app/#/dashboards/meridian-labs)

**Themes:** coastal, blush, linen

**Note:** Calendar is the main screen: read docs/calendars/ before designing it.

## Real estate and property (`real-estate`)

**Fits:** real estate, realtor, property, listings, rentals, landlord, broker, airbnb

**Who uses it:** Agent or small brokerage tracking listings and buyers

**The job:** Match people to properties and keep every viewing and offer moving

| Page | Pattern | Purpose |
|---|---|---|
| Overview | Dashboard | New leads, viewings this week, offers out |
| Listings | List | Cards with photo, price, status; filters |
| Listing | Detail | Gallery, specs, price history, interested buyers |
| Buyers | List | Requirements, budget, matched listings |
| Viewings | Calendar | Schedule and feedback |
| Deals | Board | Offer to close |

**Records:** listing, buyer, owner, viewing, offer, document

**Numbers:** Active listings · Viewings this week · Offers out · Average days on market · Commission pipeline

**Steps:** Enquiry → Viewing booked → Offer made → Under contract → Closed

**Often connects to:** Google Calendar, maps, document signing

**Looks:** [haven-listings](https://dashboard-tools-three.vercel.app/#/dashboards/haven-listings) · [larchwood-lodge](https://dashboard-tools-three.vercel.app/#/dashboards/larchwood-lodge)

**Themes:** tide, linen, coastal

**Note:** Photos carry this dashboard: plan original imagery (docs/design/11-hero-art-direction.md).

## Health, wellness and fitness (`health-fitness`)

**Fits:** gym, trainer, fitness, yoga, nutrition, wellness, patients, health, wearable, sleep

**Who uses it:** Coach, practitioner or member tracking progress

**The job:** Show progress at a glance and what to do next

| Page | Pattern | Purpose |
|---|---|---|
| Overview | Dashboard | Scores, trends, today's plan |
| Members | List | Status, plan, last check-in |
| Member | Detail | Metrics over time, programme, notes |
| Programmes | List | Plans and sessions |
| Schedule | Calendar | Sessions and classes |
| Settings | Settings | Goals, units, alerts |

**Records:** member, programme, session, measurement, goal

**Numbers:** Active members · Check-ins this week · Goal completion · Churn risk · Revenue this month

**Often connects to:** wearables, Google Calendar, payments

**Looks:** [forge-fitness](https://dashboard-tools-three.vercel.app/#/dashboards/forge-fitness) · [zest-health](https://dashboard-tools-three.vercel.app/#/dashboards/zest-health) · [aura-ring](https://dashboard-tools-three.vercel.app/#/dashboards/aura-ring) · [lull-sleep](https://dashboard-tools-three.vercel.app/#/dashboards/lull-sleep) · [cortex-well](https://dashboard-tools-three.vercel.app/#/dashboards/cortex-well)

**Themes:** ember, atelier, aurora, blush

**Note:** Never present health numbers as medical advice; label sample data.

## Online store and orders (`ecommerce`)

**Fits:** shop, store, ecommerce, orders, products, inventory, shopify, etsy, retail

**Who uses it:** Store owner checking sales, stock and orders

**The job:** Know what sold, what to ship and what is running out

| Page | Pattern | Purpose |
|---|---|---|
| Overview | Dashboard | Sales, orders to ship, low stock |
| Orders | List | Status filters, bulk actions |
| Order | Detail | Items, customer, timeline |
| Products | List | Stock, price, performance |
| Customers | List | Lifetime value, last order |
| Reports | Report | Revenue, channels, returns |

**Records:** order, product, customer, inventory item, refund

**Numbers:** Revenue today · Orders to ship · Average order value · Conversion rate · Low-stock items

**Steps:** Paid → Packing → Shipped → Delivered → Returned

**Often connects to:** Shopify or Stripe, shipping, email

**Looks:** [orchard-sales](https://dashboard-tools-three.vercel.app/#/dashboards/orchard-sales) · [tidebath-showroom](https://dashboard-tools-three.vercel.app/#/dashboards/tidebath-showroom) · [taffy-analytics](https://dashboard-tools-three.vercel.app/#/dashboards/taffy-analytics)

**Themes:** atelier, linen, blush

## Restaurant, hotel and hospitality (`restaurant-hospitality`)

**Fits:** restaurant, cafe, bar, hotel, lodge, bnb, reservations, tables, guests, catering

**Who uses it:** Manager running today's service

**The job:** See today's covers or arrivals and keep service smooth

| Page | Pattern | Purpose |
|---|---|---|
| Today | Dashboard | Arrivals, covers, occupancy, issues |
| Reservations | Calendar | Timeline by table or room |
| Guests | List | Preferences, visits, notes |
| Menu or Rooms | List | Availability and price |
| Staff | List | Shifts |
| Reports | Report | Revenue, occupancy, reviews |

**Records:** reservation, guest, table or room, staff shift, review

**Numbers:** Covers or arrivals today · Occupancy · Average spend · No-shows · Review score

**Steps:** Booked → Confirmed → Seated or checked in → Completed → Cancelled

**Often connects to:** booking channel, payments, reviews

**Looks:** [larchwood-lodge](https://dashboard-tools-three.vercel.app/#/dashboards/larchwood-lodge) · [tidebath-showroom](https://dashboard-tools-three.vercel.app/#/dashboards/tidebath-showroom) · [horizon-weather](https://dashboard-tools-three.vercel.app/#/dashboards/horizon-weather)

**Themes:** ember, linen, coastal

## Projects and agency work (`projects-agency`)

**Fits:** agency, projects, tasks, team, studio, construction, production, deliverables, sprints

**Who uses it:** Team lead tracking work across clients

**The job:** Know what is due, who is overloaded and what is blocked

| Page | Pattern | Purpose |
|---|---|---|
| Overview | Dashboard | Due this week, blocked, workload |
| Projects | List | Status, owner, budget |
| Project | Detail | Tasks, timeline, files, notes |
| Board | Board | Tasks by status |
| Timeline | Calendar | Milestones |
| Team | List | Capacity |

**Records:** project, task, client, milestone, time entry

**Numbers:** Active projects · Tasks due this week · Blocked tasks · Hours logged · Budget used

**Steps:** Backlog → In progress → Review → Done

**Often connects to:** Google Calendar, time tracking, file storage

**Looks:** [prism-workspace](https://dashboard-tools-three.vercel.app/#/dashboards/prism-workspace) · [canopy-reforest](https://dashboard-tools-three.vercel.app/#/dashboards/canopy-reforest) · [pebble-studio](https://dashboard-tools-three.vercel.app/#/dashboards/pebble-studio)

**Themes:** aurora, grove, blush

## Finance, bookkeeping and payroll (`finance`)

**Fits:** finance, bookkeeping, invoices, payroll, expenses, budget, accounting, cash flow, hr

**Who uses it:** Owner or bookkeeper checking money in and out

**The job:** See cash position and what needs paying or chasing

| Page | Pattern | Purpose |
|---|---|---|
| Overview | Dashboard | Balance, cash flow, due and overdue |
| Transactions | List | Categorise, search, export |
| Invoices | List | Status, chase overdue |
| Payroll | List | Runs, people, approvals |
| Budgets | Report | Plan against actual |
| Settings | Settings | Accounts, categories |

**Records:** account, transaction, invoice, employee, pay run, budget

**Numbers:** Cash balance · Money in this month · Money out this month · Overdue invoices · Runway

**Steps:** Draft → Sent → Overdue → Paid

**Often connects to:** bank feed, accounting software, payroll provider

**Looks:** [mauve-ledger](https://dashboard-tools-three.vercel.app/#/dashboards/mauve-ledger) · [kumo-payroll](https://dashboard-tools-three.vercel.app/#/dashboards/kumo-payroll)

**Themes:** blush, noir, atelier

**Note:** Money needs exact numbers: tabular figures, currency formats, no rounding surprises.

## SaaS admin and product analytics (`saas-analytics`)

**Fits:** saas, app, users, signups, mrr, churn, analytics, metrics, product, startup

**Who uses it:** Founder or product lead watching growth and usage

**The job:** See growth, retention and where users drop off

| Page | Pattern | Purpose |
|---|---|---|
| Overview | Dashboard | Active users, revenue, churn, sign-ups |
| Users | List | Plan, usage, health |
| User | Detail | Events, billing, notes |
| Funnels | Report | Sign-up to paid |
| Revenue | Report | MRR movements |
| Settings | Settings | Team, flags, alerts |

**Records:** user, account, subscription, event, feature flag

**Numbers:** Active users · MRR · Churn · Trial to paid · Net revenue retention

**Often connects to:** Stripe, product analytics, support desk

**Looks:** [pulsar-analytics](https://dashboard-tools-three.vercel.app/#/dashboards/pulsar-analytics) · [taffy-analytics](https://dashboard-tools-three.vercel.app/#/dashboards/taffy-analytics) · [aether-pane](https://dashboard-tools-three.vercel.app/#/dashboards/aether-pane) · [prism-workspace](https://dashboard-tools-three.vercel.app/#/dashboards/prism-workspace)

**Themes:** aurora, blush, tide

**Note:** Chart-heavy: read docs/design/04-data-viz.md and use the dataviz skill.

## Operations, logistics and monitoring (`operations-logistics`)

**Fits:** logistics, fleet, warehouse, delivery, shipments, operations, monitoring, iot, sensors, control room, security

**Who uses it:** Operator watching live status

**The job:** Spot what is off and act before it becomes a problem

| Page | Pattern | Purpose |
|---|---|---|
| Live | Dashboard | Status wall, alerts, key gauges |
| Assets | List | Vehicles, sites or devices with state |
| Asset | Detail | History, readings, map |
| Shipments or Jobs | Board | In transit to delivered |
| Alerts | List | Triage and acknowledge |
| Reports | Report | Trends and SLAs |

**Records:** asset, shipment or job, alert, site, reading

**Numbers:** On-time rate · Active alerts · Utilisation · Throughput today · Mean time to resolve

**Steps:** Planned → In transit → Delayed → Delivered

**Often connects to:** maps, telemetry feed, messaging

**Looks:** [citadel-wall](https://dashboard-tools-three.vercel.app/#/dashboards/citadel-wall) · [glacier-ops](https://dashboard-tools-three.vercel.app/#/dashboards/glacier-ops) · [copper-radar](https://dashboard-tools-three.vercel.app/#/dashboards/copper-radar) · [solstice-energy](https://dashboard-tools-three.vercel.app/#/dashboards/solstice-energy)

**Themes:** midnight, atelier, ember

**Note:** Live data arrives by subscription, never by polling (docs/stack/05-performance-and-privacy.md).

## Smart home and energy (`smart-home`)

**Fits:** smart home, home automation, thermostat, lights, energy, solar, devices, rooms

**Who uses it:** Resident or installer controlling rooms and devices

**The job:** Control the home quickly and see energy use

| Page | Pattern | Purpose |
|---|---|---|
| Home | Dashboard | Rooms, climate, quick scenes |
| Rooms | List | Devices per room |
| Climate | Detail | Thermostat, schedule |
| Energy | Report | Use, solar, cost |
| Security | List | Cameras, locks, log |
| Settings | Settings | Members, automations |

**Records:** room, device, scene, schedule, reading

**Numbers:** Indoor temperature · Energy today · Devices on · Solar generated · Alerts

**Often connects to:** device hub, weather, energy provider

**Looks:** [hearth-nest](https://dashboard-tools-three.vercel.app/#/dashboards/hearth-nest) · [clima-pane](https://dashboard-tools-three.vercel.app/#/dashboards/clima-pane) · [atrium-living](https://dashboard-tools-three.vercel.app/#/dashboards/atrium-living) · [veil-rooms](https://dashboard-tools-three.vercel.app/#/dashboards/veil-rooms) · [ember-rooms](https://dashboard-tools-three.vercel.app/#/dashboards/ember-rooms)

**Themes:** ember, linen, coastal, noir

**Note:** Controls must work by keyboard and touch; every slider shows its value.

## Courses, education and community (`education-community`)

**Fits:** course, school, students, lessons, tutoring, community, members, club, reading, learning

**Who uses it:** Teacher or community lead tracking learners

**The job:** See who is progressing, who is stuck and what is next

| Page | Pattern | Purpose |
|---|---|---|
| Overview | Dashboard | Progress, activity, upcoming |
| Learners | List | Progress, last active |
| Learner | Detail | Modules, scores, notes |
| Courses | List | Modules and completion |
| Schedule | Calendar | Lessons and deadlines |
| Community | List | Posts and replies |

**Records:** learner, course, module, submission, event

**Numbers:** Active learners · Completion rate · Lessons this week · At-risk learners · Average score

**Often connects to:** Google Calendar, video calls, payments

**Looks:** [folio-club](https://dashboard-tools-three.vercel.app/#/dashboards/folio-club) · [saffron-dusk](https://dashboard-tools-three.vercel.app/#/dashboards/saffron-dusk) · [mallow-music](https://dashboard-tools-three.vercel.app/#/dashboards/mallow-music)

**Themes:** noir, coastal, blush

## Media, content and creators (`media-content`)

**Fits:** music, podcast, video, content, creator, streaming, social, audience, newsletter, game

**Who uses it:** Creator or content lead tracking audience and releases

**The job:** See what performs and plan what ships next

| Page | Pattern | Purpose |
|---|---|---|
| Overview | Dashboard | Audience, plays, top content |
| Library | List | Items with performance |
| Item | Detail | Stats over time, comments |
| Schedule | Calendar | Release plan |
| Audience | Report | Growth, sources, segments |
| Settings | Settings | Channels, team |

**Records:** content item, channel, audience segment, release, comment

**Numbers:** Plays or views · Followers · Engagement rate · Top item · Revenue

**Steps:** Idea → In production → Scheduled → Published

**Often connects to:** platform analytics, scheduling, payments

**Looks:** [mallow-music](https://dashboard-tools-three.vercel.app/#/dashboards/mallow-music) · [hollow-vault](https://dashboard-tools-three.vercel.app/#/dashboards/hollow-vault) · [orbit-clay](https://dashboard-tools-three.vercel.app/#/dashboards/orbit-clay) · [folio-club](https://dashboard-tools-three.vercel.app/#/dashboards/folio-club)

**Themes:** blush, midnight, linen

## Travel, outdoors and weather (`travel-weather`)

**Fits:** travel, tours, trips, weather, outdoor, trails, events, venue, itinerary

**Who uses it:** Operator or traveller planning around conditions

**The job:** See conditions and plans in one calm view

| Page | Pattern | Purpose |
|---|---|---|
| Overview | Dashboard | Conditions, today's plan, alerts |
| Trips | List | Dates, guests, status |
| Trip | Detail | Itinerary, people, documents |
| Map | Map | Places and routes |
| Calendar | Calendar | Departures |
| Settings | Settings | Locations, units |

**Records:** trip, guest, location, booking, forecast

**Numbers:** Departures this week · Seats filled · Weather alerts · Revenue · Review score

**Steps:** Enquiry → Booked → Paid → Travelling → Completed

**Often connects to:** weather API, maps, payments

**Looks:** [horizon-weather](https://dashboard-tools-three.vercel.app/#/dashboards/horizon-weather) · [ridgeline-trails](https://dashboard-tools-three.vercel.app/#/dashboards/ridgeline-trails) · [larchwood-lodge](https://dashboard-tools-three.vercel.app/#/dashboards/larchwood-lodge)

**Themes:** ember, linen, tide

## Anything else (`custom`)

**Who uses it:** Whoever opens it most

**The job:** Decided in the interview: one sentence the human agrees with

| Page | Pattern | Purpose |
|---|---|---|
| Overview | Dashboard | The 3 to 5 numbers and the list that drive action |
| Main records | List | The thing they track most |
| Record | Detail | Everything about one of them |
| Flow | Board or Calendar | How records move or when things happen |
| Settings | Settings | Preferences and data |

**Records:** main record, person, event, note

**Numbers:** Chosen in the interview, at most 5

**Themes:** atelier, linen, midnight

**Note:** Pick the two nearest recipes, merge them, and confirm the page list with the human.
