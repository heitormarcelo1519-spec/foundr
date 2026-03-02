// =============================================
// FOUNDR v2 - Projects Module
// =============================================

const ProjectsUI = (() => {
  let activeFilter = { category: null };

  function init() {
    renderFilterBar();
    renderFeed();
    document.getElementById('projects-grid')?.addEventListener('click', (e) => {
      const card = e.target.closest('.project-card');
      if (card) App.navigate('project', card.dataset.id);
    });
    document.getElementById('search-input')?.addEventListener('input', (e) => {
      renderFeed(e.target.value.trim().toLowerCase());
    });
  }

  function renderFilterBar() {
    const bar = document.getElementById('filter-bar-chips');
    if (!bar) return;
    const all = `<span class="chip ${!activeFilter.category ? 'active' : ''}" onclick="ProjectsUI.setFilter(null)">Todos</span>`;
    const cats = Object.entries(TAXONOMY).map(([key, val]) =>
      `<span class="chip ${activeFilter.category === key ? 'active' : ''}" onclick="ProjectsUI.setFilter('${key}')">${val.label}</span>`
    ).join('');
    bar.innerHTML = all + '<span class="chip-divider"></span>' + cats;
  }

  function setFilter(category) {
    activeFilter = { category };
    renderFilterBar();
    renderFeed();
  }

  function renderFeed(search = '') {
    const grid = document.getElementById('projects-grid');
    const countLabel = document.getElementById('project-count-label');
    if (!grid) return;
    let projects = Projects.all();
    if (activeFilter.category) projects = projects.filter(p => p.category === activeFilter.category);
    if (search) {
      projects = projects.filter(p =>
        p.title.toLowerCase().includes(search) ||
        p.summary.toLowerCase().includes(search) ||
        (p.skills || []).some(s => s.toLowerCase().includes(search))
      );
    }
    if (countLabel) countLabel.textContent = `${projects.length} projeto${projects.length !== 1 ? 's' : ''}`;
    if (projects.length === 0) {
      grid.innerHTML = `<div class="empty-state">
        <div class="es-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </div>
        <h3>Nenhum projeto encontrado</h3>
        <p>Tente outro filtro ou seja o primeiro a criar um projeto nessa area!</p>
      </div>`;
      return;
    }
    grid.innerHTML = projects.map((p, i) => renderCard(p, i)).join('');
  }

  const CAT_DOT = { tech: 'dot-tech', design: 'dot-design', business: 'dot-business', ops: 'dot-ops' };
  const STATUS_CLASS = { seeking: 'badge-seeking', developing: 'badge-developing', finished: 'badge-finished' };
  const CAT_COLOR = { tech: '#7c6dfa', design: '#f472b6', business: '#34d399', ops: '#fbbf24' };

  function renderCard(p, delay = 0) {
    const owner = Users.find(p.ownerId);
    const ownerName = owner ? `${owner.name} ${owner.surname}` : 'Usuario';
    const statusInfo = PROJECT_STATUS[p.status] || PROJECT_STATUS.seeking;
    const sCls = STATUS_CLASS[p.status] || 'badge-seeking';
    const dCls = CAT_DOT[p.category] || 'dot-tech';
    const skillsHtml = (p.skills || []).slice(0, 4).map(s => `<span class="skill-chip">${escapeHtml(s)}</span>`).join('') +
      ((p.skills || []).length > 4 ? `<span class="skill-chip">+${p.skills.length - 4}</span>` : '');

    // Cover image: as CSS background behind content with overlay gradient
    const coverStyle = p.coverImage
      ? `style="--card-bg-img:url('${p.coverImage}')"`
      : '';
    const coverClass = p.coverImage ? ' has-cover' : '';

    // Owner avatar: photo or initials
    const ownerHtml = (() => {
      if (owner?.photoURL) {
        return `<img src="${owner.photoURL}" class="avatar avatar-sm avatar-photo" alt="${escapeHtml(owner.name)}">`;
      }
      const initials = owner ? `${owner.name[0]}${owner.surname[0]}`.toUpperCase() : '??';
      return `<div class="avatar avatar-sm">${initials}</div>`;
    })();

    return `
      <div class="project-card${coverClass}" data-id="${p.id}" ${coverStyle} style="${coverStyle ? '' : ''}animation-delay:${delay * 55}ms">
        ${p.coverImage ? `<div class="card-cover-overlay"></div>` : ''}
        <div class="card-inner">
          <div class="card-top">
            <div class="card-category-dot ${dCls}"></div>
            <div class="card-title">${escapeHtml(p.title)}</div>
            <span class="status-badge ${sCls}">${statusInfo.label}</span>
          </div>
          <p class="card-summary">${escapeHtml(p.summary)}</p>
          <div class="card-meta">
            <span class="card-stage-pill">${escapeHtml(p.stage || 'Ideação')}</span>
          </div>
          <div class="card-skills">${skillsHtml}</div>
          <div class="card-footer">
            <div class="card-owner">
              ${ownerHtml}
              <span class="card-owner-name">${escapeHtml(ownerName)}</span>
            </div>
            <div class="card-arrow">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
          </div>
        </div>
      </div>`;
  }

  function renderDetail(projectId) {
    const p = Projects.find(projectId);
    if (!p) { App.navigate('feed'); return; }
    const owner = Users.find(p.ownerId);
    const me = Session.get();
    const sCls = STATUS_CLASS[p.status] || 'badge-seeking';
    const statusInfo = PROJECT_STATUS[p.status] || PROJECT_STATUS.seeking;
    const catInfo = TAXONOMY[p.category] || {};
    const isOwner = me && me.id === p.ownerId;
    const acceptedChat = Chats.all().find(c => c.projectId === projectId && c.members.includes(me?.id));
    const isMember = isOwner || !!acceptedChat;
    const skillsHtml = (p.skills || []).map(s => `<span class="skill-chip-lg">${escapeHtml(s)}</span>`).join('');
    const ownerTags = (owner?.tags || []).slice(0, 3).map(t => `<span class="skill-chip">${escapeHtml(t)}</span>`).join('');

    // Owner avatar
    const ownerAvatarHtml = owner?.photoURL
      ? `<img src="${owner.photoURL}" class="avatar avatar-lg avatar-photo" alt="${escapeHtml(owner.name)}">`
      : `<div class="avatar avatar-lg">${owner ? `${owner.name[0]}${owner.surname[0]}`.toUpperCase() : '??'}</div>`;

    // Detail hero cover style
    const heroStyle = p.coverImage
      ? `style="background-image:url('${p.coverImage}');background-size:cover;background-position:center;"`
      : '';
    const heroClass = p.coverImage ? ' detail-hero-has-cover' : '';

    // Right panel
    let actionHtml = '';
    if (!me) {
      actionHtml = `
        <div class="lock-card">
          <div class="lock-icon-wrap">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h3>Interessado neste projeto?</h3>
          <p>Crie sua conta gratuita para enviar um pitch e integrar a equipe.</p>
          <button class="btn btn-primary btn-lg" style="width:100%" onclick="Auth.openAuth('register')">Criar conta gratis</button>
        </div>`;
    } else if (isMember && !isOwner && acceptedChat) {
      actionHtml = `
        <div class="detail-card" style="text-align:center;">
          <div class="success-check">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h3 style="font-size:16px;font-weight:900;margin-bottom:8px;text-transform:none;letter-spacing:0;">Voce e membro!</h3>
          <p style="font-size:13px;color:var(--text-secondary);margin-bottom:20px;">O chat de equipe está disponível.</p>
          <button class="btn btn-primary" style="width:100%" onclick="ChatUI.openChat('${acceptedChat.id}')">Abrir Chat</button>
        </div>`;
    } else if (isOwner) {
      const pending = Pitches.pending(projectId).length;
      const chat = Chats.byProject(projectId);
      actionHtml = `
        <div class="detail-card">
          <h3>Seu Projeto</h3>
          <div class="form-group">
            <label class="form-label">Alterar status</label>
            <select class="form-input" onchange="ProjectsUI.changeStatus('${p.id}', this.value)">
              <option value="seeking" ${p.status === 'seeking' ? 'selected' : ''}>Em busca de socio</option>
              <option value="developing" ${p.status === 'developing' ? 'selected' : ''}>Em desenvolvimento</option>
              <option value="finished" ${p.status === 'finished' ? 'selected' : ''}>Finalizado</option>
            </select>
          </div>
          <p style="font-size:13px;color:var(--text-muted)">${pending} pitch(es) pendente(s) · <span style="cursor:pointer;color:var(--accent-light)" onclick="App.navigate('dashboard')">Ver painel</span></p>
          ${chat ? `<button class="btn btn-primary" style="width:100%;margin-top:14px" onclick="ChatUI.openChat('${chat.id}')">Chat de Equipe</button>` : ''}
        </div>`;
    } else {
      const existing = Pitches.all().find(pt => pt.projectId === projectId && pt.applicantId === me.id);
      if (existing) {
        const msgMap = {
          pending: 'Pitch enviado. Aguardando análise do fundador.',
          accepted: 'Pitch aceito! Acesse o chat de equipe.',
          rejected: 'Pitch não foi aceito neste projeto.'
        };
        const statusClsMap = { pending: 'pitch-pending', accepted: 'pitch-accepted', rejected: 'pitch-rejected' };
        actionHtml = `
          <div class="detail-card">
            <h3>Seu Pitch</h3>
            <div class="pitch-status ${statusClsMap[existing.status]}">
              <span>${msgMap[existing.status]}</span>
            </div>
            <div style="margin-top:14px;padding:14px;background:var(--bg-input);border-radius:var(--r-md);font-size:13px;color:var(--text-secondary);font-style:italic;">"${escapeHtml(existing.text)}"</div>
          </div>`;
      } else if (p.status === 'seeking') {
        actionHtml = `
          <div class="detail-card">
            <h3>Fazer Pitch</h3>
            <p style="font-size:13px;color:var(--text-secondary);margin-bottom:16px;font-weight:normal;text-transform:none;letter-spacing:0;">Convença o fundador por que voce é o socio ideal.</p>
            <textarea class="pitch-textarea" id="pitch-text" maxlength="500" placeholder="Ex: Tenho 5 anos de experiência em mobile e já lancei 3 apps com +10k usuários. Posso liderar toda a stack técnica..." oninput="ProjectsUI.updateCharCount(this)"></textarea>
            <div class="char-row" id="pitch-char-count">0 / 500 caracteres</div>
            <button class="btn btn-primary" style="width:100%" onclick="ProjectsUI.submitPitch('${p.id}')">
              Enviar Pitch
            </button>
          </div>`;
      } else {
        actionHtml = `
          <div class="detail-card" style="text-align:center;">
            <p style="color:var(--text-muted);font-size:14px;padding:20px 0;">Este projeto não está aceitando novos socios no momento.</p>
          </div>`;
      }
    }

    document.getElementById('project-detail-content').innerHTML = `
      <div class="detail-container">
        <button class="back-btn" onclick="App.navigate('feed')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Voltar ao feed
        </button>

        <div class="detail-hero${heroClass}" ${heroStyle}>
          ${p.coverImage ? '<div class="detail-cover-overlay"></div>' : ''}
          <div class="detail-hero-top">
            <div class="detail-meta-row">
              <span class="status-badge ${sCls}">${statusInfo.label}</span>
              ${catInfo.label ? `<span class="chip">${catInfo.label}</span>` : ''}
              <span class="card-stage-pill">${escapeHtml(p.stage || 'Ideação')}</span>
            </div>
            <h1 class="detail-title">${escapeHtml(p.title)}</h1>
            <p class="detail-summary">${escapeHtml(p.summary)}</p>
          </div>
          ${skillsHtml ? `<div class="detail-hero-skills">${skillsHtml}</div>` : ''}
        </div>

        <div class="detail-grid">
          <div>
            <div class="detail-card">
              <h3>Fundador</h3>
              <div class="owner-card">
                ${ownerAvatarHtml}
                <div class="owner-info" style="flex:1">
                  <h4>${owner ? escapeHtml(owner.name + ' ' + owner.surname) : 'Usuario'}</h4>
                  <div class="owner-tags">${ownerTags}</div>
                  ${owner?.bio ? `<p class="bio">${escapeHtml(owner.bio)}</p>` : ''}
                </div>
              </div>
            </div>
          </div>
          <div>${actionHtml}</div>
        </div>
      </div>`;
  }

  function updateCharCount(el) {
    const count = el.value.length;
    const el2 = document.getElementById('pitch-char-count');
    if (!el2) return;
    el2.textContent = `${count} / 500 caracteres`;
    el2.className = 'char-row' + (count > 450 ? (count > 490 ? ' danger' : ' warn') : '');
  }

  function submitPitch(projectId) {
    const text = document.getElementById('pitch-text')?.value.trim();
    if (!text) { showToast('Escreva algo no seu pitch.', 'error'); return; }
    if (text.length > 500) { showToast('Pitch excede 500 caracteres.', 'error'); return; }
    const me = Session.get();
    if (!me) { Auth.openAuth(); return; }
    Pitches.create({ projectId, applicantId: me.id, text });
    showToast('Pitch enviado! Aguarde a resposta do fundador.', 'success');
    renderDetail(projectId);
  }

  function changeStatus(projectId, status) {
    Projects.update(projectId, { status });
    showToast('Status atualizado!', 'success');
    renderDetail(projectId);
  }

  return { init, renderFeed, renderDetail, setFilter, updateCharCount, submitPitch, changeStatus };
})();
