window.SkillSwapMessaging = window.SkillSwapMessaging || {};

window.SkillSwapMessaging.conversationList = function conversationList() {
  return `
    <aside class="messages-sidebar messaging-sidebar" aria-label="Conversations">
      <div class="messaging-sidebar-title">
        <h2>Messages</h2>
      </div>
      <div class="messages-sidebar-header">
        <label class="sr-only" for="msgSearch">Search conversations</label>
        <div class="messages-search">
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="search" placeholder="Search conversations" id="msgSearch" autocomplete="off" />
        </div>
      </div>
      <div class="messages-list" id="messagesList" role="list" aria-label="Conversation list">
        ${window.SkillSwapMessaging.emptyState({
          title: "No conversations yet",
          message: "Search for a user to start a 1-to-1 chat."
        })}
      </div>
    </aside>
  `;
};
