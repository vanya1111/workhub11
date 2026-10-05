// ═══════════════════════════════════════════
//  WorkHub — Логіка задач (Kanban)
// ═══════════════════════════════════════════

let tasksSession   = null;
let allMyTasks     = [];
let currentFilter  = "all";
let currentSort    = "date_desc";

// ── Ініціалізація ──────────────────────────
function initTasks(session) {
  tasksSession = session;
  renderSidebarUser(session);
  renderTopbarUser(session);

  // Кнопка додавання (тільки manager/admin)
  if (session.role === "manager" || session.role === "admin") {
    const wrap = document.getElementById("addTaskBtnWrap");
    if (wrap) {
      wrap.innerHTML = `
        <button class="btn-primary btn-sm" onclick="openAddTask()">
          + Нова задача
        </button>
      `;
      fillAssigneeSelect(session);
    }
  }

  loadTasks();
}

// ── Завантажити задачі ─────────────────────
function loadTasks() {
  allMyTasks = getTasksByUser(tasksSession.id);
  renderKanban(allMyTasks);
}

// ── Рендер Kanban ──────────────────────────
function renderKanban(tasks) {
  const filtered = filterTasksList(tasks);
  const sorted   = sortTasksList(filtered);

  const todo     = sorted.filter(t => t.status === "todo");
  const progress = sorted.filter(t => t.status === "in_progress");
  const done     = sorted.filter(t => t.status === "done");

  setEl("countTodo",     todo.length);
  setEl("countProgress", progress.length);
  setEl("countDone",     done.length);

  renderColumn("colTodo",     todo);
  renderColumn("colProgress", progress);
  renderColumn("colDone",     done);
}

// ── Рендер колонки ─────────────────────────
function renderColumn(colId, tasks) {
  const el = document.getElementById(colId);
  if (!el) return;

  if (!tasks.length) {
    el.innerHTML = `<div class="kanban-empty">Задач немає</div>`;
    return;
  }

  el.innerHTML = tasks.map(t => {
    const isOverdue = t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done";
    const nextStatus = t.status === "todo" ? "in_progress" : t.status === "in_progress" ? "done" : "todo";
    const nextLabel  = t.status === "todo" ? "▶ Почати" : t.status === "in_progress" ? "✅ Готово" : "↩ Відновити";
    const statusClass = t.status === "done" ? "done" : t.status === "in_progress" ? "progress" : "todo";

    return `
      <div class="task-card" onclick="openTaskDetail('${t.id}')">
        <div class="task-card-header">
          <div class="task-card-title ${t.status === "done" ? "done" : ""}">
            ${escHtml(t.title)}
          </div>
          <span class="task-priority priority-${t.priority}">
            ${t.priority === "high" ? "!" : t.priority === "medium" ? "·" : "·"}
          </span>
        </div>
        ${t.desc ? `<div class="task-card-desc">${escHtml(t.desc)}</div>` : ""}
        <div class="task-card-footer">
          <span class="task-card-due ${isOverdue ? "overdue" : ""}">
            ${t.dueDate ? "📅 " + formatDate(t.dueDate) : ""}
            ${isOverdue ? " ⚠️" : ""}
          </span>
          <button
            class="task-status-btn ${statusClass}"
            onclick="event.stopPropagation(); changeTaskStatus('${t.id}', '${nextStatus}')"
          >
            ${nextLabel}
          </button>
        </div>
      </div>
    `;
  }).join("");
}

// ── Змінити статус задачі ──────────────────
function changeTaskStatus(taskId, newStatus) {
  updateTask(taskId, { status: newStatus });

  const idx = allMyTasks.findIndex(t => t.id === taskId);
  if (idx !== -1) allMyTasks[idx].status = newStatus;

  renderKanban(allMyTasks);
  showToast(
    newStatus === "done" ? "✅ Задачу виконано!" :
    newStatus === "in_progress" ? "⚡ Задачу розпочато" :
    "↩ Задачу відновлено",
    "success"
  );
}

