(() => {
  const API_BASE = "https://skillswap-9vg6.onrender.com/api";
  const TOKEN_KEY = "skillswapToken";
  const USER_KEY = "skillswapUser";
  const ROLE_KEY = "skillswapRole";
  const LOCAL_BOOKINGS_KEY = "skillswapLocalBookings";
  const SELECTED_TUTOR_KEY = "skillswapSelectedTutor";
  const storage = window.sessionStorage;

  function getToken() {
    return storage.getItem(TOKEN_KEY);
  }

  function getUser() {
    try {
      return JSON.parse(storage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  }

  function notify(message, type = "info") {
    let container = document.getElementById("notifications-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "notifications-container";
      container.className = "notifications-container";
      document.body.appendChild(container);
    }

    const item = document.createElement("div");
    item.className = `notification-item ${type}`;
    item.textContent = message;
    container.appendChild(item);
    setTimeout(() => item.remove(), 3500);
  }

  async function request(path, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }
    return data;
  }

  function saveSession(data) {
    storage.setItem(TOKEN_KEY, data.token);
    storage.setItem(USER_KEY, JSON.stringify(data.user));
    storage.setItem(ROLE_KEY, data.user.role);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_KEY);
  }

  function logout() {
    [storage, localStorage].forEach((store) => {
      store.removeItem(TOKEN_KEY);
      store.removeItem(USER_KEY);
      store.removeItem(ROLE_KEY);
      store.removeItem(SELECTED_TUTOR_KEY);
      store.removeItem(LOCAL_BOOKINGS_KEY);
    });
    window.location.href = "login.html";
  }

  function initLogoutLinks() {
    document.querySelectorAll('a[href="login.html"]').forEach((link) => {
      if (!/log-?out/i.test(link.textContent)) return;
      link.addEventListener("click", (event) => {
        event.preventDefault();
        logout();
      });
    });
  }

  function clearLocalDemoData() {
    storage.removeItem(LOCAL_BOOKINGS_KEY);
    storage.removeItem(SELECTED_TUTOR_KEY);
    notify("Local demo bookings cleared.", "success");
    if (location.pathname.endsWith("my-sessions.html")) {
      location.reload();
    }
  }

  function displayNameFromUser(user) {
    if (!user?.username) return "SkillSwap User";
    const name = user.username.split("@")[0].replace(/[._-]+/g, " ");
    return name.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function initialsFromName(name) {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "SS";
  }

  function applyUserShell() {
    const user = getUser();
    if (!user) return;

    const name = displayNameFromUser(user);
    const initials = initialsFromName(name);
    const role = user.role === "tutor" ? "Tutor" : "Student";

    document.querySelectorAll(".dashboard-user").forEach((wrap) => {
      const avatar = wrap.querySelector(".avatar-placeholder, .avatar-photo");
      const userName = wrap.querySelector(".dashboard-user-name");
      const userRole = wrap.querySelector(".dashboard-user-role");
      if (avatar) avatar.textContent = initials;
      if (userName) userName.textContent = name;
      if (userRole) userRole.textContent = role;
    });

    document.querySelectorAll(".page-subtitle").forEach((node) => {
      node.textContent = node.textContent.replace("Deniel", name.split(" ")[0]);
    });
  }

  function saveLocalBooking(booking) {
    const bookings = JSON.parse(storage.getItem(LOCAL_BOOKINGS_KEY) || "[]");
    bookings.unshift(booking);
    storage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(bookings.slice(0, 10)));
  }

  function cleanText(text) {
    return String(text || "").replace(/\s+/g, " ").trim();
  }

  function readSelectedTutor() {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = {
      name: params.get("tutor"),
      initials: params.get("initials"),
      price: params.get("price"),
      specialty: params.get("specialty")
    };

    if (fromUrl.name) {
      storage.setItem(SELECTED_TUTOR_KEY, JSON.stringify(fromUrl));
      return fromUrl;
    }

    try {
      return JSON.parse(storage.getItem(SELECTED_TUTOR_KEY) || "null");
    } catch {
      return null;
    }
  }

  function initTutorBookingLinks() {
    document.querySelectorAll(".tutor-card").forEach((card) => {
      const link = card.querySelector('a[href="booking.html"]');
      if (!link) return;

      const name = cleanText(card.querySelector(".tutor-name")?.childNodes[0]?.textContent || card.querySelector(".tutor-name")?.textContent);
      const initials = cleanText(card.querySelector(".avatar-placeholder")?.textContent) || initialsFromName(name);
      const price = cleanText(card.querySelector(".tutor-price strong")?.textContent) || "₱350.00";
      const specialty = cleanText(card.querySelector(".badge")?.textContent) || "Tutor";
      const params = new URLSearchParams({ tutor: name, initials, price, specialty });

      link.href = `booking.html?${params.toString()}`;
      link.addEventListener("click", () => {
        storage.setItem(SELECTED_TUTOR_KEY, JSON.stringify({ name, initials, price, specialty }));
      });
    });
  }

  function setText(selector, text) {
    document.querySelectorAll(selector).forEach((node) => {
      node.textContent = text;
    });
  }

  function applyBookingTutor() {
    if (!document.getElementById("confirmedModal")) return;
    const tutor = readSelectedTutor();
    if (!tutor?.name) return;

    const priceNumber = Number(String(tutor.price || "350").replace(/[^\d.]/g, "")) || 350;
    const total = priceNumber + 10;
    const totalText = `₱${total.toFixed(2)}`;

    setText(".booking-summary-tutor div div", tutor.name);
    setText(".booking-summary-tutor .badge", tutor.specialty || "Tutor");
    document.querySelectorAll(".booking-summary-tutor .avatar-placeholder").forEach((node) => {
      node.textContent = tutor.initials || initialsFromName(tutor.name);
    });

    document.querySelectorAll(".dashboard-content > div[style*='border-radius:12px'] .avatar-placeholder, .booking-confirmed-card .avatar-placeholder").forEach((node) => {
      node.textContent = tutor.initials || initialsFromName(tutor.name);
    });

    document.querySelectorAll(".dashboard-content > div[style*='border-radius:12px'] span, .booking-confirmed-card div[style*='font-weight:600']").forEach((node) => {
      if (node.textContent.includes("Hyacinth Bautista")) node.textContent = tutor.name;
    });

    document.querySelectorAll(".booking-confirmed-card .badge").forEach((node) => {
      if (node.textContent.includes("Programming") || node.textContent.includes("HCI")) {
        node.textContent = tutor.specialty || "Tutor";
      }
    });

    document.querySelectorAll(".booking-price-row span:last-child").forEach((node, index) => {
      if (index === 0) node.textContent = `₱${priceNumber.toFixed(2)}`;
    });
    document.querySelectorAll(".booking-total-row span:last-child").forEach((node) => {
      node.textContent = totalText;
    });
    const confirmedAmount = document.getElementById("confirmedAmountPaid");
    if (confirmedAmount) confirmedAmount.textContent = totalText;
    const confirmedPaymentLine = document.getElementById("confirmedPaymentLine");
    if (confirmedPaymentLine) confirmedPaymentLine.textContent = `GCash · ${totalText}`;
    document.querySelectorAll(".booking-confirmed-card p").forEach((node) => {
      if (node.textContent.includes("GCash")) node.textContent = `GCash · ${totalText}`;
    });
  }

  function initLogin() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value;
      const role = sessionStorage.getItem(ROLE_KEY) || "student";

      try {
        const data = await request("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password, role })
        });
        saveSession(data);
        notify("Signed in successfully.", "success");
        window.location.href = "dashboard.html";
      } catch (err) {
        notify(err.message, "error");
      }
    }, true);
  }

  function initSignup() {
    const form = document.getElementById("signupForm");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      const password = document.getElementById("signupPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;
      if (password !== confirmPassword) {
        notify("Passwords do not match.", "error");
        return;
      }

      const email = document.getElementById("signupEmail").value.trim();
      const role = window.currentRole || storage.getItem(ROLE_KEY) || "student";

      try {
        const data = await request("/auth/register", {
          method: "POST",
          body: JSON.stringify({ email, password, role })
        });
        saveSession(data);
        notify("Account created.", "success");
        window.location.href = "dashboard.html";
      } catch (err) {
        notify(err.message, "error");
      }
    }, true);
  }

  function initBooking() {
    if (!document.getElementById("confirmedModal")) return;

    const originalConfirm = window.confirmBooking;
    window.confirmBooking = async () => {
      const details = document.getElementById("sessionDetails")?.value.trim() || "";
      const skill = details || "HCI tutoring session";
      const sessionType = document.getElementById("summaryType")?.textContent.trim() || "1-on-1 Session";
      const sessionDate = document.getElementById("summaryDate")?.textContent.trim() || "May 30, 2026";
      const sessionTime = document.getElementById("summaryTime")?.textContent.trim() || "4:00 PM";
      const paymentMethod = document.querySelector(".payment-method.selected")?.textContent.trim().replace(/\s+/g, " ") || "GCash";
      const tutor = readSelectedTutor() || {
        name: "Hyacinth Bautista",
        initials: "HB",
        price: "₱350.00",
        specialty: "HCI Tutor"
      };
      const amountPaid = (Number(String(tutor.price || "350").replace(/[^\d.]/g, "")) || 350) + 10;

      const bookingPayload = {
        skill,
        details,
        tutorName: tutor.name,
        sessionType,
        sessionDate,
        sessionTime,
        meetingType: "Online",
        paymentMethod,
        amountPaid
      };

      if (!getToken()) {
        notify("Demo booking confirmed. Sign in to save it to the database.", "info");
        saveLocalBooking({
          ...bookingPayload,
          id: `local-${Date.now()}`,
          status: "pending",
          tutorName: tutor.name,
          createdAt: new Date().toISOString()
        });
        originalConfirm?.();
        return;
      }

      try {
        const booking = await request("/bookings", {
          method: "POST",
          body: JSON.stringify(bookingPayload)
        });
        saveLocalBooking({
          ...bookingPayload,
          id: booking._id || booking.id || `local-${Date.now()}`,
          status: booking.status || "pending",
          tutorName: booking.tutorName || tutor.name,
          createdAt: booking.createdAt || new Date().toISOString()
        });
        notify("Booking saved and tutor notified.", "success");
      } catch (err) {
        notify(`Saved as demo only: ${err.message}`, "error");
        saveLocalBooking({
          ...bookingPayload,
          id: `local-${Date.now()}`,
          status: "pending",
          tutorName: tutor.name,
          createdAt: new Date().toISOString()
        });
      }

      originalConfirm?.();
    };
  }

  function sessionCard(booking) {
    const title = booking.skill || "HCI tutoring session";
    const tutor = booking.tutor?.username
      ? displayNameFromUser(booking.tutor)
      : booking.tutorName || "Hyacinth Bautista";
    const date = booking.sessionDate || "May 30, 2026";
    const time = booking.sessionTime || "4:00 PM";
    const status = booking.status || "pending";
    const statusLabel = status === "accepted" ? "Confirmed" : status === "rejected" ? "Rejected" : status.charAt(0).toUpperCase() + status.slice(1);
    const badgeClass = status === "accepted" || status === "confirmed" ? "badge-green" : status === "rejected" ? "badge-red" : "badge-yellow";
    const initials = initialsFromName(tutor);
    const amount = Number(booking.amountPaid || 360);

    return `
      <div class="session-card live-session-card"
        data-title="${escapeHtml(title)}"
        data-tutor="${escapeHtml(tutor)}"
        data-date="${escapeHtml(date)}"
        data-time="${escapeHtml(time)}"
        data-location="${escapeHtml(booking.meetingType || "Online")}"
        data-status="${escapeHtml(statusLabel)}"
        data-amount="PHP ${amount.toFixed(2)}"
        data-initials="${escapeHtml(initials)}"
        data-specialty="${escapeHtml(booking.tutorName || booking.skill || "Tutor")}">
        <div class="avatar-placeholder avatar-lg green" style="font-size:16px; flex-shrink:0;">${initials}</div>
        <div class="session-card-info">
          <div class="session-title">${title}</div>
          <div class="session-tutor">with ${tutor}</div>
          <div class="session-meta">
            <span class="session-meta-item">Date: ${date}</span>
            <span class="session-meta-item">Time: ${time}</span>
            <span class="session-meta-item">${booking.meetingType || "Online"}</span>
          </div>
        </div>
        <div class="session-card-actions">
          <span class="badge ${badgeClass}" style="font-size:0.75rem; padding:4px 10px;">${statusLabel}</span>
          <a href="messages.html" class="btn btn-outline btn-sm">Message</a>
          <button class="btn btn-primary btn-sm" onclick="SkillSwapApp.showSessionDetails(this)">View Details</button>
        </div>
      </div>
    `;
  }

  function showSessionDetails(button) {
    const card = button?.closest?.(".session-card");
    const modal = document.getElementById("detailsModal");
    if (!card || !modal) return;

    const values = {
      title: card.dataset.title || cleanText(card.querySelector(".session-title")?.textContent) || "Tutoring session",
      tutor: card.dataset.tutor || cleanText(card.querySelector(".session-tutor")?.textContent).replace(/^with\s+/i, "") || "Tutor",
      date: card.dataset.date || "May 31, 2026",
      time: card.dataset.time || "4:00 PM",
      location: card.dataset.location || "Online",
      status: card.dataset.status || cleanText(card.querySelector(".badge")?.textContent) || "Pending",
      amount: card.dataset.amount || "PHP 360.00",
      initials: card.dataset.initials || initialsFromName(card.dataset.tutor || "Tutor"),
      specialty: card.dataset.specialty || "Tutor"
    };

    const set = (id, value) => {
      const node = document.getElementById(id);
      if (node) node.textContent = value;
    };

    set("detailsSessionTitle", values.title);
    set("detailsTutorName", values.tutor);
    set("detailsTutorInitials", values.initials);
    set("detailsSpecialty", values.specialty);
    set("detailsStatus", values.status);
    set("detailsDate", values.date);
    set("detailsTime", values.time);
    set("detailsLocation", values.location);
    set("detailsAmount", values.amount);

    modal.style.display = "flex";
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatTime(value) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) return "Just now";
    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function notificationFromBooking(booking) {
    const id = booking._id || booking.id || `booking-${booking.createdAt || Date.now()}`;
    const tutor = booking.tutorName || booking.tutor?.username || "your tutor";
    return {
      id: `booking-${id}`,
      title: "Booking request sent",
      message: `Your session request with ${tutor} for ${booking.skill || "HCI tutoring session"} was sent.`,
      type: "booking",
      read: booking.status === "accepted" || booking.status === "confirmed",
      createdAt: booking.createdAt || new Date().toISOString(),
      action: "View Session",
      href: "my-sessions.html"
    };
  }

  function notificationCard(item) {
    const iconClass = item.type === "warning" ? "yellow" : item.type === "info" ? "blue" : "green";
    const isRead = item.read ? " opacity:0.7;" : "";
    const id = escapeHtml(item._id || item.id || `notification-${Date.now()}`);
    const title = escapeHtml(item.title || "Notification");
    const message = escapeHtml(item.message || "");
    const action = item.action || (/booking|session/i.test(`${item.title} ${item.message}`) ? "View Session" : "");
    const href = item.href || (/message/i.test(`${item.title} ${item.message}`) ? "messages.html" : "my-sessions.html");

    return `
      <div class="notification-card live-notification-card" id="${id}" data-type="${escapeHtml(item.type || "bookings")}" data-read="${item.read ? "true" : "false"}" style="${isRead}">
        <div class="notification-icon ${iconClass}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <div class="notification-body">
          <div class="notification-title">${title}</div>
          <div class="notification-text">${message}</div>
          <div class="notification-time">${formatTime(item.createdAt)}</div>
        </div>
        <div style="display:flex; flex-direction:column; gap:0.5rem; align-items:flex-end; flex-shrink:0;">
          ${action ? `<button class="notification-action-btn" onclick="window.location.href='${href}'">${escapeHtml(action)}</button>` : ""}
          <button onclick="dismissNotif('${id}')" style="background:none; border:none; cursor:pointer; color:var(--color-text-light); font-size:0.75rem;">Dismiss</button>
        </div>
      </div>
    `;
  }

  function updateNotificationCounts(counts) {
    const activeBadge = document.querySelector(".sidebar-nav-item.active span");
    if (activeBadge) activeBadge.textContent = String(counts.unread || 0);

    const todayLabel = document.querySelector(".notifications-layout > div:first-child > div:first-child span");
    if (todayLabel) todayLabel.textContent = `${counts.unread || 0} new`;

    document.querySelectorAll(".notification-filters .filter-btn").forEach((button) => {
      const label = cleanText(button.querySelector(".filter-btn-left")?.textContent || "").toLowerCase();
      const count = button.querySelector(".filter-count");
      if (!count) return;
      if (label.includes("all")) count.textContent = String(counts.total);
      if (label.includes("unread")) count.textContent = String(counts.unread);
      if (label.includes("booking")) count.textContent = String(counts.bookings);
      if (label.includes("message")) count.textContent = String(counts.messages);
      if (label.includes("review")) count.textContent = String(counts.reviews);
      if (label.includes("payment")) count.textContent = String(counts.payments);
      if (label.includes("system")) count.textContent = String(counts.system);
    });
  }

  async function initLiveSessions() {
    const container = document.getElementById("tab-upcoming");
    if (!container || storage.getItem(ROLE_KEY) === "tutor") return;

    const localBookings = JSON.parse(storage.getItem(LOCAL_BOOKINGS_KEY) || "[]");
    let apiBookings = [];
    if (getToken()) {
      try {
        apiBookings = await request("/bookings");
      } catch (err) {
        notify(`Could not load saved bookings: ${err.message}`, "error");
      }
    }

    const all = [...apiBookings, ...localBookings]
      .filter((booking, index, list) => {
        const id = booking._id || booking.id;
        return id && list.findIndex((item) => (item._id || item.id) === id) === index;
      })
      .slice(0, 5);

    if (!all.length) return;

    container.querySelectorAll(".live-session-card").forEach((node) => node.remove());
    container.insertAdjacentHTML("afterbegin", all.map(sessionCard).join(""));
  }

  function dashboardSessionCard(booking) {
    const title = booking.skill || "Tutoring session";
    const tutor = booking.tutorName || booking.tutor?.username || "Tutor";
    const date = booking.sessionDate || "May 31, 2026";
    const time = booking.sessionTime || "4:00 PM";
    const status = booking.status === "accepted" ? "Confirmed" : booking.status === "rejected" ? "Rejected" : "Pending";
    const badgeClass = booking.status === "accepted" ? "badge-green" : booking.status === "rejected" ? "badge-red" : "badge-yellow";
    return `
      <div class="session-card live-dashboard-session">
        <div class="avatar-placeholder avatar-lg green" style="font-size:16px; flex-shrink:0;">${initialsFromName(tutor)}</div>
        <div class="session-card-info">
          <div class="session-title">${escapeHtml(title)}</div>
          <div class="session-tutor">with ${escapeHtml(tutor)}</div>
          <div class="session-meta">
            <span class="session-meta-item">${escapeHtml(date)}</span>
            <span class="session-meta-item">${escapeHtml(time)}</span>
            <span class="badge ${badgeClass}">${status}</span>
          </div>
        </div>
        <div class="session-card-actions">
          <a href="my-sessions.html" class="btn btn-primary btn-sm">View Details</a>
        </div>
      </div>
    `;
  }

  function dashboardNotificationItem(item) {
    return `
      <div class="live-dashboard-notification" style="display:flex; gap:0.75rem; align-items:flex-start;">
        <div class="notification-icon green" style="width:32px; height:32px; flex-shrink:0;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <div>
          <p style="font-size:0.75rem; font-weight:600; color:var(--color-text); margin-bottom:2px;">${escapeHtml(item.title || "Notification")}</p>
          <p style="font-size:0.75rem; color:var(--color-text-muted);">${escapeHtml(item.message || "")}</p>
          <p style="font-size:0.7rem; color:var(--color-text-light); margin-top:2px;">${formatTime(item.createdAt)}</p>
        </div>
      </div>
    `;
  }

  async function initStudentDashboard() {
    if (!location.pathname.endsWith("dashboard.html") || storage.getItem(ROLE_KEY) === "tutor") return;
    const stats = document.querySelectorAll(".stat-value");
    const upcomingHeading = Array.from(document.querySelectorAll("h3")).find((node) => cleanText(node.textContent) === "Upcoming Sessions");
    const notificationsHeading = Array.from(document.querySelectorAll("h3")).find((node) => cleanText(node.textContent) === "Notifications");

    let bookings = [];
    let notifications = [];
    try {
      bookings = getToken() ? await request("/bookings") : [];
      notifications = getToken() ? await request("/notifications") : [];
    } catch (err) {
      notify(`Could not load dashboard data: ${err.message}`, "error");
    }

    if (stats[0]) stats[0].textContent = String(bookings.length || 0);
    if (stats[1]) {
      const tutorNames = new Set(bookings.map((booking) => booking.tutorName || booking.tutor?.username).filter(Boolean));
      stats[1].textContent = String(tutorNames.size || 0);
    }
    if (stats[2]) stats[2].textContent = `${Math.max(bookings.length, 1)}h`;
    if (stats[3]) stats[3].textContent = bookings.some((booking) => booking.status === "accepted") ? "5.0" : "4.8";

    const upcomingWrap = upcomingHeading?.parentElement?.parentElement;
    if (upcomingWrap) {
      upcomingWrap.querySelectorAll(".session-card").forEach((node) => node.remove());
      upcomingWrap.insertAdjacentHTML("beforeend", bookings.length
        ? bookings.slice(0, 3).map(dashboardSessionCard).join("")
        : '<div class="session-card live-dashboard-session"><div class="session-card-info"><div class="session-title">No bookings yet</div><div class="session-tutor">Find a tutor and book your first session.</div></div><div class="session-card-actions"><a href="find-tutor.html" class="btn btn-primary btn-sm">Find Tutors</a></div></div>');
    }

    const notificationWrap = notificationsHeading?.parentElement?.nextElementSibling;
    if (notificationWrap) {
      notificationWrap.querySelectorAll(":scope > div").forEach((node) => node.remove());
      notificationWrap.insertAdjacentHTML("beforeend", notifications.length
        ? notifications.slice(0, 3).map(dashboardNotificationItem).join("")
        : '<p style="font-size:0.75rem; color:var(--color-text-muted);">No notifications yet.</p>');
    }
  }

  async function initNotifications() {
    const list = document.querySelector(".notification-list, .notifications-layout > div:first-child");
    if (!list) return;

    const role = storage.getItem(ROLE_KEY) || "student";
    const localBookings = JSON.parse(storage.getItem(LOCAL_BOOKINGS_KEY) || "[]");
    const bookingNotifications = localBookings.map(notificationFromBooking);
    let notifications = [];
    try {
      notifications = getToken() ? await request("/notifications") : [];
    } catch (err) {
      notify(`Could not load live notifications: ${err.message}`, "error");
    }

    const combined = [...bookingNotifications, ...notifications]
      .filter((item) => {
        if (role !== "student") return true;
        const text = `${item.title || ""} ${item.message || ""}`;
        return !/new booking request/i.test(text) && !/^Student\s+\S+\s+requested/i.test(item.message || "");
      })
      .filter((item, index, items) => {
        const key = `${item.title || ""}-${item.message || ""}`;
        return items.findIndex((other) => `${other.title || ""}-${other.message || ""}` === key) === index;
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 8);

    list.querySelectorAll(".notification-card, .live-notification-empty").forEach((node) => node.remove());

    const earlierHeading = Array.from(list.querySelectorAll("h3"))
      .find((node) => cleanText(node.textContent).toLowerCase() === "earlier");
    if (earlierHeading?.parentElement) earlierHeading.parentElement.remove();

    if (!combined.length) {
      list.insertAdjacentHTML("beforeend", `
        <div class="notification-card live-notification-empty" style="align-items:center;">
          <div class="notification-icon blue"></div>
          <div class="notification-body">
            <div class="notification-title">No notifications yet</div>
            <div class="notification-text">Book a session and your booking updates will appear here.</div>
          </div>
        </div>
      `);
      updateNotificationCounts({ total: 0, unread: 0, bookings: 0, messages: 0, reviews: 0, payments: 0, system: 0 });
      return;
    }

    list.insertAdjacentHTML("beforeend", combined.map(notificationCard).join(""));
    updateNotificationCounts({
      total: combined.length,
      unread: combined.filter((item) => !item.read).length,
      bookings: combined.filter((item) => /booking|session/i.test(`${item.title} ${item.message}`)).length,
      messages: combined.filter((item) => /message/i.test(`${item.title} ${item.message}`)).length,
      reviews: combined.filter((item) => /review/i.test(`${item.title} ${item.message}`)).length,
      payments: combined.filter((item) => /payment|paid/i.test(`${item.title} ${item.message}`)).length,
      system: combined.filter((item) => /system|platform|update/i.test(`${item.title} ${item.message}`)).length
    });
  }

  function initSocket() {
    const user = getUser();
    if (!user || typeof io === "undefined") return;

    const socket = io();
    socket.emit("join", user.id);
    socket.on("new_notification", (data) => {
      notify(data.message || data.title || "New notification", "success");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyUserShell();
    initLogoutLinks();
    initTutorBookingLinks();
    applyBookingTutor();
    initLogin();
    initSignup();
    initBooking();
    initNotifications();
    initLiveSessions();
    initStudentDashboard();
    initSocket();
  });

  window.SkillSwapApp = {
    clearLocalDemoData,
    getToken,
    getUser,
    logout,
    notify,
    request,
    showSessionDetails
  };

  window.openDetails = () => {
    const first = document.querySelector("#tab-upcoming .session-card .btn-primary");
    if (first) showSessionDetails(first);
  };
})();
