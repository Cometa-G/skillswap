window.SkillSwapMessaging = window.SkillSwapMessaging || {};

window.SkillSwapMessaging.messageHeader = function messageHeader() {
  return `
    <header class="chat-header messaging-thread-header" id="messageHeader">
      <button type="button" class="messaging-back-btn" id="messageBackButton" aria-label="Back to conversations">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
        </svg>
      </button>
      <div class="avatar-placeholder avatar-md green" id="chatAvatar" aria-hidden="true">SS</div>
      <div class="chat-header-info">
        <div class="chat-header-name" id="chatName">Select a conversation</div>
        <div class="chat-header-status" id="chatStatus">Offline</div>
        <div class="messaging-typing" id="typingIndicator" aria-live="polite"></div>
      </div>
      <div class="messaging-actions" aria-label="Conversation actions">
        <button type="button" class="icon-btn" aria-label="Voice call" title="Voice call">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.11 5.18 2 2 0 0 1 5.1 3h3a2 2 0 0 1 2 1.72c.12.9.32 1.77.61 2.6a2 2 0 0 1-.45 2.11L9 10.7a16 16 0 0 0 4.3 4.3l1.27-1.27a2 2 0 0 1 2.11-.45c.83.29 1.7.5 2.6.61A2 2 0 0 1 22 16.92z"/>
          </svg>
        </button>
        <button type="button" class="icon-btn" aria-label="Video call" title="Video call">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m22 8-6 4 6 4V8z"/><rect x="2" y="6" width="14" height="12" rx="2"/>
          </svg>
        </button>
        <button type="button" class="icon-btn" aria-label="More options" title="More options">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
          </svg>
        </button>
      </div>
    </header>
  `;
};
