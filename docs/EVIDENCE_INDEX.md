# Evidence Index

This folder contains the screenshots and technical evidence for the SkillSwap final documentation.

## Website Screenshots

| File | Use In Documentation |
| --- | --- |
| `01-login.png` | Figure K.1 Login Interface / Authentication evidence |
| `02-find-tutors.png` | Figure L.2 Main Functional Screen |
| `03-booking-page.png` | Booking workflow / User task evidence |
| `04-booking-confirmed.png` | Booking success / Sample notification-result evidence |
| `05-notifications.png` | Figure L.3 Notification Screen / Messaging output |
| `06-my-sessions.png` | Session management result |
| `07-tutor-booking-requests.png` | Tutor workflow / Booking request evidence |

## Technical Evidence To Capture

### API Health

Open this URL in the browser:

```text
http://localhost:3000/api/health
```

Expected output:

```json
{
  "status": "ok",
  "mongoConnected": true,
  "rabbitConnected": true
}
```

Use this as evidence for the database and messaging service connection.

### Encryption / Decryption Demo

PowerShell command:

```powershell
$body = @{ text='SkillSwap encrypts booking details for IPT security evidence.' } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3000/api/security/demo -Method Post -ContentType 'application/json' -Body $body
```

Expected output includes:

```json
{
  "original": "SkillSwap encrypts booking details for IPT security evidence.",
  "encrypted": "long encrypted text",
  "decrypted": "SkillSwap encrypts booking details for IPT security evidence.",
  "algorithm": "AES-256-GCM"
}
```

Use this as Figure K.3 Encryption/Hashing Demonstration.

### XML Evidence

Use this clean evidence XML file:

```text
backend/src/xml/bookings/booking_6a1b84a5cd3da9853e14f1d8.xml
```

It contains readable booking details and encrypted booking details.

### XSLT Evidence

Use this XSLT file:

```text
backend/src/xml/booking-summary.xsl
```

This transforms booking XML into a readable SkillSwap booking summary.

## Recommended Missing Screenshots

Capture these next if time allows:

1. Landing page at `http://localhost:3000/index.html`
2. Signup page at `http://localhost:3000/signup.html`
3. API health output at `http://localhost:3000/api/health`
4. PowerShell encryption demo output
5. XML file opened in VS Code
6. XSLT file opened in VS Code
