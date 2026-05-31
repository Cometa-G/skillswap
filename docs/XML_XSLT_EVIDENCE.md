# XML and XSLT Evidence

Use this page as documentation evidence if the browser opens the XML file as a blank page.

## Sample Generated Booking XML

Source file:

```text
backend/src/xml/bookings/booking_6a1b84a5cd3da9853e14f1d8.xml
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="../booking-summary.xsl"?>
<booking>
  <id>6a1b84a5cd3da9853e14f1d8</id>
  <student>6a1b84a4cd3da9853e14f1d7</student>
  <tutor>6a1b81557e761e60d11de6f5</tutor>
  <skill>HCI usability testing review</skill>
  <details>Need help preparing a usability testing plan and Nielsen heuristic evaluation for the final project.</details>
  <encryptedDetails>DKWcq5tV0dorz2Jk.c5pSuXd7Gt49U0831TnbHQ==.Vtm60FntUcICSzLdQWsmDSG8fdw92kBst3sVr6LdR5dVItv5mQ6YLuTrMh+mRCOXaZyr5O3ubwt1XCo4fhsUZIxQOo/aEndjpbr1HWPavOf4h3wPNnCyo9ptG9fhTEA7OgKjCA==</encryptedDetails>
  <status>pending</status>
  <createdAt>Sun May 31 2026 08:45:25 GMT+0800 (Singapore Standard Time)</createdAt>
</booking>
```

## XSLT Transformation File

Source file:

```text
backend/src/xml/booking-summary.xsl
```

Purpose:

- Converts booking XML into readable HTML.
- Displays booking ID, student, tutor, skill, details, status, created date, and encrypted details.
- Demonstrates XML transformation using XSLT.

## Why The Browser May Show A Blank Page

Some browsers restrict or behave inconsistently when loading local XML files with linked XSLT stylesheets through `file:///` paths. This does not mean the XML failed. The generated XML is valid and includes the XSLT link:

```xml
<?xml-stylesheet type="text/xsl" href="../booking-summary.xsl"?>
```

For documentation, screenshot this Markdown file, the raw XML file in VS Code, or the XSLT file in VS Code.
