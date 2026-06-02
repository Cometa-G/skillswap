window.SkillSwapMessaging = window.SkillSwapMessaging || {};

window.SkillSwapMessaging.messageThread = function messageThread() {
  return `
    <section class="chat-area messaging-thread" id="chatArea" aria-label="Message thread">
      ${window.SkillSwapMessaging.messageHeader()}
      <div class="chat-messages messaging-scroll-area" id="chatMessages" tabindex="0" aria-live="polite">
        ${window.SkillSwapMessaging.emptyState()}
      </div>
      ${window.SkillSwapMessaging.messageComposer()}
    </section>
  `;
};
