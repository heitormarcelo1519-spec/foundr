// =============================================
// FOUNDR v2 - App Router + CreateProject + Global Helpers
// =============================================

// ---- Global helpers ----
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    const icon = type === 'success'
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    el.innerHTML = `<span class="toast-icon">${icon}</span><span>${escapeHtml(msg)}</span>`;
    container.appendChild(el);
    setTimeout(() => {
        el.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => el.remove(), 320);
    }, 3200);
}

// ---- Cover image upload ----
const CoverUpload = (() => {
    let dataURL = null;

    function init() {
        const input = document.getElementById('cover-image-input');
        const removeBtn = document.getElementById('cover-remove-btn');
        if (input) input.addEventListener('change', handleFile);
        if (removeBtn) removeBtn.addEventListener('click', remove);
    }

    function handleFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 3 * 1024 * 1024) { showToast('Imagem deve ter no máximo 3MB.', 'error'); return; }
        const reader = new FileReader();
        reader.onload = (ev) => {
            dataURL = ev.target.result;
            const preview = document.getElementById('cover-preview');
            const placeholder = document.getElementById('cover-upload-placeholder');
            const removeBtn = document.getElementById('cover-remove-btn');
            if (preview) { preview.src = dataURL; preview.style.display = 'block'; }
            if (placeholder) { placeholder.style.display = 'none'; }
            if (removeBtn) { removeBtn.classList.remove('hidden'); }
            document.getElementById('cover-upload-area')?.classList.add('has-image');
        };
        reader.readAsDataURL(file);
    }

    function remove() {
        dataURL = null;
        const preview = document.getElementById('cover-preview');
        const placeholder = document.getElementById('cover-upload-placeholder');
        const removeBtn = document.getElementById('cover-remove-btn');
        const input = document.getElementById('cover-image-input');
        if (preview) { preview.src = ''; preview.style.display = 'none'; }
        if (placeholder) { placeholder.style.display = 'flex'; }
        if (removeBtn) { removeBtn.classList.add('hidden'); }
        if (input) { input.value = ''; }
        document.getElementById('cover-upload-area')?.classList.remove('has-image');
    }

    function get() { return dataURL; }
    function reset() { remove(); }

    return { init, get, reset };
})();

