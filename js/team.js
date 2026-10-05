// ═══════════════════════════════════════════
//  WorkHub — Логіка сторінки «Команда»
// ═══════════════════════════════════════════

let teamSession  = null;
let teamMembers  = [];

function initTeam(session) {
  teamSession = session;
  renderSidebarUser(session);
  renderTopbarUser(session);

  if (!session.department) {
    document.getElementById("teamGrid").innerHTML = `
      <div style="text-align:center;padding:60px;color:var(--text-muted)">
        <div style="font-size:2.5rem;margin-bottom:12px">👥</div>
        <p>Вас не призначено до відділу</p>
      </div>
    `;
    return;
  }

  teamMembers = getUsers().filter(u =>
    u.department === session.department && !u.blocked
  );

  renderTeam(teamMembers);
}

// ── Рендер команди ─────────────────────────
function renderTeam(members) {
  const el = document.getElementById("teamGrid");
  if (!el) return;

  if (!members.length) {
    el.innerHTML = `
      <div style="text-align:center;padding:60px;color:var(--text-muted);grid-column:1/-1">
        <div style="font-size:2.5rem;margin-bottom:12px">👥</div>
        <p>Членів команди не знайдено</p>
      </div>
    `;
    return;
  }

  el.innerHTML = members.map(m => {
    const tasksDone  = getTasksByUser(m.id).filter(t => t.status === "done").length;
    const tasksTotal = getTasksByUser(m.id).length;
    const isManager  = m.role === "manager";
    const isMe       = m.id === teamSession.id;

    return `
      <div class="team-member-card ${isMe ? "is-me" : ""}" onclick="openMember('${m.id}')">
        <div class="tmc-header">
          <div class="tmc-avatar" style="background:${m.avatarColor}">
            ${escHtml(m.avatar)}
          </div>
          ${isManager ? `<div class="tmc-manager-badge">Керівник</div>` : ""}
          ${isMe ? `<div class="tmc-me-badge">Це ви</div>` : ""}
        </div>
        <div class="tmc-name">${escHtml(m.name)}</div>
        <div class="tmc-position">${escHtml(m.position || "")}</div>
        <div class="tmc-role">${ROLE_LABELS[m.role] || m.role}</div>
        <div class="tmc-stats">
          <div class="tmc-stat">
            <span class="tmc-stat-num">${tasksTotal}</span>
            <span class="tmc-stat-label">Задач</span>
          </div>
          <div class="tmc-stat">
            <span class="tmc-stat-num">${tasksDone}</span>
            <span class="tmc-stat-label">Виконано</span>
          </div>
          <div class="tmc-stat">
            <span class="tmc-stat-num">
              ${tasksTotal ? Math.round(tasksDone / tasksTotal * 100) : 0}%
            </span>
            <span class="tmc-stat-label">Успіх</span>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// ── Відкрити профіль члена ─────────────────
function openMember(userId) {
  const member = teamMembers.find(m => m.id === userId);
  if (!member) return;

  const tasks      = getTasksByUser(userId);
  const tasksDone  = tasks.filter(t => t.status === "done").length;
  const tasksTotal = tasks.length;
  const duties     = getDuties(userId);
  const isMe       = userId === teamSession.id;

  const content = document.getElementById("memberModalContent");
  if (!content) return;

  content.innerHTML = `
    <div class="member-modal-header">
      <div class="member-modal-avatar" style="background:${member.avatarColor}">
        ${escHtml(member.avatar)}
      </div>
      <div>
        <h2 class="member-modal-name">
          ${escHtml(member.name)}
          ${isMe ? `<span class="tmc-me-badge">Це ви</span>` : ""}
        </h2>
        <div class="member-modal-pos">${escHtml(member.position || "")}</div>
        <div class="member-modal-role">${ROLE_LABELS[member.role] || member.role}</div>
      </div>
    </div>

    <div class="member-modal-stats">
      <div class="mms-item">
        <div class="mms-num">${tasksTotal}</div>
        <div class="mms-label">Всього задач</div>
      </div>
      <div class="mms-item">
        <div class="mms-num">${tasksDone}</div>
        <div class="mms-label">Виконано</div>
      </div>
      <div class="mms-item">
        <div class="mms-num">${tasksTotal ? Math.round(tasksDone / tasksTotal * 100) : 0}%</div>
        <div class="mms-label">Ефективність</div>
      </div>
    </div>

    ${duties.length ? `
      <div class="member-modal-section">
        <h4>Обов'язки</h4>
        ${duties.map(d => `
          <div class="duty-mini">
            <div>
              <div class="duty-mini-title">${escHtml(d.title)}</div>
              <div class="duty-mini-desc">${escHtml(d.desc)}</div>
            </div>
          </div>
        `).join("")}
      </div>
    ` : ""}

    ${tasks.length ? `
      <div class="member-modal-section">
        <h4>Поточні задачі</h4>
        ${tasks.filter(t => t.status !== "done").slice(0, 4).map(t => `
          <div class="task-mini">
            <div class="task-mini-status status-${t.status === "in_progress" ? "progress" : "todo"}"></div>
            <span class="task-mini-text">${escHtml(t.title)}</span>
            <span class="task-priority priority-${t.priority}">
              ${t.priority === "high" ? "!" : "·"}
            </span>
          </div>
        `).join("")}
      </div>
    ` : ""}

    <div style="margin-top:16px">
      <button class="btn-secondary btn-sm" onclick="closeModal('memberModal')">Закрити</button>
    </div>
  `;

  openModal("memberModal");
}

// ── Пошук ──────────────────────────────────
function searchTeam(query) {
  if (!query.trim()) {
    renderTeam(teamMembers);
    return;
  }
  const q = query.toLowerCase();
  const filtered = teamMembers.filter(m =>
    m.name.toLowerCase().includes(q) ||
    (m.position || "").toLowerCase().includes(q) ||
    (ROLE_LABELS[m.role] || "").toLowerCase().includes(q)
  );
  renderTeam(filtered);
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
