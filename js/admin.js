// ═══════════════════════════════════════════
//  WorkHub — Логіка адмін-панелі
// ═══════════════════════════════════════════

let adminSession  = null;
let currentLogFilter = "all";

// ── Ініціалізація ──────────────────────────
function initAdmin(session) {
  adminSession = session;
  renderSidebarUser(session);
  renderTopbarUser(session);
  renderUsersTab();
  renderEmployeesTab();
  renderAdminNews();
  renderAdminDocs();
  renderLog();
  renderRequests();
}

// ── Вкладки ────────────────────────────────
function switchAdminTab(tab, btn) {
  document.querySelectorAll(".admin-tab").forEach(el => el.style.display = "none");
  document.querySelectorAll(".sidebar-link").forEach(b => b.classList.remove("active"));

  const tabMap = {
    users:     "adminTabUsers",
    employees: "adminTabEmployees",
    news:      "adminTabNews",
    docs:      "adminTabDocs",
    log:       "adminTabLog",
    requests:  "adminTabRequests",
  };
  const titleMap = {
    users:     "Публічні користувачі",
    employees: "Співробітники",
    news:      "Керування новинами",
    docs:      "Документи",
    log:       "Журнал доступу",
    requests:  "Заявки на роботу",
  };

  const target = document.getElementById(tabMap[tab]);
  if (target) target.style.display = "block";
  if (btn) btn.classList.add("active");

  const titleEl = document.getElementById("adminTopbarTitle");
  if (titleEl) titleEl.textContent = titleMap[tab] || "Адмін-панель";
}

// ═══════════════════════════════════════════
//  КОРИСТУВАЧІ (публічні)
// ═══════════════════════════════════════════
function renderUsersTab(filter = "") {
  const tbody = document.getElementById("usersTableBody");
  if (!tbody) return;

  const users = getUsers().filter(u =>
    (u.role === "user") &&
    (!filter || u.name.toLowerCase().includes(filter) || u.email.toLowerCase().includes(filter))
  );

  if (!users.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-muted)">Користувачів немає</td></tr>`;
    return;
  }

  tbody.innerHTML = users.map(u => `
    <tr>
      <td>
        <div class="admin-user-cell">
          <div class="auc-avatar" style="background:${u.avatarColor}">${escHtml(u.avatar)}</div>
          <div>
            <div class="auc-name">${escHtml(u.name)}</div>
          </div>
        </div>
      </td>
      <td>${escHtml(u.email)}</td>
      <td><span class="role-badge">${ROLE_LABELS[u.role]}</span></td>
      <td>${formatDate(u.createdAt)}</td>
      <td>
        <span class="status-badge ${u.blocked ? "status-blocked" : "status-active"}">
          ${u.blocked ? "🔴 Заблоковано" : "🟢 Активний"}
        </span>
      </td>
      <td>
        <div class="table-actions">
          <button class="tbl-btn tbl-btn-edit" onclick="openEditUser('${u.id}')">✏️ Редагувати</button>
          <button class="tbl-btn ${u.blocked ? "tbl-btn-unblock" : "tbl-btn-block"}"
            onclick="toggleBlockUser('${u.id}')">
            ${u.blocked ? "🔓 Розблокувати" : "🔒 Заблокувати"}
          </button>
          <button class="tbl-btn tbl-btn-delete" onclick="deleteUserConfirm('${u.id}')">🗑</button>
        </div>
      </td>
    </tr>
  `).join("");
}

