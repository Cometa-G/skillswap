window.SkillSwapMessaging = window.SkillSwapMessaging || {};

window.SkillSwapMessaging.messageBubble = function messageBubble(message = {}) {
  const escape = window.SkillSwapMessaging.escapeHtml;
  const mine = Boolean(message.mine);
  const type = mine ? "sent" : "received";

  return `
    <div class="chat-message messaging-bubble-row ${type}" data-message-id="${escape(message.id || "")}">
      <div class="messaging-bubble-wrap">
        <div class="chat-bubble">${escape(message.text || "")}</div>
        <div class="chat-time">${escape(message.time || "")}</div>
      </div>
    </div>
  `;
};
