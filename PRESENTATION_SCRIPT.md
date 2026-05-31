# SkillSwap Presentation Script

## Part 1: App Concept

Good day. Our project is called SkillSwap. It is a web-based tutoring and skill-sharing platform for students and student tutors.

The problem we are solving is that students often need academic help but do not have one organized place to find tutors, book sessions, track schedules, and receive booking updates.

Our target users are students who need help in subjects like HCI, programming, and UI/UX, and tutors who want to offer their skills and manage booking requests.

## Part 2: HCI Implementation

Before building, we designed the system around our users.

For students, we focused on fast tutor discovery, clear tutor information, and a simple booking flow. For tutors, we focused on booking request visibility, session management, and notification updates.

We reviewed similar tutoring and appointment systems and noticed common problems such as unclear booking status, too many steps, and weak confirmation feedback.

Our Figma prototype guided the layout, including the dashboard, find tutor page, booking page, messages, sessions, and notifications.

We evaluated the design using Nielsen heuristics. For example:

- Visibility of system status is shown through confirmation modals and notifications.
- Consistency is shown through repeated dashboard layout, buttons, cards, and badges.
- Error prevention is handled through required fields and password confirmation.
- Recognition rather than recall is supported through visible tutor details and booking summaries.

Our usability testing plan asks users to register, find a tutor, book a session, view notifications, and respond to a booking request as a tutor.

## Part 3: IPT Implementation

For the technical implementation, SkillSwap is built with HTML, CSS, JavaScript, Node.js, Express, MongoDB, RabbitMQ, Socket.IO, XML, XSLT, and encryption.

First, we have authentication. Users can register and log in. Passwords are hashed using bcrypt, and protected API routes use JWT.

Second, we have the booking workflow. A student can select a tutor and create a booking request. The backend stores the booking and creates a notification.

Third, we implemented asynchronous messaging. When a booking is created, the backend sends a `NEW_BOOKING` event to RabbitMQ. If RabbitMQ is unavailable during demo, the system uses fallback logic so the app still works.

Fourth, we use Socket.IO for real-time notification events.

Fifth, we support XML and XSLT. Booking data is exported into XML files, and the XML links to an XSLT file that transforms it into a readable booking summary.

Sixth, we implemented encryption and decryption. Passwords are hashed, and booking details are encrypted using AES-256-GCM before storage.

## Demo Flow

1. Open the landing page.
2. Register as a student.
3. Go to Find Tutors.
4. Choose a tutor and open Book Session.
5. Enter a topic or session details.
6. Confirm booking.
7. Show the confirmation modal.
8. Explain that the backend created a booking, encrypted details, generated XML, and sent a notification event.
9. Switch to tutor mode and show booking requests.
10. Show the notifications page.

## Closing

SkillSwap combines HCI design work with functional IPT integration. The final system reflects our prototype and demonstrates authentication, booking, asynchronous messaging, XML/XSLT, encryption, and real-time notifications.
