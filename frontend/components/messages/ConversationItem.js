window.SkillSwapMessaging = window.SkillSwapMessaging || {};

window.SkillSwapMessaging.escapeHtml = window.SkillSwapMessaging.escapeHtml || function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

window.SkillSwapMessaging.conversationItem = function conversationItem(conversation = {}) {
  const escape = window.SkillSwapMessaging.escapeHtml;
  const unread = Number(conversation.unread || 0);
  const activeClass = conversation.active ? " active" : "";
  const searchClass = conversation.searchResult ? " user-search-result" : "";
  const label = conversation.searchResult ? `Start conversation with ${conversation.name}` : `Open conversation with ${conversation.name}`;

  return `
    <button
      type="button"
      class="message-list-item messaging-conversation-item${activeClass}${searchClass}"
      data-conversation-id="${escape(conversation.conversationId || "")}"
      data-contact-id="${escape(conversation.contactId || "")}"
      data-contact-username="${escape(conversation.username || "")}"
      data-contact-initials="${escape(conversation.initials || "SS")}"
      data-contact-color="${escape(conversation.color || "green")}"
      aria-label="${escape(label)}"
    >
      <span class="messaging-avatar avatar-placeholder avatar-md ${escape(conversation.color || "green")}" aria-hidden="true">
        ${escape(conversation.initials || "SS")}
      </span>
      <span class="message-list-item-info">
        <span class="message-list-name">${escape(conversation.name || "SkillSwap User")}</span>
        <span class="message-list-preview">${escape(conversation.preview || "No messages yet")}</span>
      </span>
      <span class="messaging-conversation-meta">
        <span class="message-list-time">${escape(conversation.time || "")}</span>
        ${unread ? `<span class="chat-unread-count" aria-label="${unread} unread messages">${unread}</span>` : ""}
      </span>
    </button>
  `;
};
