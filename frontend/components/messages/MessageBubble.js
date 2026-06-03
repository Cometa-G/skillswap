window.SkillSwapMessaging = window.SkillSwapMessaging || {};

window.SkillSwapMessaging.messageBubble = function messageBubble(message = {}) {
  const escape = window.SkillSwapMessaging.escapeHtml;
  const isOwnMessage = Boolean(message.isOwnMessage);
  const messageClass = isOwnMessage ? "message sent" : "message received";

  return `
    <div class="${messageClass} chat-message messaging-bubble-row" data-message-id="${escape(message.id || "")}">
      <div class="messaging-bubble-wrap">
        <div class="chat-bubble">${escape(message.text || "")}</div>
        <div class="chat-time">${escape(message.time || "")}</div>
      </div>
    </div>
  `;
};
