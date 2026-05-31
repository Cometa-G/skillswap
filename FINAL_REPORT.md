# Integrated Final Project Report: SkillSwap

## 1. App Concept

SkillSwap is a web-based tutoring marketplace where students can discover tutors, book learning sessions, manage scheduled sessions, send messages, and receive notifications. Tutors can view booking requests, manage upcoming sessions, and respond to student needs.

### Problem

Students often struggle to find available tutors quickly, compare skills, schedule sessions, and track booking updates in one place. Communication can become scattered across messaging apps, class groups, and informal posts.

### Target Users

- Students who need academic help, exam preparation, or skill development.
- Student tutors who want to offer their knowledge and manage requests.
- Busy learners who need fast scheduling and clear booking status updates.

### Minimum Functional Scope

- Account registration and login for students and tutors.
- Tutor discovery and session booking.
- Booking confirmation and session tracking.
- Notifications for booking updates.
- Tutor booking request view.
- XML booking export and encrypted booking details.

## 2. HCI Implementation

### User Population Analysis

Primary student users need a simple and trustworthy way to find tutors. They value clear tutor information, visible pricing, booking availability, and confirmation feedback. Tutor users need request visibility, quick response actions, and session organization.

Important user concerns:

- Students may be first-time users and need obvious navigation.
- Users may be under deadline pressure and need fast booking.
- Tutors need to understand who booked, what topic is requested, and when the session will happen.
- Both user groups need feedback after actions such as login, booking, and approval.

### Existing System Critique

Similar systems include tutoring marketplaces and appointment booking apps. Common usability problems include cluttered tutor cards, unclear booking status, too many steps before confirmation, and weak feedback after submission.

SkillSwap improves this by using:

- Clear sidebar navigation.
- Separate student and tutor experiences.
- Direct booking action from tutor cards.
- Booking summary before confirmation.
- Confirmation modal after booking.
- Notification page for status updates.

### Prototype Design

The project uses a Figma prototype as the visual basis for the implementation:

```text
HCI WEB DESIGN
https://www.figma.com/proto/vua6MdjYpLA6VlIiGm00P4/HCI-WEB-DESIGN?node-id=0-1&t=83X7ADj8aiBYdD8B-1
```

Implemented screens include:

- Landing page
- Login
- Signup
- Student dashboard
- Tutor dashboard mode
- Find tutor
- Booking
- My sessions
- Messages
- Notifications
- Contact

### Heuristic Evaluation

| Nielsen Heuristic | SkillSwap Implementation |
| --- | --- |
| Visibility of system status | Booking confirmation modal, notification badges, toast messages |
| Match between system and real world | Tutor cards, session schedules, booking requests, payment summary |
| User control and freedom | Navigation sidebar, close modal, return links |
| Consistency and standards | Shared layout, repeated buttons, consistent badges and cards |
| Error prevention | Required form fields, password confirmation check |
| Recognition rather than recall | Visible tutor details, booking summary, sidebar labels |
| Flexibility and efficiency | Quick actions and direct booking buttons |
| Aesthetic and minimalist design | Clean dashboard, grouped sections, readable hierarchy |
| Help users recover from errors | Form validation and error toast messages |
| Help and documentation | Help center card and project README |

### Usability Testing Plan

Task 1: Register as a student.

- Success criteria: user reaches dashboard without confusion.
- Time target: under 2 minutes.

Task 2: Find and book a tutor.

- Success criteria: user selects a tutor, chooses schedule details, and sees booking confirmation.
- Time target: under 3 minutes.

Task 3: View notifications.

- Success criteria: user can locate booking-related updates from the sidebar.
- Time target: under 1 minute.

Task 4: Tutor accepts booking request.

- Success criteria: tutor can view request details and open approval confirmation.
- Time target: under 2 minutes.

Metrics:

- Task completion rate
- Time on task
- Number of user errors
- User satisfaction rating
- Comments on confusing labels or layout

## 3. IPT Implementation

### Web-Based MVP

The MVP is built with static frontend pages served by an Express backend. The backend exposes API routes for authentication, skills, bookings, and notifications.

### Asynchronous Messaging

RabbitMQ is used for booking notification events. When a student creates a booking, the backend sends a `NEW_BOOKING` event to the `notifications` queue. If RabbitMQ is unavailable during demo, the app falls back gracefully so the presentation does not fail.

### Real-Time Notification

Socket.IO is used to join users into rooms and emit real-time notification events such as `new_notification` and `new_booking`.

### XML and XSLT

Booking data is exported as XML under:

```text
backend/src/xml/bookings
```

The XML files link to:

```text
backend/src/xml/booking-summary.xsl
```

This XSLT transforms booking XML into a readable HTML booking summary.

### Encryption and Decryption

The project uses:

- bcrypt for password hashing during registration and login.
- JWT for authenticated API access.
- AES-256-GCM in `backend/src/security.js` for encrypting and decrypting app data such as booking details.

### Database Models

Main MongoDB models:

- `User`: username, hashed password, role.
- `Skill`: tutor, title, description, category, availability.
- `Booking`: student, tutor, skill, encrypted details, status.
- `Notification`: title, message, type, recipient, read status.

## 4. Integration

The implemented system follows the Figma design direction and connects HCI screens to IPT backend features. The student booking flow demonstrates the full project integration:

1. Student logs in.
2. Student selects a tutor.
3. Student creates a booking.
4. Backend validates JWT.
5. Booking details are encrypted.
6. Booking is saved or stored in demo mode.
7. Notification event is sent through RabbitMQ or fallback.
8. Socket.IO can emit real-time updates.
9. Booking XML is generated with XSLT support.

## 5. Team Roles

- Product Lead: app concept, user problem, target users, feature scope.
- UX/UI Designer: Figma prototype, usability testing plan, heuristic evaluation.
- Core Developer: frontend pages, backend API, booking flow, Socket.IO.
- Security and Documentation: authentication, encryption, XML/XSLT, final documentation.

## 6. Limitations and Future Improvements

- MongoDB Atlas requires IP whitelisting for real persistence.
- RabbitMQ must be installed and running locally for full queue demonstration.
- Payment processing is represented as a prototype flow only.
- Future work can add real chat persistence, tutor profile CRUD, admin dashboard, and deployment.
