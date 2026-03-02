// =============================================
// FOUNDR v2 - Dashboard Module
// =============================================

const Dashboard = (() => {
  let active = 'my-projects';

  function init() {
    document.querySelectorAll('.sidebar-nav-item[data-section]').forEach(item =>
      item.addEventListener('click', () => switchSection(item.dataset.section))
    );
  }

  function render() {
    const me = Session.get();
    if (!me) return;

    // Avatar (photo or initials)
    const av = document.getElementById('sidebar-avatar');
    if (av) {
      if (me.photoURL) {
        av.innerHTML = `<img src="${me.photoURL}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
      } else {
        av.textContent = `${me.name[0]}${me.surname[0]}`.toUpperCase();
      }
    }

    document.getElementById('sidebar-name').textContent = `${me.name} ${me.surname}`;
    document.getElementById('sidebar-tags').textContent = (me.tags || []).slice(0, 2).join(' · ') || '–';

    const purp = document.getElementById('sidebar-purpose');
    purp.textContent = me.purpose === 'offer' ? 'Ofereço uma ideia' : 'Busco um projeto';
    purp.className = 'sidebar-purpose-badge ' + (me.purpose === 'offer' ? 'purpose-offer' : 'purpose-find');

    updateBadges(me);
    switchSection(active);
  }

  function updateBadges(me) {
    const myProjects = Projects.byOwner(me.id);
    const pending = myProjects.reduce((acc, p) => acc + Pitches.pending(p.id).length, 0);
    const pitchesBadge = document.getElementById('pitches-badge');
    if (pitchesBadge) { pitchesBadge.textContent = pending; pitchesBadge.classList.toggle('hidden', pending === 0); }
    const chatsCount = Chats.forUser(me.id).length;
    const chatsBadge = document.getElementById('chats-badge');
    if (chatsBadge) { chatsBadge.textContent = chatsCount; chatsBadge.classList.toggle('hidden', chatsCount === 0); }
  }

  function switchSection(section) {
    active = section;
    document.querySelectorAll('.sidebar-nav-item[data-section]').forEach(i =>
      i.classList.toggle('active', i.dataset.section === section)
    );
    document.querySelectorAll('.dash-section').forEach(s =>
      s.classList.toggle('active', s.id === `section-${section}`)
    );
    const me = Session.get();
    if (!me) return;
    if (section === 'my-projects') renderMyProjects(me);
    if (section === 'pitches') renderPitches(me);
    if (section === 'sent-pitches') renderSentPitches(me);
    if (section === 'connections') renderConnections(me);
  }

  function renderMyProjects(me) {
    const container = document.getElementById('my-projects-list');
    if (!container) return;
    const hasActive = Projects.activeByOwner(me.id).length > 0;
    document.getElementById('project-limit-warn')?.classList.toggle('hidden', !hasActive);
    const btnNew = document.getElementById('btn-new-project');
    if (btnNew) btnNew.disabled = hasActive;

    const projects = Projects.byOwner(me.id);
    if (projects.length === 0) {
      container.innerHTML = `<div class="empty-state">
        <div class="es-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <h3>Nenhum projeto ainda</h3>
        <p>Você ainda não criou nenhum projeto.</p>
        <button class="btn btn-primary" onclick="App.navigate('create-project')">Criar meu primeiro projeto</button>
      </div>`;
      return;
    }
    const STATUS_CLS = { seeking: 'badge-seeking', developing: 'badge-developing', finished: 'badge-finished' };
    container.innerHTML = projects.map(p => {
      const si = PROJECT_STATUS[p.status] || PROJECT_STATUS.seeking;
      const sc = STATUS_CLS[p.status] || 'badge-seeking';
      const pending = Pitches.byProject(p.id).filter(pt => pt.status === 'pending').length;
      const coverThumb = p.coverImage ? `<img src="${p.coverImage}" class="proj-row-thumb" alt="">` : '';
      return `<div class="proj-row">
        ${coverThumb}
        <div class="proj-row-info">
          <div class="proj-row-title">${escapeHtml(p.title)}</div>
          <div class="proj-row-sub">${pending > 0 ? `${pending} pitch(es) aguardando` : 'Sem pitches pendentes'}</div>
        </div>
        <span class="status-badge ${sc}">${si.label}</span>
        <div class="proj-row-actions">
          <button class="btn btn-ghost btn-sm" onclick="App.navigate('project','${p.id}')">Ver</button>
          <button class="btn btn-danger btn-sm" onclick="Dashboard.deleteProject('${p.id}')">Excluir</button>
        </div>
      </div>`;
    }).join('');
  }

  function renderPitches(me) {
    const container = document.getElementById('pitches-list');
    if (!container) return;
    const myProjects = Projects.byOwner(me.id);
    const allPitches = [];
    myProjects.forEach(p => Pitches.byProject(p.id).filter(pt => pt.status === 'pending')
      .forEach(pt => allPitches.push({ ...pt, projectTitle: p.title, projectId: p.id })));

    if (allPitches.length === 0) {
      container.innerHTML = `<div class="empty-state">
        <div class="es-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>
        </div>
        <h3>Nenhum pitch recebido</h3>
        <p>Quando alguém se candidatar ao seu projeto aparecerá aqui.</p>
      </div>`;
      return;
    }
    container.innerHTML = allPitches.map(pt => {
      const applicant = Users.find(pt.applicantId);
      if (!applicant) return '';
      const avatarHtml = applicant.photoURL
        ? `<img src="${applicant.photoURL}" class="avatar avatar-md avatar-photo" alt="${escapeHtml(applicant.name)}">`
        : `<div class="avatar avatar-md">${applicant.name[0]}${applicant.surname[0]}</div>`;
      const tags = (applicant.tags || []).slice(0, 2).join(' · ');
      return `<div class="pitch-card">
        <div class="pitch-card-header">
          ${avatarHtml}
          <div class="pitch-card-meta">
            <h4>${escapeHtml(applicant.name + ' ' + applicant.surname)}</h4>
            <p>${tags} · Projeto: ${escapeHtml(pt.projectTitle)}</p>
          </div>
        </div>
        <div class="pitch-text">"${escapeHtml(pt.text)}"</div>
        <div class="pitch-card-actions">
          <button class="btn btn-success btn-sm" onclick="Dashboard.acceptPitch('${pt.id}','${pt.projectId}','${pt.applicantId}')">Aceitar</button>
          <button class="btn btn-danger btn-sm" onclick="Dashboard.rejectPitch('${pt.id}')">Recusar</button>
        </div>
      </div>`;
    }).join('');
  }

  function renderSentPitches(me) {
    const container = document.getElementById('sent-pitches-list');
    if (!container) return;
    const sentPitches = Pitches.byApplicant(me.id);
    if (sentPitches.length === 0) {
      container.innerHTML = `<div class="empty-state">
        <div class="es-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </div>
        <h3>Sem pitches enviados</h3>
        <p>Você ainda não se candidatou a nenhum projeto.</p>
        <button class="btn btn-secondary btn-sm" onclick="App.navigate('feed')">Explorar projetos</button>
      </div>`;
      return;
    }
    const STATUS_MAP = {
      pending: { cls: 'badge-seeking', label: 'Aguardando' },
      accepted: { cls: 'badge-finished', label: 'Aceito' },
      rejected: { cls: 'badge-developing', label: 'Recusado' },
    };
    container.innerHTML = sentPitches.map(pt => {
      const project = Projects.find(pt.projectId);
      const sm = STATUS_MAP[pt.status] || STATUS_MAP.pending;
      const snippet = pt.text.length > 100 ? pt.text.slice(0, 100) + '…' : pt.text;
      const chat = Chats.all().find(c => c.projectId === pt.projectId && c.members.includes(me.id));
      return `<div class="sent-pitch-card">
        <div class="sent-pitch-info" style="flex:1">
          <h4>${project ? escapeHtml(project.title) : 'Projeto removido'}</h4>
          <p>${new Date(pt.createdAt).toLocaleDateString('pt-BR')}</p>
          <p class="sent-pitch-snippet">"${escapeHtml(snippet)}"</p>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:10px;flex-shrink:0">
          <span class="status-badge ${sm.cls}">${sm.label}</span>
          ${pt.status === 'accepted' && chat ? `<button class="btn btn-primary btn-sm" onclick="ChatUI.openChat('${chat.id}')">Chat</button>` : ''}
          ${project ? `<button class="btn btn-ghost btn-sm" onclick="App.navigate('project','${pt.projectId}')">Ver</button>` : ''}
        </div>
      </div>`;
    }).join('');
  }

  function renderConnections(me) {
    const container = document.getElementById('connections-list');
    if (!container) return;
    const chats = Chats.forUser(me.id);
    if (chats.length === 0) {
      container.innerHTML = `<div class="empty-state">
        <div class="es-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <h3>Sem conexões ainda</h3>
        <p>Quando um fundador aceitar seu pitch, sua conexão aparecerá aqui.</p>
      </div>`;
      return;
    }
    container.innerHTML = chats.map(c => {
      const project = Projects.find(c.projectId);
      const otherId = c.members.find(id => id !== me.id);
      const other = Users.find(otherId);
      const avatarHtml = other?.photoURL
        ? `<img src="${other.photoURL}" class="avatar avatar-md avatar-photo" alt="${escapeHtml(other.name)}">`
        : `<div class="avatar avatar-md">${other ? `${other.name[0]}${other.surname[0]}`.toUpperCase() : '?'}</div>`;
      const msgCount = c.messages?.length || 0;
      return `<div class="conn-card">
        ${avatarHtml}
        <div class="conn-info">
          <h4>${other ? escapeHtml(other.name + ' ' + other.surname) : 'Socio'}</h4>
          <p>${project ? escapeHtml(project.title) : 'Projeto'} · ${msgCount} mensagem(ns)</p>
        </div>
        <button class="btn btn-primary btn-sm" onclick="ChatUI.openChat('${c.id}')">Chat</button>
      </div>`;
    }).join('');
  }

  function acceptPitch(pitchId, projectId, applicantId) {
    Pitches.update(pitchId, { status: 'accepted' });
    const me = Session.get();
    if (!Chats.byProject(projectId)) Chats.create({ projectId, members: [me.id, applicantId] });
    Projects.update(projectId, { status: 'developing' });
    showToast('Conexão criada! Chat de equipe disponível.', 'success');
    render();
  }

  function rejectPitch(pitchId) {
    Pitches.update(pitchId, { status: 'rejected' });
    showToast('Pitch recusado.', 'error');
    render();
  }

  function deleteProject(projectId) {
    if (!confirm('Excluir este projeto permanentemente?')) return;
    Projects.delete(projectId);
    showToast('Projeto excluído.', 'success');
    render();
    ProjectsUI.renderFeed();
  }

  return { init, render, switchSection, acceptPitch, rejectPitch, deleteProject };
})();
