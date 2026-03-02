// =============================================
// FOUNDR - Data Layer (localStorage)
// =============================================

const DB_KEYS = {
  USERS: 'foundr_users',
  PROJECTS: 'foundr_projects',
  PITCHES: 'foundr_pitches',
  CHATS: 'foundr_chats',
  CURRENT_USER: 'foundr_current_user',
};

// ---- Category / Tag taxonomy ----
const TAXONOMY = {
  tech: {
    label: 'Tecnologia',
    icon: '💻',
    tags: ['Desenvolvedor Full-stack', 'Desenvolvedor Mobile', 'Engenheiro de IA', 'DevOps / Cloud', 'Data Scientist', 'QA / Tester', 'Engenheiro de Software', 'Arquiteto de Sistemas']
  },
  design: {
    label: 'Design & Produto',
    icon: '🎨',
    tags: ['UI/UX Designer', 'Product Manager', 'Motion Designer', 'Pesquisador de UX', 'Branding / Identidade Visual', 'Designer Gráfico']
  },
  business: {
    label: 'Negócios & Vendas',
    icon: '📈',
    tags: ['Growth Hacker', 'Especialista em Vendas', 'Gestor de Tráfego', 'Empreendedor Serial', 'Analista de Marketing', 'Especialista em SDR', 'Consultor de Negócios']
  },
  ops: {
    label: 'Operações',
    icon: '⚙️',
    tags: ['COO', 'Gestor Financeiro', 'Analista de Processos', 'Suporte Operacional', 'Scrum Master', 'Gestor de Projetos']
  }
};

// ---- Lifecycle statuses ----
const PROJECT_STATUS = {
  seeking: { label: 'Em busca de sócio', color: '#6c63ff', dot: '#6c63ff' },
  developing: { label: 'Em desenvolvimento', color: '#f59e0b', dot: '#f59e0b' },
  finished: { label: 'Finalizado', color: '#22c55e', dot: '#22c55e' },
};

// ---- Generic DB helpers ----
const DB = {
  get: (key) => JSON.parse(localStorage.getItem(key) || 'null'),
  set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
  getList: (key) => JSON.parse(localStorage.getItem(key) || '[]'),
  setList: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
};

// ---- User helpers ----
const Users = {
  all: () => DB.getList(DB_KEYS.USERS),
  find: (id) => Users.all().find(u => u.id === id),
  findByEmail: (email) => Users.all().find(u => u.email === email.toLowerCase()),
  create: (data) => {
    const users = Users.all();
    const user = { id: crypto.randomUUID(), createdAt: Date.now(), ...data };
    users.push(user);
    DB.setList(DB_KEYS.USERS, users);
    return user;
  },
  updatePhoto: (id, photoURL) => {
    const users = Users.all();
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) { users[idx].photoURL = photoURL; DB.setList(DB_KEYS.USERS, users); }
  },
  update: (id, changes) => {
    const users = Users.all();
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) { users[idx] = { ...users[idx], ...changes }; DB.setList(DB_KEYS.USERS, users); }
  },
};


// ---- Session helpers ----
const Session = {
  get: () => {
    const uid = DB.get(DB_KEYS.CURRENT_USER);
    return uid ? Users.find(uid) : null;
  },
  set: (userId) => DB.set(DB_KEYS.CURRENT_USER, userId),
  clear: () => localStorage.removeItem(DB_KEYS.CURRENT_USER),
};

// ---- Project helpers ----
const Projects = {
  all: () => DB.getList(DB_KEYS.PROJECTS),
  find: (id) => Projects.all().find(p => p.id === id),
  byOwner: (ownerId) => Projects.all().filter(p => p.ownerId === ownerId),
  activeByOwner: (ownerId) => Projects.byOwner(ownerId).filter(p => p.status === 'seeking' || p.status === 'developing'),
  create: (data) => {
    const projects = Projects.all();
    const project = { id: crypto.randomUUID(), createdAt: Date.now(), ...data };
    projects.unshift(project);
    DB.setList(DB_KEYS.PROJECTS, projects);
    return project;
  },
  update: (id, changes) => {
    const projects = Projects.all();
    const idx = projects.findIndex(p => p.id === id);
    if (idx !== -1) { projects[idx] = { ...projects[idx], ...changes }; DB.setList(DB_KEYS.PROJECTS, projects); }
  },
  delete: (id) => DB.setList(DB_KEYS.PROJECTS, Projects.all().filter(p => p.id !== id)),
};

// ---- Pitch helpers ----
const Pitches = {
  all: () => DB.getList(DB_KEYS.PITCHES),
  find: (id) => Pitches.all().find(p => p.id === id),
  byProject: (projectId) => Pitches.all().filter(p => p.projectId === projectId),
  pending: (projectId) => Pitches.byProject(projectId).filter(p => p.status === 'pending'),
  byApplicant: (uid) => Pitches.all().filter(p => p.applicantId === uid),
  existsFrom: (projectId, applicantId) => Pitches.all().some(p => p.projectId === projectId && p.applicantId === applicantId && p.status !== 'rejected'),
  create: (data) => {
    const list = Pitches.all();
    const pitch = { id: crypto.randomUUID(), createdAt: Date.now(), status: 'pending', ...data };
    list.push(pitch);
    DB.setList(DB_KEYS.PITCHES, list);
    return pitch;
  },
  update: (id, changes) => {
    const list = Pitches.all();
    const idx = list.findIndex(p => p.id === id);
    if (idx !== -1) { list[idx] = { ...list[idx], ...changes }; DB.setList(DB_KEYS.PITCHES, list); }
  },
};

