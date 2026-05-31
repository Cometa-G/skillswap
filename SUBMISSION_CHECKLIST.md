# SkillSwap Final Submission Checklist

Use this checklist to finish the HCI x IPT final project without missing documentation requirements.

## Current Status

- Booking confirmation works.
- Backend health check works.
- MongoDB is connected.
- RabbitMQ is connected.
- Booking XML is generated in `backend/src/xml/bookings`.
- XSLT file exists at `backend/src/xml/booking-summary.xsl`.
- Encryption/decryption exists in `backend/src/security.js`.
- Draft files already exist:
  - `README.md`
  - `FINAL_REPORT.md`
  - `PRESENTATION_SCRIPT.md`

## Main Documentation Sections

- [ ] Title, authors, school, course
- [ ] Abstract
- [ ] Keywords
- [ ] I. Introduction
- [ ] II. Related Works and Conceptual Background
- [ ] III. User Analysis and Interface Evaluation
- [ ] IV. Prototype Design
- [ ] V. System Architecture and Integration
- [ ] VI. System Implementation
- [ ] VI.A Messaging Service Implementation
- [ ] VI.B XML Processing Implementation
- [ ] VI.C Security Implementation
- [ ] VI.D Technologies Used
- [ ] VII. Results and Discussion
- [ ] VIII. Conclusion
- [ ] References

## Required Appendices

### Appendix A - Project Concept

- [ ] Project title
- [ ] Problem statement
- [ ] Target users
- [ ] Core features
- [ ] Selected app idea
- [ ] Team roles and responsibilities

### Appendix B - User Analysis Artifacts

- [ ] User profiles
- [ ] User characteristics
- [ ] User personas
- [ ] User population analysis
- [ ] Accessibility considerations

### Appendix C - Existing Interface Evaluation

- [ ] Evaluated similar system
- [ ] Strengths and weaknesses
- [ ] Cognitive model analysis
- [ ] Screenshots of similar system

### Appendix D - Prototype Design

- [ ] Figma link
- [ ] Low-fidelity prototype or wireframe evidence
- [ ] High-fidelity prototype
- [ ] Navigation flow

### Appendix E - Heuristic Evaluation Results

- [ ] Nielsen heuristic checklist
- [ ] Strengths identified
- [ ] Issues identified
- [ ] Recommended improvements

### Appendix F - Usability Testing Plan

- [ ] Test participants
- [ ] Test tasks
- [ ] Metrics
- [ ] Success criteria

### Appendix G - System Architecture Diagram

- [ ] User interface component
- [ ] Application layer
- [ ] Messaging component
- [ ] XML component
- [ ] Security component
- [ ] Database

### Appendix H - Messaging Service Design

- [ ] RabbitMQ workflow
- [ ] Producer component: booking creation
- [ ] Consumer component: notification processing
- [ ] Queue name: `notifications`
- [ ] Sample notification screenshot
- [ ] Source code listing from `backend/src/services/rabbitmq.js`

### Appendix I - XML Processing Artifacts

- [ ] Sample XML from `backend/src/xml/bookings`
- [ ] XSLT file from `backend/src/xml/booking-summary.xsl`
- [ ] Screenshot of XML output
- [ ] Screenshot or explanation of XML transformation output

### Appendix K - Security Implementation

- [ ] Login interface screenshot
- [ ] Authentication workflow
- [ ] Password hashing evidence from `backend/src/controllers/authController.js`
- [ ] Encryption/decryption evidence from `backend/src/security.js`
- [ ] Screenshot/result of `/api/security/demo`

### Appendix K/L - Source Code and Screenshots

- [ ] Main server code: `backend/src/server.js`
- [ ] Messaging code: `backend/src/services/rabbitmq.js`
- [ ] Booking code: `backend/src/controllers/bookingController.js`
- [ ] XML/XSLT evidence
- [ ] Security code evidence
- [ ] Home screen screenshot
- [ ] Booking confirmation screenshot
- [ ] Notification screen screenshot
- [ ] Tutor booking request screenshot

### Appendix M - Team Contribution Statement

- [ ] Member names
- [ ] Roles
- [ ] Contributions

## Screenshots To Capture Next

1. Landing page
2. Login page
3. Student dashboard
4. Find Tutors page
5. Booking page
6. Booking confirmation modal
7. My Sessions page
8. Notifications page
9. Tutor dashboard or booking request page
10. Generated XML file
11. XSLT file or transformed XML output
12. `/api/health` output showing MongoDB and RabbitMQ status
13. `/api/security/demo` output showing encryption and decryption

## Final Demo Script Flow

1. Show landing page and explain problem.
2. Sign up or log in as student.
3. Find a tutor.
4. Book a session.
5. Show booking confirmation.
6. Show generated XML file.
7. Show XSLT file.
8. Show health endpoint.
9. Explain RabbitMQ, Socket.IO, MongoDB, JWT, bcrypt, and AES encryption.
10. Show tutor mode booking requests or notifications.
