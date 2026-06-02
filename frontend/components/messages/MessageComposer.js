window.SkillSwapMessaging = window.SkillSwapMessaging || {};

window.SkillSwapMessaging.messageComposer = function messageComposer() {
  return `
    <form class="chat-input-area messaging-composer" id="messageComposer" aria-label="Send a message">
      <label class="sr-only" for="chatInput">Message</label>
      <input
        type="text"
        class="chat-input"
        placeholder="Type a message..."
        id="chatInput"
        autocomplete="off"
        aria-label="Message text"
      />
      <button class="chat-send-btn" type="submit" aria-label="Send message">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </form>
  `;
};
