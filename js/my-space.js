// ═══════════════════════════════════════════
//  WorkHub — Логіка «Мій простір»
// ═══════════════════════════════════════════

let spaceSession = null;

function initMySpace(session) {
  spaceSession = session;
  renderSidebarUser(session);
  renderTopbarUser(session);
  renderProfile(session);
  renderDuties(session);
  renderInstructions(session);
  renderActivity(session);
}

// ── Профіль ────────────────────────────────
function renderProfile(session) {
  const avatarEl = document.getElementById("profileAvatar");
  const nameEl   = document.getElementById("profileName");
  const metaEl   = document.getElementById("profileMeta");
  const deptEl   = document.getElementById("profileDept");

  if (avatarEl) {
    avatarEl.style.background = session.avatarColor;
    avatarEl.textContent      = session.avatar;
  }
  if (nameEl) nameEl.textContent = session.name;

  if (metaEl) {
    metaEl.innerHTML = `
      <span>${escHtml(session.email || "")}</span>
      <span class="profile-dot">·</span>
      <span>${escHtml(session.position || "")}</span>
      <span class="profile-dot">·</span>
      <span class="role-badge">${ROLE_LABELS[session.role] || session.role}</span>
    `;
  }

  if (deptEl && session.department) {
    const dept = getDept(session.department);
    if (dept) {
      deptEl.innerHTML = `
        <div class="dept-badge">
          <span>${dept.icon}</span>
          <span>${dept.name}</span>
        </div>
      `;
    }
  }
}

// ── Обов'язки ──────────────────────────────
function renderDuties(session) {
  const el = document.getElementById("dutiesList");
  if (!el) return;

  const duties = getDuties(session.id);

  if (!duties.length) {
    el.innerHTML = `<div class="empty-mini">Обов'язки не призначені. Зверніться до керівника відділу.</div>`;
    return;
  }

  el.innerHTML = duties.map((d, i) => `
    <div class="duty-full-item">
      <div class="dfi-num">${i + 1}</div>
      <div class="dfi-body">
        <div class="dfi-title">${escHtml(d.title)}</div>
        <div class="dfi-desc">${escHtml(d.desc)}</div>
      </div>
    </div>
  `).join("");
}

// ── Інструкції ─────────────────────────────
function renderInstructions(session) {
  const el = document.getElementById("instructionsList");
  if (!el) return;

  const docs = session.department
    ? getDocsByDept(session.department, session.role)
    : [];

  if (!docs.length) {
    el.innerHTML = `<div class="empty-mini">Інструкцій немає</div>`;
    return;
  }

  el.innerHTML = docs.map(d => `
    <div class="instruction-item" onclick="location.href='docs.html'">
      <div class="inst-icon">📄</div>
      <div class="inst-body">
        <div class="inst-title">${escHtml(d.title)}</div>
        <div class="inst-date">Оновлено: ${formatDate(d.createdAt)}</div>
      </div>
      <div class="inst-arrow">→</div>
    </div>
  `).join("");
}

// ── Активність ─────────────────────────────
function renderActivity(session) {
  const el = document.getElementById("activityList");
  if (!el) return;

  const log = getLog().filter(l =>
    l.email === session.email && l.action !== "ACCESS_OK"
  ).slice(0, 20);

  if (!log.length) {
    el.innerHTML = `<div class="empty-mini">Активності поки немає</div>`;
    return;
  }

  el.innerHTML = log.map(l => {
    const icon  = l.action === "LOGIN_OK"  ? "🟢" :
                  l.action === "LOGOUT"    ? "🔴" :
                  l.action === "REGISTER"  ? "🆕" : "⚡";
    const label = l.action === "LOGIN_OK"  ? "Вхід в систему" :
                  l.action === "LOGOUT"    ? "Вихід із системи" :
                  l.action === "REGISTER"  ? "Реєстрація" : l.action;
    return `
      <div class="activity-item">
        <span class="act-icon">${icon}</span>
        <div class="act-body">
          <div class="act-label">${label}</div>
          <div class="act-detail">${escHtml(l.detail || "")}</div>
        </div>
        <span class="act-time">${l.timestamp || ""}</span>
      </div>
    `;
  }).join("");
}

// ── Вкладки ────────────────────────────────
function switchTab(tab, btn) {
  document.querySelectorAll(".tab-content").forEach(el => el.style.display = "none");
  document.querySelectorAll(".space-tab").forEach(b => b.classList.remove("active"));

  const target = document.getElementById(`tab${capitalize(tab)}`);
  if (target) target.style.display = "block";
  btn.classList.add("active");
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ── Редагування профілю ────────────────────
function openEditProfile() {
  document.getElementById("editName").value     = spaceSession.name;
  document.getElementById("editEmail").value    = spaceSession.email;
  document.getElementById("editPassword").value = "";
  document.getElementById("editProfileError").style.display = "none";
  openModal("editProfileModal");
}

function saveProfile(event) {
  event.preventDefault();

  const name     = document.getElementById("editName")?.value.trim();
  const email    = document.getElementById("editEmail")?.value.trim().toLowerCase();
  const password = document.getElementById("editPassword")?.value;
  const errorEl  = document.getElementById("editProfileError");

  if (!name || !email) {
    errorEl.textContent  = "Заповніть всі обов'язкові поля";
    errorEl.style.display = "block";
    return;
  }

  if (password && password.length < 6) {
    errorEl.textContent  = "Пароль мінімум 6 символів";
    errorEl.style.display = "block";
    return;
  }

  // Перевірити унікальність email
  const existing = getUserByEmail(email);
  if (existing && existing.id !== spaceSession.id) {
    errorEl.textContent  = "Цей email вже використовується";
    errorEl.style.display = "block";
    return;
  }

  // Оновити в базі
  const users = getUsers();
  const idx   = users.findIndex(u => u.id === spaceSession.id);
  if (idx === -1) return;

  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  users[idx].name   = name;
  users[idx].email  = email;
  users[idx].avatar = initials;
  if (password) users[idx].password = password;

  saveUsers(users);

  // Оновити сесію
  const updatedSession = {
    ...spaceSession,
    name, email,
    avatar: initials,
  };
  sessionStorage.setItem(DB.SESSION, JSON.stringify(updatedSession));
  spaceSession = updatedSession;

  closeModal("editProfileModal");
  renderProfile(updatedSession);
  renderSidebarUser(updatedSession);
  renderTopbarUser(updatedSession);
  showToast("Профіль оновлено ✅", "success");
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add("active"); document.body.style.overflow = "hidden"; }
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove("active"); document.body.style.overflow = ""; }
}
function closeModalOutside(event, id) {
  if (event.target === event.currentTarget) closeModal(id);
}