// ---- Profile photo upload (sidebar) ----
const ProfilePhoto = (() => {
    function init() {
        const input = document.getElementById('sidebar-photo-input');
        if (input) input.addEventListener('change', handleFile);
    }

    function handleFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 3 * 1024 * 1024) { showToast('Foto deve ter no máximo 3MB.', 'error'); return; }
        const reader = new FileReader();
        reader.onload = (ev) => {
            const me = Session.get();
            if (!me) return;
            Users.updatePhoto(me.id, ev.target.result);
            updateSidebarAvatar(me.id);
            showToast('Foto de perfil atualizada!', 'success');
        };
        reader.readAsDataURL(file);
    }

    function updateSidebarAvatar(userId) {
        const user = Users.find(userId);
        if (!user) return;
        const wrap = document.getElementById('sidebar-avatar-wrap');
        const av = document.getElementById('sidebar-avatar');
        if (!wrap) return;
        if (user.photoURL) {
            av.innerHTML = `<img src="${user.photoURL}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        } else {
            av.textContent = `${user.name[0]}${user.surname[0]}`.toUpperCase();
        }
    }

    return { init, updateSidebarAvatar };
})();

// ---- Create Project ----
const CreateProject = (() => {
    let selectedSkills = [];

    function init() {
        document.getElementById('btn-create-submit')?.addEventListener('click', handleSubmit);
        CoverUpload.init();
    }

    function renderSkillOptions() {
        const cat = document.getElementById('cp-category')?.value;
        const container = document.getElementById('cp-skills-grid');
        if (!container) return;
        selectedSkills = [];
        if (!cat) {
            container.innerHTML = `<span style="color:var(--text-muted);font-size:13px">Selecione uma categoria primeiro</span>`;
            return;
        }
        const tags = TAXONOMY[cat]?.tags || [];
        container.innerHTML = tags.map(tag =>
            `<span class="skill-tog" data-tag="${tag}" onclick="CreateProject.toggleSkill(this)">${escapeHtml(tag)}</span>`
        ).join('');
    }

    function toggleSkill(el) {
        el.classList.toggle('selected');
        const tag = el.dataset.tag;
        if (selectedSkills.includes(tag)) selectedSkills = selectedSkills.filter(s => s !== tag);
        else selectedSkills.push(tag);
    }

    function handleSubmit() {
        const me = Session.get();
        if (!me) { Auth.openAuth(); return; }
        const title = document.getElementById('cp-title')?.value.trim();
        const summary = document.getElementById('cp-summary')?.value.trim();
        const stage = document.getElementById('cp-stage')?.value;
        const category = document.getElementById('cp-category')?.value;
        if (!title || !summary || !category) { showToast('Preencha todos os campos obrigatórios.', 'error'); return; }
        if (selectedSkills.length === 0) { showToast('Selecione pelo menos uma competência.', 'error'); return; }
        if (Projects.activeByOwner(me.id).length > 0) {
            showToast('Voce já tem um projeto ativo. Finalize-o antes de criar outro.', 'error');
            return;
        }
        const coverImage = CoverUpload.get();
        Projects.create({ ownerId: me.id, title, summary, stage, status: 'seeking', skills: selectedSkills, category, coverImage });
        showToast('Projeto publicado com sucesso!', 'success');
        document.getElementById('cp-title').value = '';
        document.getElementById('cp-summary').value = '';
        document.getElementById('cp-category').value = '';
        CoverUpload.reset();
        renderSkillOptions();
        App.navigate('feed');
        ProjectsUI.renderFeed();
    }

    return { init, toggleSkill, renderSkillOptions };
})();

// ---- Main App ----
const App = (() => {

    function init() {
        Auth.init();
        ProjectsUI.init();
        ChatUI.init();
        Dashboard.init();
        CreateProject.init();
        ProfilePhoto.init();

        document.getElementById('nav-logo')?.addEventListener('click', () => navigate('feed'));
        document.getElementById('nav-feed')?.addEventListener('click', () => navigate('feed'));
        document.getElementById('nav-dashboard')?.addEventListener('click', () => navigate('dashboard'));
        document.getElementById('nav-dashboard-btn')?.addEventListener('click', () => navigate('dashboard'));
        document.getElementById('btn-logout')?.addEventListener('click', logout);
        document.getElementById('hero-cta-explore')?.addEventListener('click', () => {
            const el = document.getElementById('projects-section');
            if (el) {
                const y = el.getBoundingClientRect().top + window.scrollY - 60;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        });
        document.getElementById('cta-bottom-register')?.addEventListener('click', () => Auth.openAuth('register'));
        document.getElementById('cta-bottom-post')?.addEventListener('click', () => {
            const me = Session.get();
            if (!me) Auth.openAuth('register'); else navigate('create-project');
        });

        renderCatShowcase();
        setupScrollReveal();
        onAuthChange();
        updateStats();
        navigate('feed');
    }

    function renderCatShowcase() {
        const grid = document.getElementById('cat-showcase-grid');
        if (!grid) return;
        grid.innerHTML = Object.entries(TAXONOMY).map(([key, cat]) => {
            const count = Projects.all().filter(p => p.category === key).length;
            const colors = { tech: '#7c6dfa', design: '#f472b6', business: '#34d399', ops: '#fbbf24' };
            return `
      <div class="cat-showcase-card" style="--cat-color:${colors[key]}" onclick="ProjectsUI.setFilter('${key}');document.getElementById('projects-section').scrollIntoView({behavior:'smooth'})">
        <div class="cat-sc-icon">${catSvg(key)}</div>
        <div class="cat-sc-name">${cat.label}</div>
        <div class="cat-sc-count">${count} projeto${count !== 1 ? 's' : ''}</div>
      </div>`;
        }).join('');
    }

    function catSvg(key) {
        const svgs = {
            tech: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
            design: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>`,
            business: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>`,
            ops: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>`,
        };
        return svgs[key] || '';
    }

    function setupScrollReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        document.querySelectorAll('.how-card, .cat-showcase-card').forEach(el => {
            el.classList.add('reveal');
            observer.observe(el);
        });
    }

    function navigate(view, param = null) {
        document.querySelectorAll('.view-section').forEach(v => v.style.display = 'none');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (view === 'feed') {
            document.getElementById('view-feed').style.display = 'block';
            ProjectsUI.renderFeed();
            renderCatShowcase();
            updateStats();
        } else if (view === 'project') {
            document.getElementById('view-project-detail').style.display = 'block';
            ProjectsUI.renderDetail(param);
        } else if (view === 'dashboard') {
            const me = Session.get();
            if (!me) { Auth.openAuth('login'); return; }
            document.getElementById('view-dashboard').style.display = 'block';
            Dashboard.render();
        } else if (view === 'create-project') {
            const me = Session.get();
            if (!me) { Auth.openAuth('login'); return; }
            document.getElementById('view-create-project').style.display = 'block';
            CreateProject.renderSkillOptions();
        }
    }

    function updateStats() {
        const ps = document.getElementById('stat-projects');
        const fs = document.getElementById('stat-founders');
        const ms = document.getElementById('stat-matches');
        if (ps) animateNum(ps, Projects.all().length);
        if (fs) animateNum(fs, Users.all().length);
        if (ms) animateNum(ms, Chats.all().length);
    }

    function animateNum(el, target) {
        const start = parseInt(el.textContent) || 0;
        const dur = 900;
        const begin = performance.now();
        const tick = (now) => {
            const t = Math.min((now - begin) / dur, 1);
            el.textContent = Math.round(start + (target - start) * easeOut(t));
            if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }
    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function onAuthChange() {
        const me = Session.get();
        const guestMenu = document.getElementById('guest-menu');
        const userMenu = document.getElementById('user-menu');
        const navDash = document.getElementById('nav-dashboard');

        // Homepage specific actions (hero)
        const heroRegBtn = document.getElementById('hero-cta-register');
        const ctaBottomRegBtn = document.getElementById('cta-bottom-register');

        if (me) {
            if (guestMenu) guestMenu.style.display = 'none';
            if (navDash) navDash.classList.remove('hidden');
            if (heroRegBtn) heroRegBtn.style.display = 'none';
            if (ctaBottomRegBtn) ctaBottomRegBtn.style.display = 'none';

            if (userMenu) {
                userMenu.style.display = 'flex';
                // user avatar sync code inside onAuthChange
                const navAv = document.getElementById('nav-avatar');
                if (navAv) {
                    if (me.photoURL) {
                        navAv.innerHTML = `<img src="${me.photoURL}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
                    } else {
                        navAv.textContent = `${me.name[0]}${me.surname[0]}`.toUpperCase();
                    }
                }
            }
        } else {
            if (guestMenu) guestMenu.style.display = 'flex';
            if (navDash) navDash.classList.add('hidden');
            if (heroRegBtn) heroRegBtn.style.display = 'inline-flex';
            if (ctaBottomRegBtn) ctaBottomRegBtn.style.display = 'inline-flex';

            if (userMenu) userMenu.style.display = 'none';
        }
    }

    function logout() {
        Session.clear();
        onAuthChange();
        navigate('feed');
        showToast('Até mais!', 'success');
    }

    return { init, navigate, onAuthChange, updateStats };
})();

document.addEventListener('DOMContentLoaded', App.init);
