const SkillSwapRole = (() => {
  const ROLE_KEY = 'skillswapRole';
  const storage = window.sessionStorage;
  let selectedLoginRole = storage.getItem(ROLE_KEY) || 'student';

  function setStoredRole(role) {
    storage.setItem(ROLE_KEY, role);
    localStorage.removeItem(ROLE_KEY);
  }

  function icon(name) {
    const icons = {
      dashboard: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
      calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
      users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/>',
      message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
      bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
      heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
      star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
      user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
      settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
      logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
      search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
      money: '<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 9h.01M18 15h.01"/>',
      clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
      video: '<path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>',
      file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>'
    };
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${icons[name]}</svg>`;
  }

  function navItem(file, label, iconName, currentFile) {
    const active = currentFile === file ? ' active' : '';
    return `<a href="${file}" class="sidebar-nav-item${active}">${icon(iconName)}<span>${label}</span></a>`;
  }

  function getLoggedInTutor() {
    const user = window.SkillSwapApp?.getUser?.();
    const name = displayName(user, 'Tutor');
    return {
      name,
      firstName: name.split(' ')[0] || 'Tutor',
      initials: name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'T'
    };
  }

  function applyTutorShell() {
    const currentFile = location.pathname.split('/').pop() || 'dashboard.html';
    const tutor = getLoggedInTutor();
    const sidebarNav = document.querySelector('.sidebar-nav');
    if (sidebarNav) {
      sidebarNav.innerHTML = [
        navItem('dashboard.html', 'Dashboard', 'dashboard', currentFile),
        navItem('my-sessions.html', 'My Sessions', 'calendar', currentFile),
        navItem('find-tutor.html', 'Booking Request', 'users', currentFile),
        navItem('messages.html', 'Messages', 'message', currentFile),
        navItem('notifications.html', 'Notifications', 'bell', currentFile),
        '<div class="sidebar-nav-divider"></div>',
        navItem('#', 'Favorites', 'heart', currentFile),
        navItem('tutor-reviews.html', 'My Reviews', 'star', currentFile),
        navItem('tutor-profile.html', 'Profile', 'user', currentFile),
        navItem('tutor-settings.html', 'Setting', 'settings', currentFile),
        '<a href="login.html" class="sidebar-nav-item tutor-logout-link">' + icon('logout') + '<span>Log-out</span></a>'
      ].join('');
    }

    document.querySelectorAll('.dashboard-user').forEach(user => {
      user.innerHTML = `
        <div class="avatar-photo avatar-md">${tutor.initials}</div>
        <div class="dashboard-user-info">
          <span class="dashboard-user-name">${tutor.name}</span>
          <span class="dashboard-user-role">Tutor</span>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
      `;
    });

    document.querySelectorAll('.dashboard-header').forEach(header => {
      const existingWelcome = header.querySelector('.tutor-header-welcome');
      if (existingWelcome) existingWelcome.remove();
      const welcome = document.createElement('div');
      welcome.className = 'tutor-header-welcome';
      welcome.innerHTML = `<span>Welcome,</span><strong>${tutor.firstName}!</strong>`;
      const toggle = header.querySelector('#sidebarToggle');
      if (toggle && toggle.nextSibling) {
        header.insertBefore(welcome, toggle.nextSibling);
      } else {
        header.prepend(welcome);
      }
    });

    document.querySelectorAll('.dashboard-search input').forEach(input => {
      input.placeholder = 'Search tutors, subjects, or skills...';
    });
  }

  function tutorMetric(iconName, label, value, linkText, accentClass) {
    return `
      <div class="tutor-metric-card">
        <div class="tutor-metric-icon ${accentClass}">${icon(iconName)}</div>
        <div class="tutor-metric-body">
          <span>${label}</span>
          <strong>${value}</strong>
          <a href="#">${linkText} <span>-></span></a>
        </div>
      </div>
    `;
  }

  function tutorDashboard() {
    return `
      <div class="tutor-metrics-grid">
        ${tutorMetric('calendar', 'Upcoming Sessions', '0', 'View your schedule', 'blue')}
        ${tutorMetric('users', 'Booking Request', '0', 'View Booking Request', 'green')}
        ${tutorMetric('money', 'Total Earnings', 'Php 24,650', 'View earnings', 'orange')}
        ${tutorMetric('star', 'Rating', '4.9', '120 reviews', 'purple')}
      </div>
      <div class="tutor-dashboard-grid">
        <section class="tutor-panel tutor-main-panel" id="tutorDashboardSessions">
          <div class="tutor-panel-header"><h2>Upcoming Sessions</h2><a href="my-sessions.html">View all</a></div>
          <p class="empty-schedule-note">Live approved bookings will appear here.</p>
        </section>
        <section class="tutor-panel" id="tutorDashboardNotifications">
          <div class="tutor-panel-header"><h2>Recent notifications</h2><a href="notifications.html">View all</a></div>
          <p class="empty-schedule-note">Live booking updates will appear here.</p>
        </section>
        <section class="tutor-panel tutor-main-panel">
          <div class="tutor-panel-header"><h2>Performance Overview</h2></div>
          <div class="performance-grid">
            ${performanceItem('4.8', '98%', 'Session Completion')}
            ${performanceItem('4.8', '96%', 'Student Satisfaction')}
            ${performanceItem('4.5', '< 2h', 'Response Time')}
            ${performanceItem('5', '100%', 'Punctuality')}
          </div>
        </section>
        <section class="tutor-panel">
          <div class="tutor-panel-header"><h2>Quick Actions</h2></div>
          <div class="tutor-action-grid">
            ${quickAction('find-tutor.html', 'search', 'Find Tutors', 'blue')}
            ${quickAction('find-tutor.html', 'calendar', 'Bookings', 'orange')}
            ${quickAction('messages.html', 'message', 'Messages', 'green')}
            ${quickAction('my-sessions.html', 'file', 'My Sessions', 'indigo')}
          </div>
        </section>
      </div>
    `;
  }

  function sessionRow(name, title, tag, date, time) {
    return `
      <div class="tutor-session-row">
        <div class="avatar-photo avatar-lg">${name.split(' ').map(n => n[0]).join('')}</div>
        <div>
          <h3>${name}</h3>
          <p>${title} <span class="badge badge-purple">${tag}</span></p>
          <small>${date} &nbsp;&nbsp; ${time}</small>
        </div>
        <span class="badge badge-green">Confirmed</span>
        <button class="btn btn-outline btn-sm">View Details</button>
      </div>
    `;
  }

  function liveTutorSessionRow(booking) {
    const student = displayName(booking.student, 'Student');
    const title = booking.skill || 'Tutoring session';
    const tag = booking.tutorName || 'SkillSwap';
    const date = booking.sessionDate || 'May 31, 2026';
    const time = booking.sessionTime || '4:00 PM';
    const status = normalizeStatus(booking.status);
    const badge = booking.status === 'accepted' ? 'badge-green' : booking.status === 'rejected' ? 'badge-yellow' : 'badge-yellow';
    return `
      <div class="tutor-session-row">
        <div class="avatar-photo avatar-lg">${student.split(' ').map(n => n[0]).join('')}</div>
        <div>
          <h3>${student}</h3>
          <p>${title} <span class="badge badge-purple">${tag}</span></p>
          <small>${date} &nbsp;&nbsp; ${time}</small>
        </div>
        <span class="badge ${badge}">${status}</span>
        <a href="find-tutor.html" class="btn btn-outline btn-sm">View Details</a>
      </div>
    `;
  }

  async function loadTutorDashboard() {
    if (!document.getElementById('tutorDashboardSessions')) return;

    try {
      const bookings = await apiRequest('/bookings');
      const pending = bookings.filter(item => item.status === 'pending').length;
      const accepted = bookings.filter(item => item.status === 'accepted').length;
      const metricValues = document.querySelectorAll('.tutor-metric-body strong');
      if (metricValues[0]) metricValues[0].textContent = String(accepted);
      if (metricValues[1]) metricValues[1].textContent = String(pending);

      const sessionsPanel = document.getElementById('tutorDashboardSessions');
      const acceptedBookings = bookings.filter(item => item.status === 'accepted').slice(0, 3);
      sessionsPanel.querySelectorAll('.tutor-session-row, .empty-schedule-note').forEach(node => node.remove());
      sessionsPanel.insertAdjacentHTML('beforeend', acceptedBookings.length
        ? acceptedBookings.map(liveTutorSessionRow).join('')
        : '<p class="empty-schedule-note">No approved sessions yet.</p>');

      const notificationsPanel = document.getElementById('tutorDashboardNotifications');
      notificationsPanel.querySelectorAll('.mini-notice, .empty-schedule-note').forEach(node => node.remove());
      notificationsPanel.insertAdjacentHTML('beforeend', bookings.slice(0, 4).map((booking) => {
        const student = displayName(booking.student, 'Student');
        const text = booking.status === 'pending'
          ? `${student} requested ${booking.skill || 'a session'}.`
          : `${student}'s booking is ${normalizeStatus(booking.status).toLowerCase()}.`;
        return miniNotice('users', text, 'Live update', booking.status === 'accepted' ? 'green' : 'blue');
      }).join('') || '<p class="empty-schedule-note">No live booking updates yet.</p>');
    } catch (err) {
      window.SkillSwapApp?.notify?.(`Could not load tutor dashboard: ${err.message}`, 'error');
    }
  }

  function miniNotice(iconName, text, time, color) {
    return `
      <div class="mini-notice">
        <div class="mini-notice-icon ${color}">${icon(iconName)}</div>
        <div><p>${text}</p><span>${time}</span></div>
      </div>
    `;
  }

  function performanceItem(score, value, label) {
    return `<div class="performance-item"><span class="rating-star">★ ${score}</span><strong>${value}</strong><p>${label}</p></div>`;
  }

  function quickAction(href, iconName, label, color) {
    return `<a href="${href}" class="quick-tile ${color}">${icon(iconName)}<span>${label}</span></a>`;
  }

  async function apiRequest(path, options = {}) {
    if (!window.SkillSwapApp?.request) throw new Error('SkillSwap API is not ready');
    return window.SkillSwapApp.request(path, options);
  }

  function displayName(user, fallback = 'Student') {
    if (!user?.username) return fallback;
    return user.username.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }

  function normalizeStatus(status) {
    if (status === 'accepted') return 'Accepted';
    if (status === 'rejected') return 'Declined';
    return 'Pending';
  }

  async function loadTutorRequests() {
    const list = document.getElementById('liveTutorRequests');
    if (!list) return;

    try {
      const bookings = await apiRequest('/bookings');
      if (!bookings.length) {
        list.innerHTML = '<section class="tutor-panel"><h2>No booking requests yet</h2><p>New student bookings will appear here.</p></section>';
        updateRequestOverview([]);
        return;
      }

      list.innerHTML = bookings.map((booking) => {
        const student = displayName(booking.student, 'Student');
        const date = booking.sessionDate || 'May 31, 2026';
        const time = booking.sessionTime || '4:00 PM';
        return requestCard(
          student,
          booking.status === 'pending' ? 'New Student' : 'Student',
          booking.tutorName || 'SkillSwap Tutoring',
          booking.skill || 'HCI tutoring session',
          date,
          time.includes('-') ? time : `${time} - 5:00 PM`,
          'Live request',
          normalizeStatus(booking.status),
          '23h 45m',
          booking._id || booking.id,
          booking.status || 'pending'
        );
      }).join('');
      updateRequestOverview(bookings);
    } catch (err) {
      list.insertAdjacentHTML('afterbegin', `<section class="tutor-panel"><h2>Could not load live requests</h2><p>${err.message}</p></section>`);
    }
  }

  function updateRequestOverview(bookings) {
    const overview = document.querySelector('.request-overview');
    if (!overview) return;
    const pending = bookings.filter(item => item.status === 'pending').length;
    const accepted = bookings.filter(item => item.status === 'accepted').length;
    const declined = bookings.filter(item => item.status === 'rejected').length;
    overview.innerHTML = `<h2>Request Overview</h2><p><strong>${pending}</strong> Pending Requests</p><p><strong>${pending}</strong> Expiring Soon</p><p><strong>${accepted}</strong> Accepted</p><p><strong>${declined}</strong> Declined</p><a href="#">View full analytics ></a>`;
  }

  function tutorMessages() {
    return window.SkillSwapMessaging?.layout?.() || '<main id="messagingRoot"></main>';
  }

  function tutorNotifications() {
    return `
      <div class="tutor-page-heading"><h1>Notifications</h1><p>Chat with your tutors and manage your conversation</p></div>
      <div class="tutor-notification-layout">
        <main>
          <div class="section-kicker"><span>TODAY</span><strong>3 new</strong></div>
          ${notificationRow('calendar', 'New booking request approved', 'You Approved the booking request of Deniel Javier', 'Just now', 'View Request', 'green')}
          ${notificationRow('clock', 'Session starting soon', 'Your session with Maekyla Roble starts in 30 minutes', '15 min ago', 'View Session', 'orange')}
          ${notificationRow('message', 'New message from Maekyla Roble', '"Hi! I have a few questions about the upcoming session..."', '1 hour ago', 'Reply', 'blue')}
        </main>
        <aside>
          <section class="tutor-panel"><h2>Notification Filters</h2>${filterRow('bell','All Notifications','24',true)}${filterRow('clock','Unread','8')}${filterRow('calendar','Bookings','12')}${filterRow('message','Messages','5')}${filterRow('star','Reviews','3')}${filterRow('money','Payments','6')}</section>
          <section class="tutor-panel"><h2>Quick Actions</h2>${filterRow('calendar','Mark all as read','')}${filterRow('settings','Notification Settings','')}${filterRow('message','Email Preferences','')}</section>
        </aside>
      </div>
    `;
  }

  function notificationRow(iconName, title, text, time, action, color) {
    return `<article class="tutor-notification-row"><div class="mini-notice-icon ${color}">${icon(iconName)}</div><div><h3>${title}</h3><p>${text}</p><span>${time}</span></div><button>${action}</button></article>`;
  }

  function filterRow(iconName, label, count, active = false) {
    return `<div class="tutor-filter-row ${active ? 'active' : ''}"><span>${icon(iconName)}${label}</span><strong>${count}</strong></div>`;
  }

  function tutorRequests() {
    return `
      <div class="tutor-page-heading"><h1>Booking Requests</h1><p>Review and manage incoming session requests from students.</p></div>
      <div class="tutor-request-layout">
        <main id="liveTutorRequests">
          <div class="request-tabs"><button class="active">All Requests</button><button>Pending 12</button><button>Accepted 24</button><button>Declined 8</button><span></span><button>Filter</button><button>Sort by Newest</button></div>
          ${requestCard('Deniel Javier', 'New Student', 'Programming', 'Python Fundamentals', 'May 30, 2026', '10:00 AM - 11:00 AM', '95% match', 'Pending', '23h 45m')}
          ${requestCard('Maekyla Roble', 'Regular Student', 'Programming', 'Python Basics', 'May 30, 2026', '2:00 PM - 3:00 PM', '88% match', 'Urgent', '5h 12m')}
          ${requestCard('Emma Rodriguez', 'Regular Student', 'HCI', 'Fundamentals of Designing', 'May 31, 2026', '3:30 PM - 4:30 PM', '92% match', 'Pending', '18h 30m')}
          ${requestCard('Alex Patel', 'Regular Student', 'UI/UX Designing', 'Introduction to Figma', 'June 1, 2026', '11:00 AM - 12:00 PM', '90% match', 'Pending', '47h 15m')}
        </main>
        <aside>
          <section class="tutor-panel request-overview"><h2>Request Overview</h2><p><strong>12</strong> Pending Requests</p><p><strong>3</strong> Expiring Soon</p><p><strong>24</strong> Accepted</p><p><strong>8</strong> Declined</p><a href="#">View full analytics ></a></section>
          <section class="tutor-panel schedule-card"><h2>Today's Schedule</h2><p>Friday, May 29, 2026</p><ul><li><strong>10:00 AM</strong> Sarah Kim <span>Confirmed</span></li><li><strong>1:00 PM</strong> Alex Patel <span>Confirmed</span></li><li><strong>3:30 PM</strong> Available Slot <span>Available</span></li></ul></section>
          <section class="tutor-panel availability-card"><h2>Update Your Availability</h2><p>Keep your schedule current to receive more bookings</p><button>Manage Availability</button></section>
        </aside>
      </div>
      ${tutorApprovalModal()}
    `;
  }

  function requestCard(name, type, subject, topic, date, time, match, status, expires, bookingId = '', rawStatus = 'pending') {
    const isClosed = rawStatus === 'accepted' || rawStatus === 'rejected';
    return `
      <article class="request-card" data-booking-id="${bookingId}" data-student="${name}" data-subject="${subject}" data-topic="${topic}" data-date="${date}" data-time="${time}">
        <div><div class="avatar-photo avatar-lg">${name.split(' ').map(n => n[0]).join('')}</div><h3>${name}</h3><span>${type}</span><p>Subject</p><strong>${subject}</strong><p>Requested topic</p><strong>${topic}</strong><small>${match}</small></div>
        <div class="request-details"><p>Session Type<br><strong>1-on-1 Session</strong></p><p>Date<br><strong>${date}</strong></p><p>Time<br><strong>${time}</strong></p><p>Duration<br><strong>60 mins</strong></p><p>Mode<br><strong>Online Session</strong></p></div>
        <div class="request-actions"><span class="request-status">${status}</span><p>${isClosed ? 'Response saved' : `Expires in ${expires}`}</p><button onclick="SkillSwapRole.showTutorApprovalModal(this)" ${isClosed ? 'disabled' : ''}>${rawStatus === 'accepted' ? 'Accepted' : 'Accept Booking'}</button><button onclick="SkillSwapRole.declineTutorBooking(this)" ${isClosed ? 'disabled' : ''}>Decline</button><button onclick="SkillSwapRole.showTutorRequestDetails(this)">View Details</button></div>
      </article>
    `;
  }

  function tutorRequestDetails(data) {
    const student = data.student || 'Deniel Javier';
    const subject = data.subject || 'Programming';
    const topic = data.topic || 'Python Fundamentals';
    const date = data.date || 'May 30, 2026';
    const time = data.time || '10:00 AM - 11:00 AM';
    const bookingId = data.bookingId || '';
    const initials = student.split(' ').map(part => part[0]).join('');

    return `
      <div class="tutor-page-heading booking-detail-heading">
        <button class="btn btn-outline btn-sm" onclick="SkillSwapRole.showTutorRequestList()">Back to Requests</button>
        <div>
          <h1>Booking Request</h1>
          <p>Review the booking request details and respond to the student.</p>
        </div>
      </div>

      <div class="booking-detail-layout" data-booking-id="${bookingId}" data-student="${student}" data-subject="${subject}" data-topic="${topic}" data-date="${date}" data-time="${time}">
        <main>
          <section class="booking-detail-card">
            <h2>Session Details</h2>
            <div class="detail-metric-grid">
              ${detailMetric('users', 'Session Type', '1-on-1 Session', 'blue')}
              ${detailMetric('file', 'Subject', subject, 'purple')}
              ${detailMetric('clock', 'Duration', '60 mins', 'orange')}
              ${detailMetric('money', 'Rate', '₱350 / hour', 'green')}
            </div>
            <div class="detail-time-strip">
              <div><span>Date & Time</span><strong>${date}<br>(Friday)</strong></div>
              <div><span>Time</span><strong>${time}<br>(GMT+8)</strong></div>
              <div><span>Location</span><strong><i></i> Online Session</strong></div>
            </div>
          </section>

          <section class="booking-detail-card">
            <h2>Student Message <span>(Optional)</span></h2>
            <p class="student-message-box">Hi Sir Hyacinth! I'm currently learning programming and would like to improve my understanding of ${topic.toLowerCase()}, especially topics like variables, loops, functions, and basic problem-solving. I sometimes struggle with coding exercises and debugging, so I'm hoping you can guide me through the concepts step by step. I have an upcoming exam next week, and I want to build more confidence before then.</p>
          </section>

          <section class="booking-detail-card">
            <h2>Student Materials <span>(1)</span></h2>
            <div class="material-row">
              <div class="mini-notice-icon orange">${icon('file')}</div>
              <div><strong>${topic.replaceAll(' ', '-')}.pdf</strong><span>1.2 MB</span></div>
              <button class="icon-btn" aria-label="Download material">${icon('file')}</button>
            </div>
          </section>

          <section class="booking-detail-card">
            <h2>Your Schedule</h2>
            <p class="empty-schedule-note">You have no other sessions at this time.</p>
            <button class="btn btn-outline w-full">View My Schedule</button>
          </section>
        </main>

        <aside>
          <section class="booking-side-card response-timer">
            <span>Time to respond</span>
            <strong>23h : 43m : 01s</strong>
            <p>Request expires on May 28, 2026 10:30 AM</p>
          </section>

          <section class="booking-side-card student-profile-card">
            <h2>Student Information</h2>
            <div class="avatar-photo avatar-lg">${initials}</div>
            <h3>${student}</h3>
            <span class="badge badge-purple">Regular Student</span>
            <div class="student-profile-stats"><strong>★ 4.8</strong><span>(36 reviews)</span><strong>12</strong><span>Sessions</span></div>
            <h4>About ${student.split(' ')[0]}</h4>
            <p>Computer Science student who loves learning new things and improving his skills.</p>
            <a href="#">View full profile -></a>
          </section>

          <section class="booking-side-card">
            <h2>Payment & Earnings</h2>
            <div class="earning-row"><span>Session Rate</span><strong>₱350.00</strong></div>
            <div class="earning-row"><span>Platform Fee (10%)</span><strong>- ₱35.00</strong></div>
            <div class="earning-row earning-total"><span>You'll Earn</span><strong>₱315.00</strong></div>
            <p class="payment-note">Payment will be processed after the session is completed.</p>
          </section>

          <section class="booking-side-card respond-card">
            <h2>Respond to Request</h2>
            <button class="btn btn-primary" onclick="SkillSwapRole.showTutorApprovalModal(this)">Accept Booking</button>
            <button class="btn btn-outline decline-btn" onclick="SkillSwapRole.declineTutorBooking(this)">Decline Booking</button>
            <p>This action cannot be undone.</p>
          </section>
        </aside>
      </div>
      ${tutorApprovalModal()}
    `;
  }

  function detailMetric(iconName, label, value, color) {
    return `
      <div class="detail-metric">
        <div class="mini-notice-icon ${color}">${icon(iconName)}</div>
        <div><span>${label}</span><strong>${value}</strong></div>
      </div>
    `;
  }

  function tutorApprovalModal() {
    return `
      <div class="tutor-approval-overlay" id="tutorApprovalModal" aria-hidden="true">
        <section class="tutor-approval-card" role="dialog" aria-modal="true" aria-labelledby="approvalTitle">
          <div class="tutor-approval-icon">
            <div>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
          </div>
          <h2 id="approvalTitle">Booking Request Approved!</h2>
          <p class="tutor-approval-subtitle">The student has been added to your upcoming sessions.</p>

          <div class="tutor-approval-summary">
            <div class="tutor-approval-person">
              <div class="avatar-photo avatar-md" id="approvalAvatar">DJ</div>
              <div>
                <strong id="approvalStudent">Deniel Javier</strong>
                <span id="approvalTopic">Python Fundamentals</span>
              </div>
            </div>
            <div class="tutor-approval-divider"></div>
            <div class="tutor-approval-details">
              <span>Subject</span><strong id="approvalSubject">Programming</strong>
              <span>Session Type</span><strong>1-on-1 Session</strong>
              <span>Date</span><strong id="approvalDate">May 30, 2026</strong>
              <span>Time</span><strong id="approvalTime">10:00 AM - 11:00 AM</strong>
              <span>Meeting Type</span><strong>Online Session</strong>
            </div>
            <div class="tutor-approval-status">
              <span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                Request approved
              </span>
              <div><small>Student payment</small><strong>Confirmed</strong></div>
              <div><small>Session invite</small><strong>Sent</strong></div>
            </div>
          </div>

          <a href="my-sessions.html" class="btn btn-primary tutor-approval-primary">Go to My Sessions</a>
          <div class="tutor-approval-actions">
            <a href="messages.html" class="btn btn-outline">Message Student</a>
            <button type="button" class="btn btn-outline" onclick="SkillSwapRole.closeTutorApprovalModal()">Close</button>
          </div>
        </section>
      </div>
    `;
  }

  function setText(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  }

  async function updateTutorBookingStatus(button, status) {
    const card = button.closest('[data-student]');
    if (card?.dataset.bookingId) {
      await apiRequest(`/bookings/${card.dataset.bookingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    }
    return card;
  }

  async function showTutorApprovalModal(button) {
    const card = button.closest('[data-student]');
    try {
      await updateTutorBookingStatus(button, 'accepted');
    } catch (err) {
      window.SkillSwapApp?.notify?.(`Could not accept booking: ${err.message}`, 'error');
      return;
    }

    if (card) {
      const initials = card.dataset.student.split(' ').map(part => part[0]).join('');
      setText('approvalAvatar', initials);
      setText('approvalStudent', card.dataset.student);
      setText('approvalSubject', card.dataset.subject);
      setText('approvalTopic', card.dataset.topic);
      setText('approvalDate', card.dataset.date);
      setText('approvalTime', card.dataset.time);

      const status = card.querySelector('.request-status');
      if (status) status.textContent = 'Accepted';
      if (card.classList.contains('request-card')) {
        card.classList.add('accepted');
        button.textContent = 'Accepted';
        button.disabled = true;
      }
    }

    const modal = document.getElementById('tutorApprovalModal');
    if (modal) {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
    }
  }

  async function declineTutorBooking(button) {
    const card = button.closest('[data-student]');
    try {
      await updateTutorBookingStatus(button, 'rejected');
      const status = card?.querySelector('.request-status');
      if (status) status.textContent = 'Declined';
      button.textContent = 'Declined';
      button.disabled = true;
      card?.querySelectorAll('.request-actions button').forEach(action => {
        if (!/View Details/i.test(action.textContent)) action.disabled = true;
      });
      window.SkillSwapApp?.notify?.('Booking request declined.', 'success');
    } catch (err) {
      window.SkillSwapApp?.notify?.(`Could not decline booking: ${err.message}`, 'error');
    }
  }

  function showTutorRequestDetails(button) {
    const card = button.closest('.request-card');
    const content = document.querySelector('.dashboard-content');
    if (!card || !content) return;
    content.innerHTML = tutorRequestDetails(card.dataset);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showTutorRequestList() {
    const content = document.querySelector('.dashboard-content');
    if (!content) return;
    content.innerHTML = tutorRequests();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function closeTutorApprovalModal() {
    const modal = document.getElementById('tutorApprovalModal');
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  function tutorSessions() {
    return `
      <div class="tutor-page-heading"><h1>My Sessions</h1><p>Manage your upcoming classes and completed tutoring sessions.</p></div>
      <section class="tutor-panel tutor-main-panel">
        ${sessionRow('Deniel Javier', 'Introduction to Python', 'Programming', 'May 30, 2026', '10:00 AM - 11:00 AM')}
        ${sessionRow('Maekyla Roble', 'UI/UX Designing', 'Human Computer Interaction', 'June 2, 2026', '1:00 PM - 12:00PM')}
        ${sessionRow('Alex Patel', 'Introduction to Figma', 'UI/UX Designing', 'June 4, 2026', '3:30 PM - 4:30 PM')}
      </section>
    `;
  }

  function applyTutorPage() {
    const content = document.querySelector('.dashboard-content');
    const page = location.pathname.split('/').pop() || 'dashboard.html';
    if (!content && page !== 'messages.html') return;

    if (page === 'dashboard.html') {
      content.innerHTML = tutorDashboard();
      loadTutorDashboard();
    }
    if (page === 'notifications.html') content.innerHTML = tutorNotifications();
    if (page === 'find-tutor.html') {
      content.innerHTML = tutorRequests();
      loadTutorRequests();
    }
    if (page === 'my-sessions.html') content.innerHTML = tutorSessions();
    if (page === 'messages.html') {
      const main = document.querySelector('.dashboard-main');
      if (main) {
        const header = main.querySelector('.dashboard-header');
        main.innerHTML = '';
        if (header) main.appendChild(header);
        const wrap = document.createElement('div');
        wrap.className = 'dashboard-content';
        wrap.innerHTML = tutorMessages();
        main.appendChild(wrap);
        window.SkillSwapApp?.initMessages?.();
      }
    }
  }

  function initLoginRoleToggle() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    const roleWrap = document.getElementById('loginRoleToggle');
    if (roleWrap) {
      roleWrap.querySelectorAll('[data-login-role]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.loginRole === selectedLoginRole);
        btn.addEventListener('click', () => {
          selectedLoginRole = btn.dataset.loginRole;
          roleWrap.querySelectorAll('[data-login-role]').forEach(item => item.classList.remove('active'));
          btn.classList.add('active');
        });
      });
    }

    loginForm.addEventListener('submit', () => {
      setStoredRole(selectedLoginRole);
    });
  }

  function init() {
    initLoginRoleToggle();
    const role = storage.getItem(ROLE_KEY);
    if (role !== 'tutor' || !document.querySelector('.dashboard-layout')) return;
    document.body.classList.add('tutor-mode');
    applyTutorShell();
    applyTutorPage();
  }

  return { init, setStoredRole, showTutorApprovalModal, closeTutorApprovalModal, declineTutorBooking, showTutorRequestDetails, showTutorRequestList };
})();

window.SkillSwapRole = SkillSwapRole;
document.addEventListener('DOMContentLoaded', SkillSwapRole.init);
