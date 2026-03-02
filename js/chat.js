// =============================================
// FOUNDR v2 - Chat Module
// =============================================

const ChatUI = (() => {
    let activeChatId = null;

    function init() {
        document.getElementById('chat-modal-close')?.addEventListener('click', closeChat);
        document.getElementById('chat-overlay')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) closeChat(); });
        document.getElementById('chat-send-btn')?.addEventListener('click', sendMessage);
        document.getElementById('chat-input')?.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });
    }

    function openChat(chatId) {
        const me = Session.get();
        if (!me) { Auth.openAuth(); return; }
        const chat = Chats.find(chatId);
        if (!chat || !chat.members.includes(me.id)) { showToast('Acesso negado a este chat.', 'error'); return; }
        activeChatId = chatId;
        const project = Projects.find(chat.projectId);
        const otherId = chat.members.find(id => id !== me.id);
        const other = Users.find(otherId);
        document.getElementById('chat-project-title').textContent = project?.title || 'Projeto';
        document.getElementById('chat-partner-name').textContent = other ? `${other.name} ${other.surname}` : 'Sócio';
        renderMessages(chat, me.id);
        document.getElementById('chat-overlay').classList.add('open');
        setTimeout(() => document.getElementById('chat-input')?.focus(), 100);
    }

    function renderMessages(chat, myId) {
        const container = document.getElementById('chat-messages');
        if (!container) return;
        if (!chat.messages || chat.messages.length === 0) {
            container.innerHTML = `<div class="chat-empty"><span>🎉</span> Conexão estabelecida! Iniciem a conversa.</div>`;
            return;
        }

        // Group consecutive messages by sender
        let html = '';
        let lastSender = null;
        let lastDate = null;

        chat.messages.forEach(msg => {
            const mine = msg.senderId === myId;
            const sender = Users.find(msg.senderId);
            const senderName = sender ? sender.name : 'Usuário';
            const date = new Date(msg.createdAt);
            const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
            const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            if (dateStr !== lastDate) {
                html += `<div class="chat-date-sep">${dateStr}</div>`;
                lastDate = dateStr;
                lastSender = null;
            }

            const isNewGroup = msg.senderId !== lastSender;
            if (isNewGroup) {
                if (lastSender !== null) html += `</div>`; // close prev group
                html += `<div class="msg-group ${mine ? 'mine' : 'theirs'}">`;
                if (!mine) html += `<div class="msg-sender">${escapeHtml(senderName)}</div>`;
                lastSender = msg.senderId;
            }

            html += `<div class="msg-bubble">${escapeHtml(msg.text)}</div>`;
        });
        if (lastSender !== null) html += `</div>`;

        // Add time to last message
        const lastMsg = chat.messages[chat.messages.length - 1];
        const lastTime = new Date(lastMsg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        html += `<div class="msg-time" style="${lastMsg.senderId === myId ? 'text-align:right' : ''}">${lastTime}</div>`;

        container.innerHTML = html;
        container.scrollTop = container.scrollHeight;
    }

    function sendMessage() {
        const input = document.getElementById('chat-input');
        const text = input?.value.trim();
        if (!text || !activeChatId) return;
        const me = Session.get();
        if (!me) return;
        Chats.addMessage(activeChatId, { senderId: me.id, text });
        input.value = '';
        const chat = Chats.find(activeChatId);
        renderMessages(chat, me.id);
    }

    function closeChat() {
        document.getElementById('chat-overlay').classList.remove('open');
        activeChatId = null;
    }

    return { init, openChat, closeChat };
})();
