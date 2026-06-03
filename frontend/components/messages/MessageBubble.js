window.SkillSwapMessaging = window.SkillSwapMessaging || {};

function messageEntityId(value) {
  if (value === undefined || value === null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  return String(value.id || value._id || value.userId || "");
}

window.SkillSwapMessaging.messageBubble = function messageBubble(message = {}) {
  const escape = window.SkillSwapMessaging.escapeHtml;
  const senderId = messageEntityId(message.senderId || message.sender);
  const currentUserId = messageEntityId(message.currentUser?.id || message.currentUser?._id || message.currentUserId);
  const mine = Boolean(senderId && currentUserId && senderId === currentUserId);
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
