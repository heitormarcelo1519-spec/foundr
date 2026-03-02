// =============================================
// FOUNDR v2 - Authentication Module
// =============================================

const Auth = (() => {
    let regData = {};
    let step = 1;
    const TOTAL_STEPS = 4;

    function init() {
        // Navbar buttons
        document.getElementById('btn-open-login')?.addEventListener('click', () => openAuth('login'));
        document.getElementById('btn-open-register')?.addEventListener('click', () => openAuth('register'));
        document.getElementById('hero-cta-register')?.addEventListener('click', () => openAuth('register'));

        // Modal close
        document.getElementById('auth-modal-close')?.addEventListener('click', close);
        document.getElementById('auth-overlay')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) close();
        });

        // Tabs
        document.querySelectorAll('.auth-tab').forEach(t =>
            t.addEventListener('click', () => switchMode(t.dataset.mode))
        );

        // Login
        document.getElementById('btn-login-submit')?.addEventListener('click', handleLogin);
        document.getElementById('login-email')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleLogin(); });
        document.getElementById('login-name')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleLogin(); });

        // Register steps
        document.getElementById('btn-reg-step1')?.addEventListener('click', handleStep1);
        document.getElementById('btn-reg-step2')?.addEventListener('click', handleStep2);
        document.getElementById('btn-reg-step3')?.addEventListener('click', handleStep3);
        document.getElementById('btn-reg-step4')?.addEventListener('click', handleStep4);

        // Photo upload
        document.getElementById('reg-photo-input')?.addEventListener('change', handlePhotoUpload);

        // Purpose cards
        document.querySelectorAll('.purpose-card').forEach(c =>
            c.addEventListener('click', () => selectPurpose(c.dataset.purpose))
        );
    }

    function openAuth(mode = 'login') {
        const overlay = document.getElementById('auth-overlay');
        if (!overlay) return;
        overlay.classList.add('open');
        switchMode(mode);
    }

    function close() {
        const overlay = document.getElementById('auth-overlay');
        if (!overlay) return;
        overlay.classList.remove('open');
        reset();
    }

    function switchMode(mode) {
        document.querySelectorAll('.auth-tab').forEach(t =>
            t.classList.toggle('active', t.dataset.mode === mode)
        );
        const loginEl = document.getElementById('login-form');
        const regEl = document.getElementById('register-wizard');
        if (loginEl) loginEl.classList.toggle('hidden', mode !== 'login');
        if (regEl) regEl.classList.toggle('hidden', mode !== 'register');
        if (mode === 'register') showStep(1);
    }

    function showStep(n) {
        step = n;
        for (let i = 1; i <= TOTAL_STEPS; i++) {
            document.getElementById(`reg-step-${i}`)?.classList.toggle('hidden', i !== n);
            const dot = document.getElementById(`wizard-dot-${i}`);
            if (dot) dot.className = 'wz-step' + (i < n ? ' done' : i === n ? ' active' : '');
        }
    }

    // ---- LOGIN ----
    function handleLogin() {
        const email = document.getElementById('login-email')?.value.trim().toLowerCase();
        const name = document.getElementById('login-name')?.value.trim();
        if (!email || !name) { showToast('Preencha todos os campos.', 'error'); return; }
        const user = Users.findByEmail(email);
        if (!user) { showToast('Conta não encontrada.', 'error'); return; }
        if (user.name.toLowerCase() !== name.toLowerCase()) { showToast('Nome incorreto.', 'error'); return; }
        Session.set(user.id);
        close();
        App.onAuthChange();
        showToast(`Bem-vindo de volta, ${user.name}!`, 'success');
    }

    // ---- REGISTER ----
    function handlePhotoUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 3 * 1024 * 1024) { showToast('Foto deve ter no máximo 3MB.', 'error'); return; }
        const reader = new FileReader();
        reader.onload = (ev) => {
            regData.photoURL = ev.target.result;
            const img = document.getElementById('reg-photo-img');
            const av = document.getElementById('reg-avatar-preview');
            if (img) { img.src = ev.target.result; img.style.display = 'block'; }
            if (av) { av.style.display = 'none'; }
        };
        reader.readAsDataURL(file);
    }

    function handleStep1() {
        const name = document.getElementById('reg-name')?.value.trim();
        const surname = document.getElementById('reg-surname')?.value.trim();
        const bio = document.getElementById('reg-bio')?.value.trim();
        if (!name || !surname || !bio) { showToast('Preencha todos os campos obrigatórios.', 'error'); return; }
        regData = { ...regData, name, surname, bio };
        // Update avatar preview with initials
        const av = document.getElementById('reg-avatar-preview');
        if (av && !regData.photoURL) av.textContent = (name[0] + surname[0]).toUpperCase();
        showStep(2);
    }

    function selectCat(cat) {
        regData.category = cat;
        document.querySelectorAll('.cat-card').forEach(c =>
            c.classList.toggle('selected', c.dataset.cat === cat)
        );
        const tax = TAXONOMY[cat];
        if (!tax) return;
        document.getElementById('reg-tags-cloud').innerHTML = tax.tags.map(tag =>
            `<span class="tag-tog" data-tag="${tag}" onclick="Auth.toggleTag(this)">${tag}</span>`
        ).join('');
        document.getElementById('reg-tags-section').classList.remove('hidden');
        regData.tags = [];
    }

    function toggleTag(el) {
        el.classList.toggle('selected');
        const tag = el.dataset.tag;
        if (!regData.tags) regData.tags = [];
        if (regData.tags.includes(tag)) regData.tags = regData.tags.filter(t => t !== tag);
        else regData.tags.push(tag);
    }

    function handleStep2() {
        if (!regData.category) { showToast('Selecione uma categoria.', 'error'); return; }
        if (!regData.tags?.length) { showToast('Selecione pelo menos uma tag.', 'error'); return; }
        showStep(3);
    }

    function handleStep3() {
        const email = document.getElementById('reg-email')?.value.trim().toLowerCase();
        if (!email || !email.includes('@')) { showToast('Informe um e-mail válido.', 'error'); return; }
        if (Users.findByEmail(email)) { showToast('E-mail já cadastrado. Faça login.', 'error'); return; }
        regData.email = email;
        showStep(4);
    }

    function selectPurpose(p) {
        regData.purpose = p;
        document.querySelectorAll('.purpose-card').forEach(c =>
            c.classList.toggle('selected', c.dataset.purpose === p)
        );
    }

    function handleStep4() {
        if (!regData.purpose) { showToast('Selecione seu objetivo.', 'error'); return; }
        const user = Users.create({ ...regData });
        Session.set(user.id);
        close();
        App.onAuthChange();
        showToast(`Conta criada! Bem-vindo ao Foundr, ${user.name}!`, 'success');
    }

    function reset() {
        regData = {}; step = 1;
        const ids = ['login-email', 'login-name', 'reg-name', 'reg-surname', 'reg-bio', 'reg-email'];
        ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
        document.getElementById('reg-tags-section')?.classList.add('hidden');
        document.getElementById('reg-photo-img') && (document.getElementById('reg-photo-img').style.display = 'none');
        document.getElementById('reg-avatar-preview') && (document.getElementById('reg-avatar-preview').style.display = 'flex');
        document.querySelectorAll('.cat-card, .purpose-card').forEach(c => c.classList.remove('selected'));
        document.querySelectorAll('.tag-tog').forEach(t => t.classList.remove('selected'));
        if (document.getElementById('reg-photo-input')) document.getElementById('reg-photo-input').value = '';
    }

    return { init, openAuth, close, toggleTag, selectCat };
})();
