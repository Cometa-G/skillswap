window.SkillSwapMessaging = window.SkillSwapMessaging || {};

window.SkillSwapMessaging.layout = function layout() {
  return `
    <div class="messaging-page">
      <div class="messaging-page-heading">
        <h1>Messages</h1>
      </div>
      <div class="messages-layout messaging-layout" id="messagingLayout">
        ${window.SkillSwapMessaging.conversationList()}
        ${window.SkillSwapMessaging.messageThread()}
      </div>
    </div>
  `;
};

window.SkillSwapMessaging.mount = function mount(target) {
  const root = typeof target === "string" ? document.querySelector(target) : target;
  if (!root) return false;
  root.innerHTML = window.SkillSwapMessaging.layout();
  return true;
};
