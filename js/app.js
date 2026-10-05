// ═══════════════════════════════════════════
//  WorkHub — Логіка внутрішнього порталу
// ═══════════════════════════════════════════

// ── Sidebar toggle ─────────────────────────
function toggleSidebar() {
  document.getElementById("sidebar")?.classList.toggle("open");
}

// Закрити sidebar при кліку поза ним
document.addEventListener("click", e => {
  const sidebar = document.getElementById("sidebar");
  const burger  = document.querySelector(".topbar-burger");
  if (sidebar && sidebar.classList.contains("open")) {
    if (!sidebar.contains(e.target) && e.target !== burger) {
      sidebar.classList.remove("open");
    }
  }
});

// ── Toast ───────────────────────────────────
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className   = `toast ${type} show`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.className = "toast"; }, 3000);
}

// ── Escape HTML ─────────────────────────────
function escHtml(text = "") {
  const d = document.createElement("div");
  d.appendChild(document.createTextNode(String(text)));
  return d.innerHTML;
}

// ── Форматування дати ───────────────────────
function formatDate(str) {
  if (!str) return "—";
  const d = new Date(str);
  return d.toLocaleDateString("uk-UA", { day:"2-digit", month:"short", year:"numeric" });
}

function todayStr() {
  return new Date().toLocaleDateString("uk-UA", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });
}

// ── Привітання ─────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 6)  return "Доброї ночі";
  if (h < 12) return "Доброго ранку";
  if (h < 18) return "Доброго дня";
  return "Доброго вечора";
}

// ── Рендер sidebar user ────────────────────
function renderSidebarUser(session) {
  const el = document.getElementById("sidebarUser");
  if (!el || !session) return;
  const dept = session.department ? getDept(session.department) : null;
  el.innerHTML = `
    <div class="su-avatar" style="background:${session.avatarColor}">${escHtml(session.avatar)}</div>
    <div class="su-info">
      <div class="su-name">${escHtml(session.name)}</div>
      <div class="su-role">${escHtml(ROLE_LABELS[session.role] || session.role)}</div>
    </div>
  `;
}

// ── Рендер topbar user ─────────────────────
function renderTopbarUser(session) {
  const el = document.getElementById("topbarUser");
  if (!el || !session) return;
  el.innerHTML = `
    <div class="su-avatar" style="background:${session.avatarColor};width:28px;height:28px;font-size:0.65rem">
      ${escHtml(session.avatar)}
    </div>
    <span>${escHtml(session.name.split(" ")[0])}</span>
  `;
}

// ═══════════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════════
function initDashboard(session) {
  renderSidebarUser(session);
  renderTopbarUser(session);

  // Привітання
  const greetEl = document.getElementById("greetingText");
  const roleEl  = document.getElementById("greetingRole");
  const dateEl  = document.getElementById("dashDate");
  if (greetEl) greetEl.textContent = `${getGreeting()}, ${session.name.split(" ")[0]} 👋`;
  if (roleEl)  roleEl.textContent  = `${ROLE_LABELS[session.role]} ${session.department ? "· " + (getDept(session.department)?.name || "") : ""}`;
  if (dateEl)  dateEl.textContent  = todayStr();

  // Статистика
  const myTasks = getTasksByUser(session.id);
  const myDocs  = session.department ? getDocsByDept(session.department, session.role) : [];
  const myNotes = getNotes(session.id);
  const team    = session.department ? getUsers().filter(u => u.department === session.department) : [];

  setEl("statMyTasks", myTasks.length);
  setEl("statDocs",    myDocs.length);
  setEl("statNotes",   myNotes.length);
  setEl("statTeam",    team.length);

  // Задачі (перші 4)
  renderMiniTasks(myTasks.slice(0, 4));

  // Обов'язки
  renderMiniDuties(getDuties(session.id));

  // Нотатки (перші 3)
  renderMiniNotes(myNotes.slice(0, 3));

  // Новини
  renderMiniNews(getNews().slice(0, 3));
}

function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ── Міні-задачі ────────────────────────────
function renderMiniTasks(tasks) {
  const el = document.getElementById("myTasksList");
  if (!el) return;
  if (!tasks.length) {
    el.innerHTML = `<div class="empty-mini">Задач немає 🎉</div>`;
    return;
  }
  el.innerHTML = tasks.map(t => `
    <div class="task-mini">
      <div class="task-mini-status status-${t.status === "done" ? "done" : t.status === "in_progress" ? "progress" : "todo"}"></div>
      <span class="task-mini-text ${t.status === "done" ? "done" : ""}">${escHtml(t.title)}</span>
      <span class="task-priority priority-${t.priority}">${t.priority === "high" ? "Висок." : t.priority === "medium" ? "Серед." : "Низьк."}</span>
    </div>
  `).join("");
}

// ── Міні-обов'язки ─────────────────────────
function renderMiniDuties(duties) {
  const el = document.getElementById("myDutiesList");
  if (!el) return;
  if (!duties.length) {
    el.innerHTML = `<div class="empty-mini">Обов'язки не призначені</div>`;
    return;
  }
  el.innerHTML = duties.map(d => `
    <div class="duty-mini">
      <div>
        <div class="duty-mini-title">${escHtml(d.title)}</div>
        <div class="duty-mini-desc">${escHtml(d.desc)}</div>
      </div>
    </div>
  `).join("");
}

// ── Міні-нотатки ───────────────────────────
function renderMiniNotes(notes) {
  const el = document.getElementById("myNotesList");
  if (!el) return;
  if (!notes.length) {
    el.innerHTML = `<div class="empty-mini">Нотаток поки немає</div>`;
    return;
  }
  el.innerHTML = notes.map(n => `
    <div class="note-mini" onclick="location.href='notes.html'">
      <div class="note-mini-title">${escHtml(n.title || "Без назви")}</div>
      <div class="note-mini-text">${escHtml(n.text || "")}</div>
      ${n.docId ? `<div class="note-mini-doc">📎 З документа</div>` : ""}
    </div>
  `).join("");
}

// ── Міні-новини ────────────────────────────
function renderMiniNews(news) {
  const el = document.getElementById("dashNewsList");
  if (!el) return;
  if (!news.length) {
    el.innerHTML = `<div class="empty-mini">Новин немає</div>`;
    return;
  }
  el.innerHTML = news.map(n => `
    <div class="news-mini">
      <div class="news-mini-title">${escHtml(n.title)}</div>
      <div class="news-mini-date">${formatDate(n.date)}</div>
    </div>
  `).join("");
}

// ── Empty mini ──────────────────────────────
const style = document.createElement("style");
style.textContent = `.empty-mini { font-size:0.8rem; color:var(--text-muted); text-align:center; padding:16px 0; }`;
document.head.appendChild(style);
