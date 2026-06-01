(() => {
  const REMOTE_API_BASE = "https://skillswap-9vg6.onrender.com/api";
  const API_BASE = location.protocol.startsWith("http") ? `${location.origin}/api` : REMOTE_API_BASE;
  const SOCKET_BASE = location.protocol.startsWith("http") ? location.origin : "https://skillswap-9vg6.onrender.com";
  const TOKEN_KEY = "skillswapToken";
  const USER_KEY = "skillswapUser";
  const ROLE_KEY = "skillswapRole";
  const LOCAL_BOOKINGS_KEY = "skillswapLocalBookings";
  const SELECTED_TUTOR_KEY = "skillswapSelectedTutor";
  const storage = window.sessionStorage;
  let activeSocket = null;
  let messageRuntime = 0;

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

  function moneyFromText(value, fallback = 0) {
    const matches = String(value || "").match(/\d+(?:\.\d+)?/g);
    return Number(matches?.[matches.length - 1] || fallback) || fallback;
  }

  function priceText(amount) {
    return `PHP ${Number(amount || 0).toFixed(2)}`;
  }

  function getTutorData(card) {
    const name = cleanText(card.querySelector(".tutor-name")?.childNodes[0]?.textContent || card.querySelector(".tutor-name")?.textContent);
    const price = moneyFromText(card.querySelector(".tutor-price strong")?.textContent, 350);
    const ratingText = cleanText(card.querySelector(".tutor-rating")?.textContent);
    const rating = Number((ratingText.match(/\d+(\.\d+)?/) || ["0"])[0]);
    const sessions = Number((ratingText.match(/(\d+)\s+sessions/i) || ["", "0"])[1]);
    const badges = Array.from(card.querySelectorAll(".badge")).map((badge) => cleanText(badge.textContent));
    return {
      name,
      initials: cleanText(card.querySelector(".avatar-placeholder")?.textContent) || initialsFromName(name),
      price,
      rating,
      sessions,
      badges,
      bio: cleanText(card.querySelector(".tutor-bio")?.textContent),
      specialty: badges[0] || "Tutor"
    };
  }

  function activeTopicTerms() {
    const checked = Array.from(document.querySelectorAll(".filters-panel input[type='checkbox']:checked"));
    if (checked.some((item) => item.id === "allTopics")) return [];
    return checked.map((item) => cleanText(document.querySelector(`label[for="${item.id}"]`)?.textContent).toLowerCase());
  }

  function initFindTutors() {
    const list = document.querySelector(".tutors-list");
    if (!list) return;

    const searchInput = document.getElementById("searchInput");
    const resultLabel = document.getElementById("tutorResultsCount");
    const sortSelect = Array.from(document.querySelectorAll("select")).find((select) =>
      Array.from(select.options).some((option) => /best match|highest rated/i.test(option.textContent))
    );
    const priceRange = document.querySelector(".filters-panel input[type='range']");
    const allTopics = document.getElementById("allTopics");
    const defaultListHTML = list.innerHTML;
    let searchMode = false;

    function currentCards() {
      return Array.from(list.querySelectorAll(".tutor-card"));
    }

    function colorFromName(name) {
      const colors = ["green", "blue", "orange", "purple", "red", "teal"];
      const value = String(name || "").split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
      return colors[value % colors.length];
    }

    function wireDefaultCard(card) {
      const data = getTutorData(card);
      card.dataset.name = data.name.toLowerCase();
      card.dataset.price = String(data.price);
      card.dataset.rating = String(data.rating);
      card.dataset.sessions = String(data.sessions);
      card.dataset.topics = data.badges.join(" ").toLowerCase();
      card.dataset.search = `${data.name} ${data.bio} ${data.badges.join(" ")}`.toLowerCase();
      card.querySelectorAll(".btn-outline").forEach((button) => {
        if (!/view profile/i.test(button.textContent)) return;
        button.addEventListener("click", () => showTutorProfile(card));
      });
    }

    function wireDefaultCards() {
      currentCards().forEach((card) => wireDefaultCard(card));
    }

    function restoreDefaultCards() {
      searchMode = false;
      list.innerHTML = defaultListHTML;
      wireDefaultCards();
      applyTutorFilters();
    }

    function renderSearchCard(account) {
      const name = displayNameFromUser({ username: account.username }) || account.username;
      const initials = initialsFromName(name);
      const color = colorFromName(name);
      const specialty = account.role === "tutor" ? "Tutor account" : "Account";
      const bookHref = `booking.html?tutor=${encodeURIComponent(name)}&initials=${encodeURIComponent(initials)}&price=${encodeURIComponent("PHP 350.00")}&specialty=${encodeURIComponent("Live Tutor")}`;
      const messageHref = `messages.html`;

      return `
        <div class="tutor-card live-account-card" data-account-id="${escapeHtml(account.id || account.username)}" data-account-username="${escapeHtml(account.username || "")}" data-account-name="${escapeHtml(name)}" data-account-role="${escapeHtml(account.role || "student")}" style="align-items:stretch;">
          <div class="tutor-card-avatar">
            <div class="avatar-placeholder avatar-xl ${color}" style="font-size:20px;">${escapeHtml(initials)}</div>
            <span class="tutor-online-dot"></span>
          </div>
          <div class="tutor-card-body">
            <div class="tutor-card-header">
              <div>
                <div class="tutor-name">${escapeHtml(name)} <span class="tutor-verified"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg></span></div>
                <div style="font-size:0.75rem; color:var(--color-primary); font-weight:500; margin-top:2px;">${escapeHtml(account.username)} · ${escapeHtml(account.role || "student")} account</div>
              </div>
              <div class="tutor-price"><strong>${escapeHtml(account.role === "tutor" ? "Tutor" : "Account")}</strong></div>
            </div>
            <p class="tutor-bio">Live account returned from the server search.</p>
            <div class="tutor-meta">
              <span class="badge badge-purple">${escapeHtml(account.role || "student")}</span>
              <span class="badge badge-green">Live result</span>
            </div>
            <div class="tutor-card-actions">
              ${account.role === "tutor"
                ? `<a href="${bookHref}" class="btn btn-primary btn-sm">Book Session</a>`
                : `<a href="${messageHref}" class="btn btn-primary btn-sm">Open Chat</a>`}
              <button class="btn btn-outline btn-sm" type="button">Copy Username</button>
            </div>
          </div>
        </div>
      `;
    }

    function wireSearchCardActions() {
      currentCards().forEach((card) => {
        const copyButton = Array.from(card.querySelectorAll(".btn-outline")).find((button) => /copy username/i.test(button.textContent));
        if (copyButton) {
          copyButton.addEventListener("click", async () => {
            const value = card.dataset.accountUsername || card.dataset.accountId || card.dataset.accountName || "";
            try {
              await navigator.clipboard.writeText(value);
              notify("Account copied to clipboard.", "success");
            } catch {
              notify("Could not copy account details.", "error");
            }
          });
        }
      });
    }

    function selectedRating() {
      if (document.getElementById("r45plus")?.checked) return 4.5;
      if (document.getElementById("r4plus")?.checked) return 4;
      return 0;
    }

    function applyTutorFilters() {
      if (searchMode) return;
      const cards = currentCards();
      const terms = (searchInput?.value || "").toLowerCase().trim().split(/\s+/).filter(Boolean);
      const topics = activeTopicTerms();
      const maxPrice = Number(priceRange?.value || 1000);
      const minRating = selectedRating();
      let visible = 0;

      cards.forEach((card) => {
        const data = card.dataset;
        const matchesSearch = !terms.length || terms.every((term) => data.search.includes(term));
        const matchesTopic = !topics.length || topics.some((topic) => data.topics.includes(topic.replace(/\s+fundamentals$/, "")) || data.search.includes(topic));
        const matchesPrice = Number(data.price) <= maxPrice;
        const matchesRating = Number(data.rating) >= minRating;
        const shouldShow = matchesSearch && matchesTopic && matchesPrice && matchesRating;
        card.style.display = shouldShow ? "flex" : "none";
        if (shouldShow) visible += 1;
      });

      const visibleCards = cards.filter((card) => card.style.display !== "none");
      const sortValue = sortSelect?.value || "Best Match";
      visibleCards.sort((a, b) => {
        if (/highest rated/i.test(sortValue)) return Number(b.dataset.rating) - Number(a.dataset.rating);
        if (/lowest price/i.test(sortValue)) return Number(a.dataset.price) - Number(b.dataset.price);
        if (/most sessions/i.test(sortValue)) return Number(b.dataset.sessions) - Number(a.dataset.sessions);
        return Number(b.dataset.rating) - Number(a.dataset.rating) || Number(b.dataset.sessions) - Number(a.dataset.sessions);
      }).forEach((card) => list.appendChild(card));

      if (resultLabel) {
        resultLabel.innerHTML = `<strong style="color:var(--color-text);">${visible} tutor${visible === 1 ? "" : "s"}</strong> found`;
      }
    }

    async function searchTutors() {
      const query = cleanText(searchInput?.value || "");
      if (!query) {
        restoreDefaultCards();
        return;
      }

      try {
        const accounts = await request(`/auth/search?role=tutor&query=${encodeURIComponent(query)}&limit=12`);
        searchMode = true;
        list.innerHTML = accounts.length
          ? accounts.map(renderSearchCard).join("")
          : `
            <div class="tutor-card" style="align-items:center; justify-content:center; min-height:140px;">
              <div class="tutor-card-body">
                <div class="tutor-name">No tutor accounts found</div>
                <p class="tutor-bio">Try a different name or email.</p>
                <div class="tutor-card-actions">
                  <button class="btn btn-outline btn-sm" type="button" id="restoreTutorResults">Back to tutors</button>
                </div>
              </div>
            </div>
          `;
        if (resultLabel) {
          resultLabel.innerHTML = `<strong style="color:var(--color-text);">${accounts.length} tutor account${accounts.length === 1 ? "" : "s"}</strong> found`;
        }
        wireSearchCardActions();
        document.getElementById("restoreTutorResults")?.addEventListener("click", restoreDefaultCards);
      } catch (err) {
        notify(`Could not search accounts: ${err.message}`, "error");
      }
    }

    window.searchTutors = searchTutors;

    searchInput?.addEventListener("input", () => {
      if (searchMode && !cleanText(searchInput.value)) {
        restoreDefaultCards();
        return;
      }
      applyTutorFilters();
    });
    searchInput?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        searchTutors();
      }
    });
    sortSelect?.addEventListener("change", applyTutorFilters);
    priceRange?.addEventListener("input", applyTutorFilters);
    document.querySelectorAll(".filters-panel input").forEach((input) => {
      input.addEventListener("change", () => {
        if (searchMode) return;
        if (input.type === "checkbox" && input.id !== "allTopics" && input.checked) allTopics.checked = false;
        if (input.id === "allTopics" && input.checked) {
          document.querySelectorAll(".filters-panel input[type='checkbox']:not(#allTopics)").forEach((box) => { box.checked = false; });
        }
        applyTutorFilters();
      });
    });

    document.querySelector(".filters-clear")?.addEventListener("click", () => {
      if (searchMode) {
        restoreDefaultCards();
        return;
      }
      if (searchInput) searchInput.value = "";
      if (allTopics) allTopics.checked = true;
      document.querySelectorAll(".filters-panel input[type='checkbox']:not(#allTopics)").forEach((box) => { box.checked = false; });
      document.getElementById("anytime")?.click();
      document.getElementById("any-rating")?.click();
      if (priceRange) priceRange.value = priceRange.max || "1000";
      applyTutorFilters();
    });

    wireDefaultCards();
    applyTutorFilters();
  }

  function showTutorProfile(card) {
    if (!card) return;
    const tutor = getTutorData(card);
    let modal = document.getElementById("tutorProfileModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "tutorProfileModal";
      modal.className = "booking-confirmed-overlay";
      modal.style.display = "none";
      document.body.appendChild(modal);
    }
    modal.innerHTML = `
      <div class="booking-confirmed-card" style="text-align:left; max-width:520px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1.25rem;">
          <h2 style="font-size:1.25rem; font-weight:700;">Tutor Profile</h2>
          <button class="icon-btn" type="button" onclick="document.getElementById('tutorProfileModal').style.display='none'">x</button>
        </div>
        <div style="display:flex; gap:1rem; align-items:center; padding-bottom:1rem; border-bottom:1px solid var(--color-border);">
          <div class="avatar-placeholder avatar-xl green">${escapeHtml(tutor.initials)}</div>
          <div>
            <h3 style="font-size:1rem; font-weight:700; color:var(--color-text);">${escapeHtml(tutor.name)}</h3>
            <p style="font-size:0.8rem; color:var(--color-primary);">${escapeHtml(tutor.specialty)} - ${tutor.rating.toFixed(1)} rating - ${tutor.sessions} sessions</p>
          </div>
        </div>
        <p style="margin:1rem 0; color:var(--color-text-muted); line-height:1.6;">${escapeHtml(tutor.bio)}</p>
        <div style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:1rem;">
          ${tutor.badges.map((badge) => `<span class="badge badge-purple">${escapeHtml(badge)}</span>`).join("")}
        </div>
        <div class="booking-total-row" style="margin-bottom:1rem;"><span>Session fee</span><span>${priceText(tutor.price)}</span></div>
        <a class="btn btn-primary" style="width:100%;" href="booking.html?tutor=${encodeURIComponent(tutor.name)}&initials=${encodeURIComponent(tutor.initials)}&price=${encodeURIComponent(priceText(tutor.price))}&specialty=${encodeURIComponent(tutor.specialty)}">Book Session</a>
      </div>
    `;
    modal.style.display = "flex";
  }

  function initBookingInteractions() {
    if (!document.getElementById("confirmedModal")) return;

    function selectedBasePrice() {
      const card = document.querySelector(".session-type-card.selected");
      const amount = moneyFromText(card?.querySelector("p")?.textContent, moneyFromText(document.querySelector(".booking-price-row span:last-child")?.textContent, 350));
      return amount || 350;
    }

    function syncBookingPrice() {
      const fee = selectedBasePrice();
      const total = fee + 10;
      document.querySelectorAll(".booking-price-row span:last-child").forEach((node, index) => {
        if (index === 0) node.textContent = priceText(fee);
      });
      document.querySelectorAll(".booking-total-row span:last-child").forEach((node) => {
        node.textContent = priceText(total);
      });
      const amount = document.getElementById("confirmedAmountPaid");
      if (amount) amount.textContent = priceText(total);
      const paymentLine = document.getElementById("confirmedPaymentLine");
      if (paymentLine) paymentLine.textContent = `${cleanText(document.querySelector(".payment-method.selected")?.textContent) || "GCash"} - ${priceText(total)}`;
    }

    const originalSelectType = window.selectType;
    window.selectType = (card) => {
      originalSelectType?.(card);
      syncBookingPrice();
    };
    const originalSelectPayment = window.selectPayment;
    window.selectPayment = (button) => {
      originalSelectPayment?.(button);
      syncBookingPrice();
    };
    syncBookingPrice();
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

  function getNotificationCards() {
    return Array.from(document.querySelectorAll(".notification-card, .live-notification-card"));
  }

  function inferNotificationType(card) {
    const existing = card.dataset.type;
    if (existing) return existing;
    const text = cleanText(card.textContent).toLowerCase();
    if (/booking|session|request/.test(text)) return "bookings";
    if (/message|reply/.test(text)) return "messages";
    if (/review|rating/.test(text)) return "reviews";
    if (/payment|paid|gcash|card|bank/.test(text)) return "payments";
    return "system";
  }

  function refreshVisibleNotificationCounts() {
    const cards = getNotificationCards();
    const visible = cards.filter((card) => card.style.display !== "none");
    updateNotificationCounts({
      total: cards.length,
      unread: cards.filter((card) => card.dataset.read !== "true" && Number(card.style.opacity || "1") > 0.65).length,
      bookings: cards.filter((card) => inferNotificationType(card) === "bookings").length,
      messages: cards.filter((card) => inferNotificationType(card) === "messages").length,
      reviews: cards.filter((card) => inferNotificationType(card) === "reviews").length,
      payments: cards.filter((card) => inferNotificationType(card) === "payments").length,
      system: cards.filter((card) => inferNotificationType(card) === "system").length
    });
    const todayLabel = document.querySelector(".notifications-layout > div:first-child > div:first-child span");
    if (todayLabel) todayLabel.textContent = `${visible.length} shown`;
  }

  function initNotificationControls() {
    if (!document.querySelector(".notifications-layout")) return;

    window.dismissNotif = (id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.transition = "all 0.3s ease";
      el.style.opacity = "0";
      el.style.transform = "translateX(20px)";
      setTimeout(() => {
        el.remove();
        refreshVisibleNotificationCounts();
      }, 300);
    };

    window.markAllRead = () => {
      getNotificationCards().forEach((card) => {
        card.dataset.read = "true";
        card.style.opacity = "0.6";
      });
      refreshVisibleNotificationCounts();
      notify("All notifications marked as read.", "success");
    };

    window.filterNotifs = (button, type) => {
      document.querySelectorAll(".notification-filters .filter-btn").forEach((item) => item.classList.remove("active"));
      button?.classList.add("active");
      getNotificationCards().forEach((card) => {
        const cardType = inferNotificationType(card);
        const unread = card.dataset.read !== "true" && Number(card.style.opacity || "1") > 0.65;
        const show = type === "all" || (type === "unread" ? unread : cardType === type);
        card.style.display = show ? "flex" : "none";
      });
      refreshVisibleNotificationCounts();
    };

    getNotificationCards().forEach((card) => {
      card.dataset.type = inferNotificationType(card);
      if (!card.dataset.read) card.dataset.read = Number(card.style.opacity || "1") < 0.7 ? "true" : "false";
    });
    refreshVisibleNotificationCounts();
  }

  const CHAT_CONTACTS = {
    "hyacinth bautista": { id: "demo-tutor-hyacinth", initials: "HB", color: "green" },
    "justine dian": { id: "demo-tutor-justine", initials: "JD", color: "blue" },
    "gino cometa": { id: "demo-tutor-cometa-gino", initials: "GC", color: "orange" },
    "cometa gino": { id: "demo-tutor-cometa-gino", initials: "GC", color: "orange" },
    "maekyla roble": { id: "demo-user-maekyla-roble", initials: "MR", color: "purple" },
    "deniel javier": { id: "demo-user-deniel-javier", initials: "DJ", color: "green" }
  };

  function getChatUser() {
    const user = getUser();
    if (user) {
      const name = displayNameFromUser(user);
      return {
        id: String(user.id || user._id || user.username),
        name,
        initials: initialsFromName(name)
      };
    }

    let guestId = storage.getItem("skillswapGuestChatId");
    if (!guestId) {
      guestId = `guest-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      storage.setItem("skillswapGuestChatId", guestId);
    }
    return { id: guestId, name: "Guest Student", initials: "GS" };
  }

  function contactFromName(name, initials = "", color = "green") {
    const key = cleanText(name).toLowerCase();
    const known = CHAT_CONTACTS[key] || {};
    return {
      id: known.id || `contact-${key.replace(/[^a-z0-9]+/g, "-") || "user"}`,
      name: cleanText(name) || "SkillSwap User",
      initials: known.initials || cleanText(initials) || initialsFromName(name),
      color: known.color || color || "green"
    };
  }

  function conversationIdFor(contactId) {
    const user = getChatUser();
    return [user.id, contactId].sort().join("__");
  }

  function getSocket() {
    if (activeSocket || typeof io === "undefined") return activeSocket;
    activeSocket = io(SOCKET_BASE, { transports: ["websocket", "polling"] });
    activeSocket.emit("join", getChatUser().id);
    activeSocket.on("new_notification", (data) => {
      notify(data.message || data.title || "New notification", "success");
    });
    return activeSocket;
  }

  function chatTime(value) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) return "Just now";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function initMessages() {
    if (!document.getElementById("chatMessages")) return;
    const runtimeId = ++messageRuntime;
    const conversations = {};
    const contacts = {};
    let activeConversationId = "";
    let typingTimer = null;
    const socket = getSocket();
    const currentUser = getChatUser();

    function messageHtml(message, contact) {
      const isMine = String(message.senderId) === currentUser.id;
      const initials = isMine ? currentUser.initials : (message.senderInitials || contact?.initials || initialsFromName(message.senderName || ""));
      const bubbleClass = isMine ? "sent" : "received";
      const color = isMine ? "#3b82f6" : "#22c55e";
      return `
        <div class="chat-message ${bubbleClass}" data-message-id="${escapeHtml(message.id || "")}">
          <div class="avatar-placeholder" style="width:28px; height:28px; background:${color}; font-size:11px; flex-shrink:0;">${escapeHtml(initials)}</div>
          <div><div class="chat-bubble">${escapeHtml(message.text)}</div><div class="chat-time">${escapeHtml(chatTime(message.createdAt))}</div></div>
        </div>
      `;
    }

    function updateConversationPreview(conversationId, text, timeValue, incrementUnread = false) {
      const item = document.querySelector(`.message-list-item[data-conversation-id="${CSS.escape(conversationId)}"]`);
      const preview = item?.querySelector(".message-list-preview");
      const timeNode = item?.querySelector(".message-list-time");
      if (preview) preview.textContent = text;
      if (timeNode) timeNode.textContent = chatTime(timeValue);
      if (item && incrementUnread && conversationId !== activeConversationId && !item.querySelector(".chat-unread-count")) {
        item.querySelector(":scope > div:last-child")?.insertAdjacentHTML("beforeend", '<span class="chat-unread-count" style="background:#22c55e; color:#fff; font-size:10px; font-weight:700; padding:1px 6px; border-radius:999px;">1</span>');
      }
    }

    function ensureConversationItem(contact, conversationId) {
      contacts[conversationId] = contact;
      let item = document.querySelector(`.message-list-item[data-conversation-id="${CSS.escape(conversationId)}"]`);
      if (item) return item;

      const list = document.getElementById("messagesList");
      if (!list) return null;
      list.insertAdjacentHTML("afterbegin", `
        <div class="message-list-item" data-conversation-id="${escapeHtml(conversationId)}" data-contact-id="${escapeHtml(contact.id)}" data-contact-initials="${escapeHtml(contact.initials)}" data-contact-color="${escapeHtml(contact.color)}">
          <div style="position:relative; flex-shrink:0;">
            <div class="avatar-placeholder avatar-md ${escapeHtml(contact.color)}" style="font-size:13px;">${escapeHtml(contact.initials)}</div>
            <span style="position:absolute; bottom:0; right:0; width:10px; height:10px; background:#22c55e; border-radius:50%; border:2px solid #fff;"></span>
          </div>
          <div class="message-list-item-info">
            <div class="message-list-name">${escapeHtml(contact.name)}</div>
            <div class="message-list-preview">New conversation</div>
          </div>
          <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px;">
            <span class="message-list-time">Just now</span>
          </div>
        </div>
      `);
      item = list.querySelector(`.message-list-item[data-conversation-id="${CSS.escape(conversationId)}"]`);
      item?.addEventListener("click", () => openConversation(contact, conversationId));
      return item;
    }

    function renderConversation(conversationId) {
      const messages = document.getElementById("chatMessages");
      const contact = contacts[conversationId];
      if (!messages) return;
      const items = conversations[conversationId] || [];
      messages.innerHTML = items.length
        ? items.map((message) => messageHtml(message, contact)).join("")
        : `
          <div class="chat-message received">
            <div class="avatar-placeholder" style="width:28px; height:28px; background:#22c55e; font-size:11px; flex-shrink:0;">${escapeHtml(contact?.initials || "SS")}</div>
            <div><div class="chat-bubble">Hi, send a message to start the conversation.</div><div class="chat-time">Just now</div></div>
          </div>
        `;
      messages.scrollTop = messages.scrollHeight;
    }

    function openConversation(contact, conversationId) {
      activeConversationId = conversationId;
      contacts[conversationId] = contact;
      document.querySelectorAll(".message-list-item").forEach((item) => {
        item.classList.toggle("active", item.dataset.conversationId === conversationId);
      });
      document.querySelector(`.message-list-item[data-conversation-id="${CSS.escape(conversationId)}"] .chat-unread-count`)?.remove();

      const chatName = document.getElementById("chatName");
      const avatar = document.getElementById("chatAvatar");
      if (chatName) chatName.textContent = contact.name;
      if (avatar) {
        avatar.textContent = contact.initials;
        avatar.className = `avatar-placeholder avatar-md ${contact.color}`;
      }
      socket?.emit("chat_join", conversationId, (history) => {
        if (Array.isArray(history) && history.length) {
          conversations[conversationId] = history;
        }
        renderConversation(conversationId);
      });
      renderConversation(conversationId);
    }

    document.querySelectorAll(".message-list-item").forEach((item) => {
      const name = cleanText(item.querySelector(".message-list-name")?.textContent);
      const avatarNode = item.querySelector(".avatar-placeholder, .avatar-photo");
      const initials = cleanText(avatarNode?.textContent);
      const color = Array.from(avatarNode?.classList || []).find((name) => !["avatar-placeholder", "avatar-photo", "avatar-md", "avatar-lg"].includes(name)) || "green";
      const contact = contactFromName(name, initials, color);
      const conversationId = conversationIdFor(contact.id);
      item.dataset.conversationId = conversationId;
      item.dataset.contactId = contact.id;
      item.dataset.contactInitials = contact.initials;
      item.dataset.contactColor = contact.color;
      contacts[conversationId] = contact;
      conversations[conversationId] = [];
      item.addEventListener("click", () => openConversation(contact, conversationId));
    });

    window.openChat = (name, initials, color) => {
      const contact = contactFromName(name, initials, color);
      const conversationId = conversationIdFor(contact.id);
      ensureConversationItem(contact, conversationId);
      openConversation(contact, conversationId);
    };

    window.sendMessage = () => {
      const input = document.getElementById("chatInput");
      const text = input?.value.trim();
      if (!text || !activeConversationId) return;
      const contact = contacts[activeConversationId];
      const optimistic = {
        id: `local-${Date.now()}`,
        conversationId: activeConversationId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderInitials: currentUser.initials,
        recipientId: contact?.id || "",
        text,
        createdAt: new Date().toISOString()
      };
      conversations[activeConversationId] = [...(conversations[activeConversationId] || []), optimistic];
      renderConversation(activeConversationId);
      input.value = "";
      updateConversationPreview(activeConversationId, text, optimistic.createdAt);
      socket?.emit("chat_message", optimistic);
    };

    window.handleEnter = (event) => {
      if (event.key === "Enter") window.sendMessage();
    };

    document.getElementById("chatInput")?.addEventListener("input", () => {
      if (!activeConversationId) return;
      socket?.emit("typing", {
        conversationId: activeConversationId,
        userId: currentUser.id,
        name: currentUser.name
      });
      clearTimeout(typingTimer);
      typingTimer = setTimeout(() => {
        socket?.emit("stop_typing", { conversationId: activeConversationId, userId: currentUser.id });
      }, 800);
    });

    socket?.on("chat_message", (message) => {
      if (runtimeId !== messageRuntime) return;
      if (!message?.conversationId || String(message.senderId) === currentUser.id) return;
      const contact = {
        id: String(message.senderId),
        name: message.senderName || "SkillSwap User",
        initials: message.senderInitials || initialsFromName(message.senderName || "SkillSwap User"),
        color: "green"
      };
      ensureConversationItem(contact, message.conversationId);
      conversations[message.conversationId] = [...(conversations[message.conversationId] || []), message];
      updateConversationPreview(message.conversationId, message.text, message.createdAt, true);
      if (message.conversationId === activeConversationId) renderConversation(activeConversationId);
    });

    socket?.on("user_typing", (data) => {
      if (runtimeId !== messageRuntime) return;
      if (data?.conversationId !== activeConversationId || data.userId === currentUser.id) return;
      const status = document.querySelector(".chat-header-status");
      if (status) status.textContent = "Typing...";
    });

    socket?.on("user_stopped_typing", (data) => {
      if (runtimeId !== messageRuntime) return;
      if (data?.conversationId !== activeConversationId || data.userId === currentUser.id) return;
      const status = document.querySelector(".chat-header-status");
      if (status) status.textContent = "Online";
    });

    const activeItem = document.querySelector(".message-list-item.active") || document.querySelector(".message-list-item");
    if (activeItem) {
      const contact = contacts[activeItem.dataset.conversationId];
      openConversation(contact, activeItem.dataset.conversationId);
    }
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
    return getSocket();
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyUserShell();
    initLogoutLinks();
    initTutorBookingLinks();
    applyBookingTutor();
    initLogin();
    initSignup();
    initBooking();
    initBookingInteractions();
    initNotifications();
    initNotificationControls();
    initLiveSessions();
    initStudentDashboard();
    initFindTutors();
    initSocket();
    initMessages();
  });

  window.SkillSwapApp = {
    clearLocalDemoData,
    getToken,
    getUser,
    logout,
    notify,
    initMessages,
    request,
    socket: () => activeSocket,
    showSessionDetails
  };

  window.openDetails = () => {
    const first = document.querySelector("#tab-upcoming .session-card .btn-primary");
    if (first) showSessionDetails(first);
  };
})();
