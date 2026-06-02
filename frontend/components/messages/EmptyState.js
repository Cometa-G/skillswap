window.SkillSwapMessaging = window.SkillSwapMessaging || {};

window.SkillSwapMessaging.emptyState = function emptyState(options = {}) {
  const title = options.title || "No conversation selected";
  const message = options.message || "Search for a user or choose a conversation to begin.";

  return `
    <div class="messaging-empty-state" role="status" aria-live="polite">
      <div class="messaging-empty-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </div>
      <h2>${window.SkillSwapMessaging.escapeHtml(title)}</h2>
      <p>${window.SkillSwapMessaging.escapeHtml(message)}</p>
    </div>
  `;
};
