// ═══════════════════════════════════════════
//  WorkHub — Логіка сторінки «Мій відділ»
// ═══════════════════════════════════════════

let deptSession = null;

function initDepartment(session) {
  deptSession = session;
  renderSidebarUser(session);
  renderTopbarUser(session);

  if (!session.department) {
    document.getElementById("deptHero").innerHTML = `
      <div class="empty-mini" style="padding:40px;text-align:center">
        <div style="font-size:2rem;margin-bottom:12px">🏢</div>
        <p>Вас ще не призначено до жодного відділу.<br/>Зверніться до адміністратора.</p>
      </div>
    `;
    return;
  }

  renderDeptHero(session);
  renderDeptNews(session);
  renderDeptTasks(session);
  renderDeptDocs(session);
}

// ── Шапка відділу ──────────────────────────
function renderDeptHero(session) {
  const dept = getDept(session.department);
  if (!dept) return;

  const titleEl = document.getElementById("deptTopbarTitle");
  if (titleEl) titleEl.textContent = dept.name;

  const iconEl = document.getElementById("deptHeroIcon");
  if (iconEl) {
    iconEl.textContent = dept.icon;
    iconEl.style.background = dept.color;
  }

  const nameEl = document.getElementById("deptHeroName");
  if (nameEl) nameEl.textContent = dept.name;

  const descEl = document.getElementById("deptHeroDesc");
  if (descEl) descEl.textContent = dept.description;

  const statsEl = document.getElementById("deptHeroStats");
  if (statsEl) {
    const members = getUsers().filter(u => u.department === session.department && !u.blocked);
    const tasks   = getTasksByDept(session.department);
    const docs    = getDocsByDept(session.department, session.role);
    const done    = tasks.filter(t => t.status === "done").length;

    statsEl.innerHTML = `
      <div class="dept-stat">
        <div class="dept-stat-num">${members.length}</div>
        <div class="dept-stat-label">Співробітників</div>
      </div>
      <div class="dept-stat-div"></div>
      <div class="dept-stat">
        <div class="dept-stat-num">${tasks.length}</div>
        <div class="dept-stat-label">Задачі</div>
      </div>
      <div class="dept-stat-div"></div>
      <div class="dept-stat">
        <div class="dept-stat-num">${docs.length}</div>
        <div class="dept-stat-label">Документи</div>
      </div>
      <div class="dept-stat-div"></div>
      <div class="dept-stat">
        <div class="dept-stat-num">${tasks.length ? Math.round(done / tasks.length * 100) : 0}%</div>
        <div class="dept-stat-label">Виконано</div>
      </div>
    `;
  }
}

// ── Новини відділу ─────────────────────────
function renderDeptNews(session) {
  const el = document.getElementById("deptNewsList");
  if (!el) return;

  const dept = getDept(session.department);
  const news = getNews().filter(n =>
    n.tag === (dept?.name || "") || n.public
  );

  if (!news.length) {
    el.innerHTML = `<div class="empty-mini">Новин поки немає</div>`;
    return;
  }

  el.innerHTML = news.map(n => `
    <div class="news-card">
      <div class="news-tag">${escHtml(n.tag)}</div>
      <h3>${escHtml(n.title)}</h3>
      <p>${escHtml(n.content)}</p>
      <div class="news-footer">
        <span class="news-date">${formatDate(n.date)}</span>
      </div>
    </div>
  `).join("");
}

// ── Задачі відділу ─────────────────────────
function renderDeptTasks(session) {
  const el = document.getElementById("deptTasksList");
  if (!el) return;

  // Кнопка для менеджера
  if (session.role === "manager" || session.role === "admin") {
    const btnEl = document.getElementById("deptTasksManagerBtn");
    if (btnEl) {
      btnEl.innerHTML = `
        <a href="tasks.html" class="btn-primary btn-sm">+ Нова задача</a>
      `;
    }
  }

  const tasks = getTasksByDept(session.department);
  const users = getUsers();

  if (!tasks.length) {
    el.innerHTML = `<div class="empty-mini">Задач у відділі немає</div>`;
    return;
  }

  const statusLabels = { todo: "Нова", in_progress: "В процесі", done: "Виконана" };
  const statusColors = {
    todo: "var(--text-muted)",
    in_progress: "#FBBF24",
    done: "var(--success)"
  };

  el.innerHTML = `
    <div class="dept-tasks-list">
      ${tasks.map(t => {
        const assignee = t.assignedTo ? users.find(u => u.id === t.assignedTo) : null;
        const isOverdue = t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done";

        return `
          <div class="dept-task-item">
            <div class="dti-left">
              <div class="dti-dot" style="background:${statusColors[t.status]}"></div>
              <div>
                <div class="dti-title ${t.status === "done" ? "done" : ""}">${escHtml(t.title)}</div>
                ${t.desc ? `<div class="dti-desc">${escHtml(t.desc)}</div>` : ""}
              </div>
            </div>
            <div class="dti-right">
              ${assignee ? `
                <div class="dti-assignee">
                  <div class="dti-avatar" style="background:${assignee.avatarColor}">${escHtml(assignee.avatar)}</div>
                  <span>${escHtml(assignee.name.split(" ")[0])}</span>
                </div>
              ` : `<span class="dti-unassigned">Не призначено</span>`}
              <span class="task-priority priority-${t.priority}">
                ${t.priority === "high" ? "Висок." : t.priority === "medium" ? "Серед." : "Низьк."}
              </span>
              <span class="dti-status" style="color:${statusColors[t.status]}">
                ${statusLabels[t.status] || t.status}
              </span>
              ${t.dueDate ? `
                <span class="dti-due ${isOverdue ? "overdue" : ""}">
                  📅 ${formatDate(t.dueDate)}${isOverdue ? " ⚠️" : ""}
                </span>
              ` : ""}
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

// ── Документи відділу ──────────────────────
function renderDeptDocs(session) {
  const el = document.getElementById("deptDocsList");
  if (!el) return;

  const docs = getDocsByDept(session.department, session.role);

  if (!docs.length) {
    el.innerHTML = `<div class="empty-mini">Документів немає</div>`;
    return;
  }

  el.innerHTML = docs.map(d => `
    <div class="instruction-item" onclick="location.href='docs.html'">
      <div class="inst-icon">📄</div>
      <div class="inst-body">
        <div class="inst-title">${escHtml(d.title)}</div>
        <div class="inst-date">
          Доступ: ${d.access.map(r => ROLE_LABELS[r]).join(", ")} ·
          Додано: ${formatDate(d.createdAt)}
        </div>
      </div>
      <div class="inst-arrow">→</div>
    </div>
  `).join("");
}

// ── Вкладки відділу ────────────────────────
function switchDeptTab(tab, btn) {
  const tabs = { news: "deptTabNews", tasks: "deptTabTasks", docs: "deptTabDocs" };
  Object.values(tabs).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
  document.querySelectorAll(".space-tab").forEach(b => b.classList.remove("active"));

  const target = document.getElementById(tabs[tab]);
  if (target) target.style.display = "block";
  btn.classList.add("active");
}