// ---- Chat helpers ----
const Chats = {
  all: () => DB.getList(DB_KEYS.CHATS),
  find: (id) => Chats.all().find(c => c.id === id),
  byProject: (projectId) => Chats.all().find(c => c.projectId === projectId),
  forUser: (uid) => Chats.all().filter(c => c.members.includes(uid)),
  create: (data) => {
    const list = Chats.all();
    const chat = { id: crypto.randomUUID(), createdAt: Date.now(), messages: [], ...data };
    list.push(chat);
    DB.setList(DB_KEYS.CHATS, list);
    return chat;
  },
  addMessage: (chatId, message) => {
    const list = Chats.all();
    const idx = list.findIndex(c => c.id === chatId);
    if (idx !== -1) {
      list[idx].messages.push({ id: crypto.randomUUID(), createdAt: Date.now(), ...message });
      DB.setList(DB_KEYS.CHATS, list);
    }
  },
};

// ---- Seed mock data ----
function seedData() {
  if (Projects.all().length > 0) return; // already seeded

  // Create some fake users
  const u1 = Users.create({ name: 'Lucas', surname: 'Ferreira', bio: 'Empreendedor apaixonado por EdTech. Fundador de 2 startups na área de educação.', category: 'business', tags: ['Empreendedor Serial'], purpose: 'offer', email: 'lucas@demo.com' });
  const u2 = Users.create({ name: 'Ana', surname: 'Souza', bio: 'Designer com 6 anos de experiência em produtos digitais, focada em UX de alta conversão.', category: 'design', tags: ['UI/UX Designer'], purpose: 'find', email: 'ana@demo.com' });
  const u3 = Users.create({ name: 'Rodrigo', surname: 'Lima', bio: 'Full-stack developer. Apaixonado por IA e automação. Stack: Node, React, Python.', category: 'tech', tags: ['Desenvolvedor Full-stack', 'Engenheiro de IA'], purpose: 'find', email: 'rodrigo@demo.com' });
  const u4 = Users.create({ name: 'Carla', surname: 'Mendes', bio: 'Growth hacker com histórico de escalonar produtos 0 to 1 em menos de 6 meses.', category: 'business', tags: ['Growth Hacker', 'Gestor de Tráfego'], purpose: 'offer', email: 'carla@demo.com' });
  const u5 = Users.create({ name: 'Felipe', surname: 'Costa', bio: 'Especialista em operações e processos. COO em série. Apaixonado por eficiência.', category: 'ops', tags: ['COO', 'Gestor de Projetos'], purpose: 'offer', email: 'felipe@demo.com' });

  // Create projects
  Projects.create({ ownerId: u1.id, title: 'EduFlow – Plataforma de Cursos com IA Adaptativa', summary: 'Uma plataforma de ensino que usa IA para personalizar o conteúdo e o ritmo de aprendizado para cada aluno, tornando a educação realmente individual.', stage: 'Ideação', status: 'seeking', skills: ['Desenvolvedor Full-stack', 'Engenheiro de IA', 'UI/UX Designer'], category: 'tech' });
  Projects.create({ ownerId: u4.id, title: 'LocalLoop – Marketplace de Serviços Locais', summary: 'Conectar profissionais autônomos com moradores da mesma vizinhança para serviços domésticos, com avaliação e pagamento integrados.', stage: 'MVP Pronto', status: 'developing', skills: ['Desenvolvedor Mobile', 'Especialista em Vendas', 'Gestor de Tráfego'], category: 'business' });
  Projects.create({ ownerId: u2.id, title: 'MindBridge – App de Saúde Mental para Empresas', summary: 'B2B SaaS que oferece acompanhamento psicológico e métricas de bem-estar para RH gestionar a saúde mental do time de forma proativa.', stage: 'Pesquisa', status: 'seeking', skills: ['Product Manager', 'Desenvolvedor Full-stack', 'Especialista em Vendas'], category: 'business' });
  Projects.create({ ownerId: u5.id, title: 'CargoRoute – Logística Inteligente para PMEs', summary: 'Sistema de roteirização inteligente que reduz o custo logístico de pequenas e médias empresas em até 30% usando otimização por algoritmos.', stage: 'Protótipo', status: 'seeking', skills: ['Desenvolvedor Full-stack', 'DevOps / Cloud', 'Gestor de Projetos'], category: 'tech' });
  Projects.create({ ownerId: u1.id, title: 'FoodPrint – Rastreabilidade de Alimentos na Blockchain', summary: 'Solução de rastreabilidade farm-to-table usando blockchain para garantir a procedência e qualidade de alimentos orgânicos.', stage: 'Ideação', status: 'seeking', skills: ['Engenheiro de IA', 'Desenvolvedor Full-stack', 'COO'], category: 'tech' });
  Projects.create({ ownerId: u3.id, title: 'Presently – Gestor de Relacionamentos Pessoais', summary: 'App que te ajuda a manter relacionamentos importantes nunca esquecendo aniversários, preferências e momentos especiais das pessoas que você ama.', stage: 'MVP Pronto', status: 'developing', skills: ['UI/UX Designer', 'Growth Hacker', 'Desenvolvedor Mobile'], category: 'design' });
}

// Run seed on load
seedData();