// ═══════════════════════════════════════════
//  СПІВРОБІТНИКИ
// ═══════════════════════════════════════════
function renderEmployeesTab(filter = "") {
  const tbody = document.getElementById("employeesTableBody");
  if (!tbody) return;

  const users = getUsers().filter(u =>
    (u.role === "employee" || u.role === "manager" || u.role === "admin") &&
    (!filter || u.name.toLowerCase().includes(filter) || u.email.toLowerCase().includes(filter))
  );

  if (!users.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted)">Співробітників немає</td></tr>`;
    return;
  }

  tbody.innerHTML = users.map(u => {
    const dept = u.department ? getDept(u.department) : null;
    return `
      <tr>
        <td>
          <div class="admin-user-cell">
            <div class="auc-avatar" style="background:${u.avatarColor}">${escHtml(u.avatar)}</div>
            <div>
              <div class="auc-name">${escHtml(u.name)}</div>
            </div>
          </div>
        </td>
        <td>${escHtml(u.email)}</td>
        <td>${dept ? `<span class="dept-badge-sm">${dept.icon} ${dept.name}</span>` : "—"}</td>
        <td>${escHtml(u.position || "—")}</td>
        <td><span class="role-badge">${ROLE_LABELS[u.role]}</span></td>
        <td>
          <span class="status-badge ${u.blocked ? "status-blocked" : "status-active"}">
            ${u.blocked ? "🔴 Заблоковано" : "🟢 Активний"}
          </span>
        </td>
        <td>
          <div class="table-actions">
            <button class="tbl-btn tbl-btn-edit" onclick="openEditUser('${u.id}')">✏️</button>
            <button class="tbl-btn ${u.blocked ? "tbl-btn-unblock" : "tbl-btn-block"}"
              onclick="toggleBlockUser('${u.id}')">
              ${u.blocked ? "🔓" : "🔒"}
            </button>
            <button class="tbl-btn tbl-btn-delete" onclick="deleteUserConfirm('${u.id}')">🗑</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

// ── Пошук ──────────────────────────────────
function searchAdminUsers(value, type) {
  if (type === "users") renderUsersTab(value.toLowerCase());
  else renderEmployeesTab(value.toLowerCase());
}

// ── Редагувати користувача ─────────────────
function openEditUser(userId) {
  const user = getUserById(userId);
  if (!user) return;

  document.getElementById("editUserId").value       = userId;
  document.getElementById("editUserName").value     = user.name;
  document.getElementById("editUserEmail").value    = user.email;
  document.getElementById("editUserRole").value     = user.role;
  document.getElementById("editUserDept").value     = user.department || "";
  document.getElementById("editUserPosition").value = user.position || "";
  document.getElementById("editUserError").style.display = "none";

  openModal("editUserModal");
}

function submitEditUser(event) {
  event.preventDefault();

  const userId   = document.getElementById("editUserId").value;
  const name     = document.getElementById("editUserName").value.trim();
  const email    = document.getElementById("editUserEmail").value.trim().toLowerCase();
  const role     = document.getElementById("editUserRole").value;
  const dept     = document.getElementById("editUserDept").value || null;
  const position = document.getElementById("editUserPosition").value.trim();
  const errorEl  = document.getElementById("editUserError");

  // Перевірка унікальності email
  const existing = getUserByEmail(email);
  if (existing && existing.id !== userId) {
    errorEl.textContent = "Цей email вже використовується";
    errorEl.style.display = "block";
    return;
  }

  const users = getUsers();
  const idx   = users.findIndex(u => u.id === userId);
  if (idx === -1) return;

  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  users[idx] = {
    ...users[idx],
    name, email, role,
    department: dept,
    position,
    avatar: initials,
  };
  saveUsers(users);

  closeModal("editUserModal");
  renderUsersTab();
  renderEmployeesTab();
  showToast("Користувача оновлено ✅", "success");
}

// ── Блокування ─────────────────────────────
function toggleBlockUser(userId) {
  const users = getUsers();
  const idx   = users.findIndex(u => u.id === userId);
  if (idx === -1) return;

  // Не можна заблокувати себе
  if (userId === adminSession.id) {
    showToast("Не можна заблокувати себе!", "error");
    return;
  }

  users[idx].blocked = !users[idx].blocked;
  saveUsers(users);

  renderUsersTab();
  renderEmployeesTab();
  showToast(
    users[idx].blocked ? "Користувача заблоковано" : "Користувача розблоковано",
    "success"
  );
}

// ── Видалити користувача ───────────────────
function deleteUserConfirm(userId) {
  if (userId === adminSession.id) {
    showToast("Не можна видалити себе!", "error");
    return;
  }
  if (!confirm("Видалити цього користувача? Цю дію не можна скасувати.")) return;

  const users = getUsers().filter(u => u.id !== userId);
  saveUsers(users);
  renderUsersTab();
  renderEmployeesTab();
  showToast("Користувача видалено", "success");
}

// ── Створити співробітника ─────────────────
function submitCreateEmployee(event) {
  event.preventDefault();

  const name     = document.getElementById("empName").value.trim();
  const email    = document.getElementById("empEmail").value.trim().toLowerCase();
  const password = document.getElementById("empPassword").value;
  const dept     = document.getElementById("empDept").value;
  const role     = document.getElementById("empRole").value;
  const position = document.getElementById("empPosition").value.trim();
  const errorEl  = document.getElementById("empError");

  if (password.length < 6) {
    errorEl.textContent = "Пароль мінімум 6 символів";
    errorEl.style.display = "block";
    return;
  }

  const existing = getUserByEmail(email);
  if (existing) {
    errorEl.textContent = "Акаунт з таким email вже існує";
    errorEl.style.display = "block";
    return;
  }

  const colors = [
    "linear-gradient(135deg,#7C3AED,#3B82F6)",
    "linear-gradient(135deg,#059669,#0EA5E9)",
    "linear-gradient(135deg,#DC2626,#F59E0B)",
    "linear-gradient(135deg,#7C3AED,#EC4899)",
  ];

  const initials    = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const avatarColor = colors[Math.floor(Math.random() * colors.length)];

  const users = getUsers();
  users.push({
    id:          genId(),
    name, email, password, role,
    department:  dept,
    position,
    avatar:      initials,
    avatarColor,
    createdAt:   new Date().toISOString().split("T")[0],
    blocked:     false,
  });
  saveUsers(users);

  closeModal("createEmployeeModal");
  event.target.reset();
  renderEmployeesTab();
  showToast(`✅ Акаунт для ${name} створено!`, "success");
}

// ═══════════════════════════════════════════
//  НОВИНИ
// ═══════════════════════════════════════════
function renderAdminNews() {
  const el = document.getElementById("adminNewsList");
  if (!el) return;

  const news = getNews();

  if (!news.length) {
    el.innerHTML = `<div class="empty-mini">Новин немає</div>`;
    return;
  }

  el.innerHTML = news.map(n => `
    <div class="admin-news-item">
      <div class="ani-body">
        <div class="ani-header">
          <span class="news-tag">${escHtml(n.tag)}</span>
          <span class="ani-pub ${n.public ? "public" : "private"}">
            ${n.public ? "🌐 Публічна" : "🔒 Приватна"}
          </span>
        </div>
        <div class="ani-title">${escHtml(n.title)}</div>
        <div class="ani-content">${escHtml(n.content)}</div>
        <div class="ani-meta">${formatDate(n.date)}</div>
      </div>
      <div class="ani-actions">
        <button class="tbl-btn tbl-btn-edit" onclick="openEditNews('${n.id}')">✏️</button>
        <button class="tbl-btn tbl-btn-delete" onclick="deleteNewsConfirm('${n.id}')">🗑</button>
      </div>
    </div>
  `).join("");
}

function openEditNews(id) {
  const n = getNews().find(item => item.id === id);
  if (!n) return;

  document.getElementById("newsModalTitle").textContent = "Редагувати новину";
  document.getElementById("editNewsId").value  = id;
  document.getElementById("newsTitle").value   = n.title;
  document.getElementById("newsContent").value = n.content;
  document.getElementById("newsTag").value     = n.tag;
  document.getElementById("newsPublic").value  = String(n.public);
  document.getElementById("newsDate").value    = n.date;

  openModal("createNewsModal");
}

function submitNews(event) {
  event.preventDefault();

  const editId  = document.getElementById("editNewsId").value;
  const title   = document.getElementById("newsTitle").value.trim();
  const content = document.getElementById("newsContent").value.trim();
  const tag     = document.getElementById("newsTag").value;
  const isPublic= document.getElementById("newsPublic").value === "true";
  const date    = document.getElementById("newsDate").value || new Date().toISOString().split("T")[0];

  if (editId) {
    updateNews(editId, { title, content, tag, public: isPublic, date });
    showToast("Новину оновлено ✅", "success");
  } else {
    addNews({ title, content, tag, public: isPublic, date, image: null });
    showToast("Новину створено ✅", "success");
  }

  closeModal("createNewsModal");
  event.target.reset();
  document.getElementById("editNewsId").value = "";
  document.getElementById("newsModalTitle").textContent = "Нова новина";
  renderAdminNews();
}

function deleteNewsConfirm(id) {
  if (!confirm("Видалити цю новину?")) return;
  deleteNews(id);
  renderAdminNews();
  showToast("Новину видалено", "success");
}

// ═══════════════════════════════════════════
//  ДОКУМЕНТИ
// ═══════════════════════════════════════════
function renderAdminDocs() {
  const el = document.getElementById("adminDocsList");
  if (!el) return;

  const docs = getDocs();

  if (!docs.length) {
    el.innerHTML = `<div class="empty-mini">Документів немає</div>`;
    return;
  }

  el.innerHTML = docs.map(d => {
    const dept = d.department ? getDept(d.department) : null;
    return `
      <div class="admin-doc-item">
        <div class="adi-icon">📄</div>
        <div class="adi-body">
          <div class="adi-title">${escHtml(d.title)}</div>
          <div class="adi-meta">
            ${dept ? `${dept.icon} ${dept.name}` : "Для всіх відділів"} ·
            Доступ: ${d.access.map(r => ROLE_LABELS[r]).join(", ")} ·
            ${formatDate(d.createdAt)}
          </div>
        </div>
        <div class="adi-actions">
          <button class="tbl-btn tbl-btn-edit" onclick="openEditDoc('${d.id}')">✏️ Редагувати</button>
          <button class="tbl-btn tbl-btn-delete" onclick="deleteDocConfirm('${d.id}')">🗑</button>
        </div>
      </div>
    `;
  }).join("");
}

function openEditDoc(id) {
  const d = getDocById(id);
  if (!d) return;

  document.getElementById("docModalTitle").textContent = "Редагувати документ";
  document.getElementById("editDocId").value   = id;
  document.getElementById("docTitle").value    = d.title;
  document.getElementById("docContent").value  = d.content;
  document.getElementById("docDept").value     = d.department || "";

  // Мінімальна роль з масиву access
  const minRole = d.access.includes("employee") ? "employee" :
                  d.access.includes("manager")  ? "manager"  : "admin";
  document.getElementById("docAccess").value = minRole;

  openModal("createDocModal");
}

function submitDoc(event) {
  event.preventDefault();

  const editId  = document.getElementById("editDocId").value;
  const title   = document.getElementById("docTitle").value.trim();
  const content = document.getElementById("docContent").value.trim();
  const dept    = document.getElementById("docDept").value || null;
  const minRole = document.getElementById("docAccess").value;

  const accessMap = {
    employee: ["employee", "manager", "admin"],
    manager:  ["manager", "admin"],
    admin:    ["admin"],
  };
  const access = accessMap[minRole] || ["employee", "manager", "admin"];

  if (editId) {
    updateDoc(editId, { title, content, department: dept, access });
    showToast("Документ оновлено ✅", "success");
  } else {
    addDoc({
      title, content,
      department: dept,
      access,
      createdBy: adminSession.id,
    });
    showToast("Документ створено ✅", "success");
  }

  closeModal("createDocModal");
  event.target.reset();
  document.getElementById("editDocId").value = "";
  document.getElementById("docModalTitle").textContent = "Новий документ";
  renderAdminDocs();
}

function deleteDocConfirm(id) {
  if (!confirm("Видалити цей документ?")) return;
  deleteDoc(id);
  renderAdminDocs();
  showToast("Документ видалено", "success");
}

// ═══════════════════════════════════════════
//  ЖУРНАЛ ДОСТУПУ
// ═══════════════════════════════════════════
function renderLog(filter = "all") {
  const el = document.getElementById("adminLogList");
  if (!el) return;

  let log = getLog();
  if (filter !== "all") log = log.filter(l => l.action === filter);

  if (!log.length) {
    el.innerHTML = `<div class="empty-mini">Записів немає</div>`;
    return;
  }

  el.innerHTML = log.map(l => {
    const icon  = l.action === "LOGIN_OK"      ? "🟢" :
                  l.action === "LOGIN_FAIL"     ? "🔴" :
                  l.action === "ACCESS_DENIED"  ? "🔴" :
                  l.action === "LOGOUT"         ? "⬛" :
                  l.action === "REGISTER"       ? "🆕" : "⚡";

    const cls   = l.action === "LOGIN_OK" || l.action === "ACCESS_OK" ? "ok" :
                  l.action === "ACCESS_DENIED" || l.action === "LOGIN_FAIL" || l.action === "LOGIN_BLOCKED" ? "denied" :
                  l.action === "LOGOUT" ? "logout" : "other";

    return `
      <div class="log-item">
        <span class="log-icon">${icon}</span>
        <span class="log-action ${cls}">${l.action}</span>
        <span class="log-email">${escHtml(l.email || "—")}</span>
        <span class="log-detail">${escHtml(l.detail || "")}</span>
        <span class="log-time">${l.timestamp || ""}</span>
      </div>
    `;
  }).join("");
}

function filterLog(filter, btn) {
  currentLogFilter = filter;
  document.querySelectorAll(".log-filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderLog(filter);
}

function clearLog() {
  if (!confirm("Очистити журнал доступу?")) return;
  localStorage.setItem(DB.LOG, JSON.stringify([]));
  renderLog();
  showToast("Журнал очищено", "success");
}

// ═══════════════════════════════════════════
//  ЗАЯВКИ НА РОБОТУ
// ═══════════════════════════════════════════
function renderRequests() {
  const el = document.getElementById("adminRequestsList");
  if (!el) return;

  const reqs = getJoinRequests();

  if (!reqs.length) {
    el.innerHTML = `<div class="empty-mini">Заявок немає</div>`;
    return;
  }

  el.innerHTML = reqs.map(r => `
    <div class="admin-request-item">
      <div class="ari-body">
        <div class="ari-name">${escHtml(r.name)}</div>
        <div class="ari-info">
          📧 ${escHtml(r.email)} · 
          📁 ${escHtml(r.department)} · 
          📅 ${r.date}
        </div>
        ${r.message ? `<div class="ari-msg">"${escHtml(r.message)}"</div>` : ""}
      </div>
      <div class="ari-actions" style="flex-direction:column;gap:6px">
        <span class="req-status req-${r.status}">
          ${r.status === "pending" ? "⏳ Очікує" : r.status === "approved" ? "✅ Прийнято" : "❌ Відхилено"}
        </span>
        ${r.status === "pending" ? `
          <button class="tbl-btn tbl-btn-unblock" onclick="handleRequest('${r.id}','approved')">✅ Прийняти</button>
          <button class="tbl-btn tbl-btn-delete"  onclick="handleRequest('${r.id}','rejected')">❌ Відхилити</button>
        ` : ""}
      </div>
    </div>
  `).join("");
}

function handleRequest(id, status) {
  const reqs = getJoinRequests();
  const idx  = reqs.findIndex(r => r.id === id);
  if (idx === -1) return;
  reqs[idx].status = status;
  localStorage.setItem(DB.JOIN_REQ, JSON.stringify(reqs));
  renderRequests();
  showToast(status === "approved" ? "Заявку прийнято ✅" : "Заявку відхилено", "success");
}

// ── Модалки ────────────────────────────────
function openModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add("active"); document.body.style.overflow = "hidden"; }
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove("active"); document.body.style.overflow = ""; }
}
function closeModalOutside(e, id) {
  if (e.target === e.currentTarget) closeModal(id);
}