// ── Деталі задачі ──────────────────────────
function openTaskDetail(taskId) {
  const task = allMyTasks.find(t => t.id === taskId);
  if (!task) return;

  const statusLabels = { todo: "Нова", in_progress: "В процесі", done: "Виконана" };
  const canEdit = tasksSession.role === "manager" || tasksSession.role === "admin";

  const content = document.getElementById("taskDetailContent");
  if (!content) return;

  content.innerHTML = `
    <div class="task-detail-title">${escHtml(task.title)}</div>
    ${task.desc ? `<div class="task-detail-desc">${escHtml(task.desc)}</div>` : ""}

    <div class="task-detail-meta">
      <div class="tdm-item">
        <label>Статус</label>
        <span class="task-priority priority-${task.status === "done" ? "low" : task.status === "in_progress" ? "medium" : "high"}">
          ${statusLabels[task.status] || task.status}
        </span>
      </div>
      <div class="tdm-item">
        <label>Пріоритет</label>
        <span class="task-priority priority-${task.priority}">
          ${task.priority === "high" ? "Високий" : task.priority === "medium" ? "Середній" : "Низький"}
        </span>
      </div>
      <div class="tdm-item">
        <label>Дедлайн</label>
        <span>${task.dueDate ? formatDate(task.dueDate) : "Не вказано"}</span>
      </div>
      <div class="tdm-item">
        <label>Створено</label>
        <span>${formatDate(task.createdAt)}</span>
      </div>
    </div>

    <div class="task-detail-actions">
      ${task.status !== "done" ? `
        <button class="btn-primary btn-sm" onclick="changeTaskStatus('${task.id}', '${task.status === "todo" ? "in_progress" : "done"}'); closeModal('taskDetailModal')">
          ${task.status === "todo" ? "▶ Почати" : "✅ Завершити"}
        </button>
      ` : `
        <button class="btn-secondary btn-sm" onclick="changeTaskStatus('${task.id}', 'todo'); closeModal('taskDetailModal')">
          ↩ Відновити
        </button>
      `}
      ${canEdit ? `
        <button class="btn-danger btn-sm" onclick="deleteTaskConfirm('${task.id}')">
          🗑 Видалити
        </button>
      ` : ""}
      <button class="btn-secondary btn-sm" onclick="closeModal('taskDetailModal')">Закрити</button>
    </div>
  `;

  openModal("taskDetailModal");
}

// ── Видалити задачу ────────────────────────
function deleteTaskConfirm(taskId) {
  if (!confirm("Видалити цю задачу?")) return;
  deleteTask(taskId);
  allMyTasks = allMyTasks.filter(t => t.id !== taskId);
  closeModal("taskDetailModal");
  renderKanban(allMyTasks);
  showToast("Задачу видалено", "success");
}

// ── Відкрити форму нової задачі ────────────
function openAddTask() {
  openModal("addTaskModal");
}

// ── Заповнити список виконавців ────────────
function fillAssigneeSelect(session) {
  const sel = document.getElementById("newTaskAssignee");
  if (!sel) return;

  const teamUsers = getUsers().filter(u =>
    u.department === session.department && !u.blocked
  );

  sel.innerHTML = `<option value="">Без виконавця</option>` +
    teamUsers.map(u => `<option value="${u.id}">${escHtml(u.name)}</option>`).join("");
}

// ── Створити задачу ────────────────────────
function submitAddTask(event) {
  event.preventDefault();

  const title    = document.getElementById("newTaskTitle")?.value.trim();
  const desc     = document.getElementById("newTaskDesc")?.value.trim();
  const assignee = document.getElementById("newTaskAssignee")?.value;
  const priority = document.getElementById("newTaskPriority")?.value;
  const due      = document.getElementById("newTaskDue")?.value;

  if (!title) { showToast("Введіть назву задачі", "error"); return; }

  const task = addTask({
    title,
    desc,
    department:  tasksSession.department,
    assignedTo:  assignee || tasksSession.id,
    priority:    priority || "medium",
    status:      "todo",
    dueDate:     due || null,
  });

  // Якщо задача призначена поточному юзеру — додати в локальний масив
  if (!assignee || assignee === tasksSession.id) {
    allMyTasks.push(task);
  }

  closeModal("addTaskModal");
  event.target.reset();
  renderKanban(allMyTasks);
  showToast("✅ Задачу створено!", "success");
}

// ── Фільтрація ─────────────────────────────
function filterTasks(status, btn) {
  currentFilter = status;
  document.querySelectorAll(".tasks-filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderKanban(allMyTasks);
}

function filterTasksList(tasks) {
  if (currentFilter === "all") return tasks;
  return tasks.filter(t => t.status === currentFilter);
}

// ── Сортування ─────────────────────────────
function sortTasks(val) {
  currentSort = val;
  renderKanban(allMyTasks);
}

function sortTasksList(tasks) {
  const arr = [...tasks];
  const priorityOrder = { high: 0, medium: 1, low: 2 };

  switch (currentSort) {
    case "date_asc":
      return arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case "priority":
      return arr.sort((a, b) => (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1));
    case "due":
      return arr.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    default: // date_desc
      return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

// ── Хелпери ────────────────────────────────
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
