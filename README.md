# SkillSwap

SkillSwap is a web-based peer tutoring and booking platform built for the Integrated Final Project in Human-Computer Interaction and Integrative Programming and Technologies.

The system lets students find tutors, book tutoring sessions, view sessions, send messages, and receive notifications. Tutor mode supports booking request review, upcoming sessions, messages, and notifications.

## Project Requirements Covered

- HCI: user population analysis, existing system critique, Figma prototype, heuristic evaluation, and usability testing plan.
- IPT: web-based MVP, authentication, asynchronous messaging, XML and XSLT support, encryption/decryption, MongoDB models, and Socket.IO notifications.
- Integration: the implemented screens follow the Figma direction and connect to backend routes for authentication, booking, notification, and XML generation.

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Messaging: RabbitMQ with graceful fallback
- Real-time: Socket.IO
- Security: bcrypt password hashing, JWT authentication, AES-256-GCM encryption
- Data format: XML booking export with XSLT stylesheet

## Local Setup

Install backend dependencies:

```powershell
cd C:\Users\gino2\Desktop\SkillSwap\backend
npm install
```

Create a local environment file from the template:

```powershell
Copy-Item .env.example .env
```

Required environment variables:

```text
PORT=3000
FRONTEND_URL=http://localhost:3000
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
MONGO_URI=your_mongodb_uri_here
JWT_SECRET=your_jwt_secret_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
RABBITMQ_URL=your_rabbitmq_url_here
RABBITMQ_QUEUE=notifications
```

For production on Render, use:

```text
FRONTEND_URL=https://skillswap-9vg6.onrender.com
GOOGLE_REDIRECT_URI=https://skillswap-9vg6.onrender.com/auth/google/callback
```

The backend detects localhost requests and uses `http://localhost:3000` for local OAuth redirects, even when production URLs are configured for deployment.

## Google OAuth Setup

In Google Cloud Console, add these Authorized redirect URIs to the web OAuth client:

```text
http://localhost:3000/auth/google/callback
https://skillswap-9vg6.onrender.com/auth/google/callback
```

Also add these Authorized JavaScript origins:

```text
http://localhost:3000
https://skillswap-9vg6.onrender.com
```

## How To Run

Open PowerShell:

```powershell
cd C:\Users\gino2\Desktop\SkillSwap\backend
npm start
```

Then open:

```text
http://localhost:3000
```

If `npm start` is blocked by PowerShell script policy, use:

```powershell
node src/server.js
```

## RabbitMQ Setup

The backend reads RabbitMQ settings from `backend/.env`:

```text
RABBITMQ_URL=amqp://localhost
RABBITMQ_QUEUE=notifications
```

For local RabbitMQ, install and start RabbitMQ on your machine, then keep `RABBITMQ_URL=amqp://localhost`.

For an independent hosted RabbitMQ server, replace `RABBITMQ_URL` with the provider URL, for example:

```text
RABBITMQ_URL=amqps://username:password@host/vhost
```

The app will continue running if RabbitMQ is unavailable. In that case, booking notifications are saved directly as a fallback.

To run the optional queue consumer separately:

```powershell
cd C:\Users\gino2\Desktop\SkillSwap\backend
node src/services/consumer.js
```

## Demo Accounts

You can create a new account from the signup page.

For demo mode, any newly registered account works even if MongoDB Atlas is not reachable. This exists so the final presentation can continue even if the school network blocks Atlas or RabbitMQ.

## Main Demo Flow

1. Open `http://localhost:3000`.
2. Create a student account.
3. Go to Find Tutors.
4. Click Book Session.
5. Enter session details and confirm booking.
6. Show the booking confirmation modal.
7. Explain that the backend creates a booking, sends a notification event, encrypts session details, and writes booking XML.
8. Switch to tutor mode by signing up or logging in as a tutor, then show booking requests and notifications.

## Backend API Summary

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Check server, MongoDB, and RabbitMQ status |
| POST | `/api/auth/register` | Register student or tutor |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/skills` | List tutor skills |
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings` | List current user's bookings |
| PATCH | `/api/bookings/:id/status` | Accept or reject booking |
| GET | `/api/notifications` | List user notifications |
| PATCH | `/api/notifications/:id/read` | Mark notification as read |
| POST | `/api/security/demo` | Demonstrate encryption/decryption in demo mode |

## XML and XSLT

When a booking is created, the backend writes an XML file under:

```text
backend/src/xml/bookings
```

The XML links to:

```text
backend/src/xml/booking-summary.xsl
```

This demonstrates XML data support and XSLT transformation for readable booking summaries.

## Important Notes

MongoDB Atlas may reject the app if the current IP address is not whitelisted. The server continues in demo mode so the project remains presentable. For real persistence, whitelist the machine IP in MongoDB Atlas Network Access.

RabbitMQ is optional during demo. If RabbitMQ is running locally, messages are queued. If it is not running, notifications are saved directly or kept in demo memory.
