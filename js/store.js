/* ============================================================
   MDR — camada de dados ligada ao Firebase (Firestore + Auth)
   Os dados ficam guardados na nuvem e sincronizados entre
   qualquer dispositivo. Requer js/firebase-config.js preenchido.
   ============================================================ */

const MDR = (() => {
  const COMPLAINTS = 'complaints';
  // Colecção "espelho" com apenas dados não-pessoais (estado, província,
  // componente, datas) — permite estatísticas públicas sem expor nomes,
  // contactos, assuntos ou descrições de ninguém.
  const COMPLAINTS_PUBLIC = 'complaints_public';

  // ---------- Localização ----------
  // Restrita às 3 províncias abrangidas pelo Programa PREDIN / Projecto
  // "Jobs, Social Cohesion and Community Resilience in Northern Mozambique"
  // (Banco Mundial, P514199) — Cabo Delgado, Nampula e Niassa.
  // Fonte: Instituto Nacional de Estatística de Moçambique — Codificador da
  // Divisão Político-Administrativa. Estrutura: província → distrito → postos
  // administrativos. Dois distritos mais recentes (Larde e Liúpo, em Nampula)
  // foram criados a partir de postos de distritos vizinhos e ainda não têm
  // subdivisão própria amplamente documentada, por isso aparecem apenas com
  // a sede.
  const LOCATIONS = {
    'Cabo Delgado': {
      'Ancuabe': ['Ancuabe (sede)', 'Metoro', 'Meza'],
      'Balama': ['Balama (sede)', 'Impiri', 'Kwekwe', 'Mavala'],
      'Chiúre': ['Chiúre (sede)', 'Chiúre Velho', 'Katapua', 'Mazeze', 'Namogelia', 'Ocua'],
      'Ibo': ['Ibo (sede)', 'Quirimba'],
      'Macomia': ['Macomia (sede)', 'Chai', 'Mucojo', 'Quiterajo'],
      'Mecúfi': ['Mecúfi (sede)', 'Murrebue'],
      'Meluco': ['Meluco (sede)', 'Muaguide'],
      'Metuge': ['Metuge (sede)', 'Mieze'],
      'Mocímboa da Praia': ['Mocímboa da Praia (sede)', 'Diaca', 'Mbau'],
      'Montepuez': ['Cidade de Montepuez', 'Mapupulo', 'Mirate', 'Nairoto', 'Namanhumbir'],
      'Mueda': ['Mueda (sede)', 'Chapa', 'Imbuho', 'Negomano', "N'Gapa"],
      'Muidumbe': ['Muidumbe (sede)', 'Chitunda', 'Miteda'],
      'Namuno': ['Namuno (sede)', 'Hucula', 'Machoca', 'Meloco', 'Ncumpe', 'Luli'],
      'Nangade': ['Nangade (sede)', 'Ntamba'],
      'Palma': ['Palma (sede)', 'Olumbe', 'Pundanhar', 'Quionga'],
      'Pemba (cidade)': ['Sede'],
      'Quissanga': ['Quissanga (sede)', 'Bilibiza', 'Mahate'],
    },
    'Nampula': {
      'Angoche': ['Cidade de Angoche', 'Aube', 'Namaponda', 'Boila-Nametoria'],
      'Eráti': ['Namapa (sede)', 'Alua', 'Namiroa'],
      'Ilha de Moçambique': ['Cidade Ilha de Moçambique', 'Lumbo'],
      'Lalaua': ['Lalaua (sede)', 'Meti'],
      'Larde': ['Larde (sede)'],
      'Liúpo': ['Liúpo (sede)'],
      'Malema': ['Malema (sede)', 'Chihulo', 'Mutuali'],
      'Meconta': ['Meconta (sede)', 'Corrane', 'Namialo', '7 de Abril'],
      'Mecubúri': ['Mecubúri (sede)', 'Milhana', 'Muite', 'Namina'],
      'Memba': ['Memba (sede)', 'Chipene', 'Lurio', 'Mazua'],
      'Mogincual': ['Mongicual (sede)', 'Quinga', 'Chunga', 'Quixaxe'],
      'Mogovolas': ['Nametil (sede)', 'Calipo', 'Ilute', 'Muatua', 'Nanhupo'],
      'Moma': ['Macone (sede)', 'Chalaua', 'Mucuali'],
      'Monapo': ['Monapo (sede)', 'Itoculo', 'Netia'],
      'Mossuril': ['Mossuril (sede)', 'Lunga', 'Matibane'],
      'Muecate': ['Muecate (sede)', 'Imala', 'Muculuone'],
      'Murrupula': ['Murrupula (sede)', 'Chinga', 'Nehessine'],
      'Nacala-a-Velha': ['Nacala-a-Velha (sede)', 'Covo'],
      'Nacala Porto': ['Urbano Maiaia', 'Urbano Mutiva', 'Urbano Muanona'],
      'Nacarôa': ['Nacarôa (sede)', 'Intete', 'Saua-Saua'],
      'Nampula (cidade)': ['Urbano Central', 'Muatala', 'Muhala', 'Namikopo', 'Napipine', 'Natikire'],
      'Rapale': ['Rapale (sede)', 'Anchilo', 'Mutivaze', 'Namaita'],
      'Ribaué': ['Ribaué (sede)', 'Kunle', 'Iapala'],
    },
    'Niassa': {
      'Chimbonila': ['Chimbonila (sede)', 'Lione', 'Meponda'],
      'Cuamba': ['Cidade de Cuamba', 'Etatara', 'Lurio'],
      'Lago': ['Metangula (sede)', 'Cobue', 'Lunho', 'Maniamba'],
      'Lichinga (cidade)': ['Sede'],
      'Majune': ['Majune (sede)', 'Muaquia', 'Nairrubi'],
      'Mandimba': ['Mandimba (sede)', 'Mitande'],
      'Marrupa': ['Marrupa (sede)', 'Marangira', 'Nungo'],
      'Maúa': ['Maúa (sede)', 'Maiaca'],
      'Mavago': ['Mavago (sede)', "M'Sawize"],
      'Mecanhelas': ['Mecanhelas (sede)', 'Chiuta'],
      'Mecula': ['Mecula (sede)', 'Matondovela'],
      'Metarica': ['Metarica (sede)', 'Mucumua'],
      'Muembe': ['Muembe (sede)', 'Chiconono'],
      'Ngauma': ['Massangulo (sede)', 'Itepela'],
      'Nipepe': ['Nipepe (sede)', 'Muipite'],
      'Sanga': ['Sanga (sede)', 'Lussimbeze', 'Macaloge', 'Matchedje'],
    },
  };

  // Componentes do Projecto "Jobs, Social Cohesion and Community Resilience
  // in Northern Mozambique - Phase I" (P514199), a usar em vez de nomes de
  // projectos genéricos, para que cada reclamação seja associada à
  // componente do projecto a que diz respeito.
  const PROJECTS = [
    'Componente 1 — Fortalecimento da Colaboração entre Comunidades e Governo',
    'Componente 2 — Melhoria do Acesso a Oportunidades Económicas e Emprego',
    'Componente 3 — Melhoria do Acesso a Infraestrutura Resiliente ao Clima',
    'Componente 4 — Gestão do Projecto, Coordenação e Agenda de Aprendizagem',
    'Componente 5 — Resposta de Emergência Contingente (CERC)',
    'Outro / Não relacionado a uma componente específica',
  ];

  // Tipos de preocupação que a pessoa pode seleccionar ao submeter.
  const CONCERN_TYPES = {
    sugestao: 'Sugestão',
    pedido_informacao: 'Pedido de informação',
    elogio: 'Elogio',
    reclamacao: 'Reclamação',
    vbg_psea: 'VBG / PSEA (Violência Baseada no Género / Exploração e Abuso Sexual)',
  };

  // Fluxo de estados de um caso:
  // recebida → registada (equipa provincial regista) → o administrador
  // aprova como procedente ou não procedente → a equipa provincial dá
  // seguimento (em_resolucao → resolvida) → só o administrador encerra.
  const STATUS_LABELS = {
    recebida: 'Recebida',
    registada: 'Registada',
    procedente: 'Aprovada (Procedente)',
    nao_procedente: 'Não Procedente',
    em_resolucao: 'Em resolução',
    resolvida: 'Resolvida — aguarda encerramento',
    encerrada: 'Encerrada',
  };
  const STATUS_ORDER = ['recebida', 'registada', 'procedente', 'nao_procedente', 'em_resolucao', 'resolvida', 'encerrada'];

  // Que estados cada nível de acesso pode atribuir a um caso.
  // "admin" pode atribuir qualquer um destes; os outros níveis estão
  // limitados à lista abaixo (aplicado também nas regras do Firestore).
  const PROVINCIAL_ALLOWED_STATUSES = ['registada', 'em_resolucao', 'resolvida'];

  // ---------- Utilitários ----------
  function genReferenceCode() {
    const year = new Date().getFullYear();
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let random = '';
    for (let i = 0; i < 6; i++) random += chars[Math.floor(Math.random() * chars.length)];
    return `MDR-${year}-${random}`;
  }
  function genPin() {
    return String(Math.floor(1000 + Math.random() * 9000));
  }
  function nowIso() {
    return new Date().toISOString();
  }

  // ---------- Localização / Projectos ----------
  function getProvinces() {
    return Object.keys(LOCATIONS).sort((a, b) => a.localeCompare(b, 'pt'));
  }
  function getDistricts(province) {
    return Object.keys(LOCATIONS[province] || {}).sort((a, b) => a.localeCompare(b, 'pt'));
  }
  function getPostos(province, district) {
    return ((LOCATIONS[province] || {})[district] || []).slice();
  }
  function getProjects() {
    return PROJECTS.slice();
  }
  function getConcernTypes() {
    return CONCERN_TYPES;
  }

  // ---------- Anexos ----------
  // Guardados como base64 directamente no documento Firestore (limite de
  // 1MiB por documento) — por isso os limites são propositadamente baixos.
  // Para volumes maiores de anexos, considere migrar para Firebase Storage.
  const MAX_FILES = 2;
  const MAX_FILE_BYTES = 250 * 1024; // ~250KB por ficheiro

  function filesToAttachments(fileList) {
    const files = Array.from(fileList || []).slice(0, MAX_FILES);
    const tooBig = files.filter(f => f.size > MAX_FILE_BYTES);
    const usable = files.filter(f => f.size <= MAX_FILE_BYTES);

    const readers = usable.map(file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ name: file.name, type: file.type, size: file.size, dataUrl: reader.result });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }));

    return Promise.all(readers).then(attachments => ({
      attachments,
      skipped: tooBig.map(f => f.name),
    }));
  }

  // ---------- Reclamações (público) ----------
  async function submitComplaint(payload, fileList) {
    const { attachments, skipped } = await filesToAttachments(fileList);

    let reference_code;
    let exists = true;
    let attempts = 0;
    do {
      reference_code = genReferenceCode();
      const snap = await db.collection(COMPLAINTS).doc(reference_code).get();
      exists = snap.exists;
      attempts += 1;
    } while (exists && attempts < 5);

    const access_pin = genPin();
    const timestamp = nowIso();

    const record = {
      reference_code,
      access_pin,
      concern_type: payload.concern_type || null,
      project: payload.project || null,
      occurrence_date: payload.occurrence_date || null,
      province: payload.province || null,
      district: payload.district || null,
      posto_administrativo: payload.posto_administrativo || null,
      community: payload.community,
      is_anonymous: !!payload.is_anonymous,
      contact_name: payload.is_anonymous ? null : (payload.contact_name || null),
      contact_phone: payload.is_anonymous ? null : (payload.contact_phone || null),
      contact_email: payload.is_anonymous ? null : (payload.contact_email || null),
      subject: payload.subject,
      description: payload.description || null,
      attachments,
      status: 'recebida',
      priority: 'normal',
      assigned_to: null,
      created_at: timestamp,
      updated_at: timestamp,
      updates: [
        { status: 'recebida', note: 'Preocupação recebida e registada no sistema.', visible_to_public: true, admin_name: null, created_at: timestamp },
      ],
    };

    await db.collection(COMPLAINTS).doc(reference_code).set(record);

    // Espelho público, sem dados pessoais, para alimentar as estatísticas
    // públicas sem expor nomes, contactos, assuntos ou descrições.
    await db.collection(COMPLAINTS_PUBLIC).doc(reference_code).set({
      reference_code,
      status: record.status,
      province: record.province,
      project: record.project,
      created_at: record.created_at,
      updated_at: record.updated_at,
    });

    return { reference_code, access_pin, skipped };
  }

  async function trackComplaint(referenceCode, pin) {
    const code = (referenceCode || '').trim().toUpperCase();
    const snap = await db.collection(COMPLAINTS).doc(code).get();
    if (!snap.exists) return null;
    const record = snap.data();
    if (record.access_pin !== (pin || '').trim()) return null;

    return {
      reference_code: record.reference_code,
      subject: record.subject,
      status: record.status,
      concern_type: record.concern_type,
      project: record.project,
      province: record.province,
      district: record.district,
      community: record.community,
      created_at: record.created_at,
      updated_at: record.updated_at,
      updates: (record.updates || []).filter(u => u.visible_to_public),
    };
  }

  // ---------- Reclamações (admin — requer sessão autenticada) ----------
  async function listComplaints(filters = {}) {
    let query = db.collection(COMPLAINTS);
    if (filters.status) query = query.where('status', '==', filters.status);
    if (filters.province) query = query.where('province', '==', filters.province);
    if (filters.project) query = query.where('project', '==', filters.project);

    const snap = await query.get();
    let rows = snap.docs.map(d => d.data());

    if (filters.q) {
      const q = filters.q.toLowerCase();
      rows = rows.filter(c =>
        c.subject.toLowerCase().includes(q) ||
        c.reference_code.toLowerCase().includes(q) ||
        (c.community || '').toLowerCase().includes(q) ||
        (c.contact_name || '').toLowerCase().includes(q) ||
        (c.contact_phone || '').toLowerCase().includes(q)
      );
    }

    return rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  async function getComplaint(referenceCode) {
    const snap = await db.collection(COMPLAINTS).doc(referenceCode).get();
    return snap.exists ? snap.data() : null;
  }

  async function updateComplaint(referenceCode, { status, priority, note, visible_to_public }) {
    const admin = getCurrentAdminSync();
    if (!admin || admin.noProfile) throw new Error('A tua conta não tem permissões configuradas. Contacta o administrador.');
    if (admin.role === 'readonly') throw new Error('A tua conta tem acesso apenas de leitura — não podes actualizar casos.');

    const ref = db.collection(COMPLAINTS).doc(referenceCode);
    const snap = await ref.get();
    if (!snap.exists) throw new Error('Caso não encontrado.');
    const record = snap.data();

    if (admin.role === 'provincial' && record.province !== admin.province) {
      throw new Error(`Só podes actualizar casos da tua província (${admin.province}).`);
    }

    if (status && status !== record.status && admin.role === 'provincial' && !PROVINCIAL_ALLOWED_STATUSES.includes(status)) {
      throw new Error('Só o administrador geral pode aprovar (procedente/não procedente) ou encerrar um caso. Tu podes registar, dar seguimento e marcar como resolvido.');
    }

    const updated = { ...record };
    if (status) updated.status = status;
    if (priority) updated.priority = priority;
    updated.updated_at = nowIso();

    if (note || status) {
      updated.updates = [...(record.updates || []), {
        status: status || record.status,
        note: note || null,
        visible_to_public: visible_to_public !== false,
        admin_name: admin ? admin.name : null,
        created_at: nowIso(),
      }];
    }

    await ref.set(updated);

    if (status) {
      await db.collection(COMPLAINTS_PUBLIC).doc(referenceCode).set(
        { status: updated.status, updated_at: updated.updated_at },
        { merge: true }
      );
    }

    return updated;
  }

  // ---------- Estatísticas públicas ----------
  // Lê exclusivamente a colecção "complaints_public" (sem dados pessoais),
  // que é de leitura pública segundo as regras do Firestore fornecidas.
  async function getPublicStats() {
    const snap = await db.collection(COMPLAINTS_PUBLIC).get();
    const complaints = snap.docs.map(d => d.data());

    const total = complaints.length;
    const resolvedCount = complaints.filter(c => c.status === 'resolvida' || c.status === 'encerrada').length;

    const byStatus = STATUS_ORDER
      .map(status => ({ status, n: complaints.filter(c => c.status === status).length }))
      .filter(s => s.n > 0);

    const byProvince = {};
    complaints.forEach(c => { if (c.province) byProvince[c.province] = (byProvince[c.province] || 0) + 1; });

    const byProject = {};
    complaints.forEach(c => { if (c.project) byProject[c.project] = (byProject[c.project] || 0) + 1; });

    const byMonth = {};
    complaints.forEach(c => {
      const month = (c.created_at || '').slice(0, 7);
      if (month) byMonth[month] = (byMonth[month] || 0) + 1;
    });

    const resolutionDays = complaints
      .filter(c => c.status === 'resolvida' || c.status === 'encerrada')
      .map(c => (new Date(c.updated_at) - new Date(c.created_at)) / (1000 * 60 * 60 * 24));
    const avgResolutionDays = resolutionDays.length
      ? Math.round((resolutionDays.reduce((a, b) => a + b, 0) / resolutionDays.length) * 10) / 10
      : null;

    return {
      total,
      resolved_count: resolvedCount,
      resolution_rate: total ? Math.round((resolvedCount / total) * 100) : 0,
      avg_resolution_days: avgResolutionDays,
      by_status: byStatus,
      by_province: Object.entries(byProvince).map(([province, n]) => ({ province, n })).sort((a, b) => b.n - a.n),
      by_project: Object.entries(byProject).map(([project, n]) => ({ project, n })).sort((a, b) => b.n - a.n),
      by_month: Object.entries(byMonth).map(([month, n]) => ({ month, n })).sort((a, b) => a.month.localeCompare(b.month)),
    };
  }

  // ---------- Autenticação administrativa (Firebase Auth + perfis/roles) ----------
  const ADMINS = 'admins';
  let cachedProfile = null; // { uid, email, name, role, province }

  async function loadProfile(user) {
    if (!user) { cachedProfile = null; return null; }
    const snap = await db.collection(ADMINS).doc(user.uid).get();
    if (!snap.exists) {
      // Conta autenticada no Firebase, mas sem perfil/permissões configuradas
      // na colecção "admins" — não tem acesso a nada dentro do painel.
      cachedProfile = { uid: user.uid, email: user.email, name: user.email.split('@')[0], role: null, province: null, noProfile: true };
      return cachedProfile;
    }
    const data = snap.data();
    cachedProfile = {
      uid: user.uid,
      email: user.email,
      name: data.name || user.email.split('@')[0],
      role: data.role,       // 'admin' | 'provincial' | 'readonly'
      province: data.province || null,
      noProfile: false,
    };
    return cachedProfile;
  }

  async function adminLogin(email, password) {
    const cred = await auth.signInWithEmailAndPassword(email, password);
    return loadProfile(cred.user);
  }

  function adminLogout() {
    cachedProfile = null;
    return auth.signOut();
  }

  function getCurrentAdminSync() {
    return cachedProfile;
  }

  // Subscreve mudanças de sessão (login/logout/expiração de token). O
  // callback recebe o perfil completo (com role e província) já carregado,
  // ou null se tiver sido feito logout.
  function onAuthChange(callback) {
    return auth.onAuthStateChanged(async user => {
      const profile = await loadProfile(user);
      callback(profile);
    });
  }

  async function changeAdminPassword(currentPassword, newPassword) {
    const user = auth.currentUser;
    if (!user) throw new Error('Sessão inválida.');
    const cred = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
    await user.reauthenticateWithCredential(cred);
    await user.updatePassword(newPassword);
  }

  // ---------- Gestão de utilizadores (só para role "admin") ----------
  // Nota: criar/eliminar a CONTA de login (email/password) continua a fazer-se
  // no Firebase Console → Authentication → Users, porque isso requer
  // privilégios que só existem no lado do servidor. Estas funções gerem o
  // NÍVEL DE ACESSO (perfil em Firestore) associado a uma conta já criada.
  async function listAdminUsers() {
    const snap = await db.collection(ADMINS).get();
    return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
  }

  async function upsertAdminUser(uid, { name, role, province, email }) {
    if (!uid || !uid.trim()) throw new Error('Indique o User UID (Firebase Console → Authentication → Users).');
    if (!['admin', 'provincial', 'readonly'].includes(role)) throw new Error('Nível de acesso inválido.');
    if (role === 'provincial' && !province) throw new Error('Indique a província para o nível "Gestor provincial".');
    await db.collection(ADMINS).doc(uid.trim()).set({
      name: name || null,
      email: email || null,
      role,
      province: role === 'provincial' ? province : null,
      updated_at: nowIso(),
    }, { merge: true });
  }

  async function removeAdminUser(uid) {
    await db.collection(ADMINS).doc(uid).delete();
  }

  return {
    STATUS_LABELS, STATUS_ORDER, PROVINCIAL_ALLOWED_STATUSES,
    getProvinces, getDistricts, getPostos, getProjects, getConcernTypes,
    submitComplaint, trackComplaint,
    listComplaints, getComplaint, updateComplaint,
    getPublicStats,
    adminLogin, adminLogout, onAuthChange, getCurrentAdminSync, changeAdminPassword,
    listAdminUsers, upsertAdminUser, removeAdminUser,
  };
})();
