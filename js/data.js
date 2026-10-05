// ═══════════════════════════════════════════
//  WorkHub — Шар даних (localStorage)
// ═══════════════════════════════════════════

const DB = {
  USERS:    "wh_users",
  SESSION:  "wh_session",
  NEWS:     "wh_news",
  TASKS:    "wh_tasks",
  DOCS:     "wh_docs",
  NOTES:    "wh_notes",
  TEAM:     "wh_team",
  DEPTS:    "wh_departments",
  LOG:      "wh_access_log",
  DUTIES:   "wh_duties",
  JOIN_REQ: "wh_join_requests",
};

// ── Початкові дані ──────────────────────────
const INITIAL_DATA = {

  users: [
    {
      id: "u1",
      name: "Адміністратор",
      email: "admin@workhub.com",
      password: "admin123",
      role: "admin",
      department: null,
      position: "Системний адміністратор",
      avatar: "АД",
      avatarColor: "linear-gradient(135deg,#7C3AED,#3B82F6)",
      createdAt: "2026-01-01",
      blocked: false,
    },
    {
      id: "u2",
      name: "Анна Коваленко",
      email: "anna@workhub.com",
      password: "pass123",
      role: "manager",
      department: "it",
      position: "Head of IT",
      avatar: "АК",
      avatarColor: "linear-gradient(135deg,#059669,#0EA5E9)",
      createdAt: "2026-01-05",
      blocked: false,
    },
    {
      id: "u3",
      name: "Іван Мельник",
      email: "ivan@workhub.com",
      password: "pass123",
      role: "employee",
      department: "it",
      position: "Frontend розробник",
      avatar: "ІМ",
      avatarColor: "linear-gradient(135deg,#7C3AED,#3B82F6)",
      createdAt: "2026-01-10",
      blocked: false,
    },
    {
      id: "u4",
      name: "Марія Петренко",
      email: "maria@workhub.com",
      password: "pass123",
      role: "manager",
      department: "hr",
      position: "HR Director",
      avatar: "МП",
      avatarColor: "linear-gradient(135deg,#DC2626,#F59E0B)",
      createdAt: "2026-01-08",
      blocked: false,
    },
    {
      id: "u5",
      name: "Олег Бондаренко",
      email: "oleg@workhub.com",
      password: "pass123",
      role: "employee",
      department: "marketing",
      position: "Контент-менеджер",
      avatar: "ОБ",
      avatarColor: "linear-gradient(135deg,#7C3AED,#EC4899)",
      createdAt: "2026-02-01",
      blocked: false,
    },
    {
      id: "u6",
      name: "Тетяна Сіренко",
      email: "tetiana@workhub.com",
      password: "pass123",
      role: "employee",
      department: "accounting",
      position: "Бухгалтер",
      avatar: "ТС",
      avatarColor: "linear-gradient(135deg,#059669,#0EA5E9)",
      createdAt: "2026-02-05",
      blocked: false,
    },
  ],

  departments: {
    it: {
      id: "it",
      name: "IT відділ",
      icon: "💻",
      color: "linear-gradient(135deg,#7C3AED,#3B82F6)",
      colorAccent: "#7C3AED",
      description: "Розробка та підтримка програмних продуктів компанії",
    },
    hr: {
      id: "hr",
      name: "HR відділ",
      icon: "👤",
      color: "linear-gradient(135deg,#DC2626,#F59E0B)",
      colorAccent: "#DC2626",
      description: "Підбір персоналу та розвиток корпоративної культури",
    },
    accounting: {
      id: "accounting",
      name: "Бухгалтерія",
      icon: "📊",
      color: "linear-gradient(135deg,#059669,#0EA5E9)",
      colorAccent: "#059669",
      description: "Фінансовий облік та звітність компанії",
    },
    marketing: {
      id: "marketing",
      name: "Маркетинг",
      icon: "📣",
      color: "linear-gradient(135deg,#7C3AED,#EC4899)",
      colorAccent: "#EC4899",
      description: "Просування продуктів та робота з клієнтами",
    },
  },

  news: [
    {
      id: "n1",
      title: "WorkHub запускає нову версію порталу",
      content: "Ми раді представити оновлену версію внутрішнього порталу з покращеним інтерфейсом та новими функціями. Тепер кожен співробітник має особистий простір з задачами, нотатками та документами.",
      tag: "Компанія",
      date: "2026-06-15",
      image: null,
      public: true,
    },
    {
      id: "n2",
      title: "Нова система контролю доступу впроваджена",
      content: "IT відділ успішно впровадив рольову модель доступу. Тепер кожен співробітник має чітко визначені права залежно від відділу та посади.",
      tag: "IT відділ",
      date: "2026-06-10",
      image: null,
      public: true,
    },
    {
      id: "n3",
      title: "Відкриті вакансії у всіх відділах",
      content: "Компанія активно розширюється. Шукаємо талановитих спеціалістів у IT, маркетинг та бухгалтерію. Надсилайте резюме через форму на сайті.",
      tag: "HR",
      date: "2026-06-05",
      image: null,
      public: true,
    },
    {
      id: "n4",
      title: "Корпоративний тімбілдинг — підсумки",
      content: "Минулий тімбілдинг зібрав всіх співробітників компанії. Дякуємо всім хто взяв участь! Фото та відео вже доступні у внутрішньому порталі.",
      tag: "Компанія",
      date: "2026-05-28",
      image: null,
      public: false,
    },
  ],

  tasks: [
    // IT відділ — загальні
    {
      id: "t1", title: "Оновити документацію API",
      desc: "Описати всі ендпоінти нового модуля авторизації",
      department: "it", assignedTo: "u3",
      priority: "high", status: "in_progress",
      dueDate: "2026-06-20", createdAt: "2026-06-10",
    },
    {
      id: "t2", title: "Code review модуля авторизації",
      desc: "Перевірити код системи контролю доступу",
      department: "it", assignedTo: "u3",
      priority: "medium", status: "done",
      dueDate: "2026-06-15", createdAt: "2026-06-08",
    },
    {
      id: "t3", title: "Налаштувати CI/CD pipeline",
      desc: "Автоматизувати процес деплою проєкту",
      department: "it", assignedTo: null,
      priority: "low", status: "todo",
      dueDate: "2026-06-30", createdAt: "2026-06-12",
    },
    // HR відділ
    {
      id: "t4", title: "Провести співбесіди з кандидатами",
      desc: "Запланувати та провести 5 співбесід на посаду розробника",
      department: "hr", assignedTo: "u4",
      priority: "high", status: "in_progress",
      dueDate: "2026-06-22", createdAt: "2026-06-11",
    },
    {
      id: "t5", title: "Оновити корпоративний посібник",
      desc: "Додати розділи про нові правила роботи",
      department: "hr", assignedTo: null,
      priority: "medium", status: "todo",
      dueDate: "2026-06-28", createdAt: "2026-06-10",
    },
    // Маркетинг
    {
      id: "t6", title: "Підготувати контент-план на липень",
      desc: "Скласти план публікацій у соцмережах на місяць",
      department: "marketing", assignedTo: "u5",
      priority: "high", status: "in_progress",
      dueDate: "2026-06-25", createdAt: "2026-06-13",
    },
    // Бухгалтерія
    {
      id: "t7", title: "Закрити квартальний звіт",
      desc: "Підготувати фінансовий звіт за 2 квартал",
      department: "accounting", assignedTo: "u6",
      priority: "high", status: "todo",
      dueDate: "2026-06-30", createdAt: "2026-06-14",
    },
  ],

  docs: [
    {
      id: "d1",
      title: "Інструкція з безпеки даних",
      content: `# Інструкція з безпеки даних

## 1. Загальні положення

Кожен співробітник зобов'язаний дотримуватись правил інформаційної безпеки компанії. Ця інструкція описує основні вимоги та процедури.

## 2. Паролі та доступ

Паролі повинні містити мінімум 8 символів, включаючи великі та малі літери, цифри та спеціальні символи. Забороняється передавати паролі іншим особам.

## 3. Робота з документами

Конфіденційні документи не можна пересилати на особисті поштові адреси. Всі документи повинні зберігатись у корпоративній системі.

## 4. Інциденти безпеки

При виявленні підозрілої активності негайно повідомте IT відділ за адресою security@workhub.com.`,
      department: "it",
      access: ["employee", "manager", "admin"],
      createdAt: "2026-06-01",
      createdBy: "u2",
    },
    {
      id: "d2",
      title: "Посібник нового співробітника",
      content: `# Посібник нового співробітника WorkHub

## Ласкаво просимо!

Ми раді що ти приєднався до нашої команди. Цей посібник допоможе тобі швидко адаптуватись.

## Перший тиждень

1. Познайомся з командою
2. Налаштуй робоче середовище
3. Ознайомся з процесами відділу
4. Встанови необхідне ПЗ

## Корпоративні правила

- Робочий час: 9:00 — 18:00
- Обід: 13:00 — 14:00
- Дрес-код: casual
- Відпустка: 24 дні на рік`,
      department: null,
      access: ["employee", "manager", "admin"],
      createdAt: "2026-01-15",
      createdBy: "u4",
    },
    {
      id: "d3",
      title: "Фінансова звітність Q1 2026",
      content: `# Фінансова звітність Q1 2026

## Загальні показники

Перший квартал 2026 року компанія завершила з позитивними результатами.

## Доходи

Загальний дохід за квартал склав 2,450,000 грн, що на 15% більше ніж у Q1 2025.

## Витрати

Операційні витрати: 1,820,000 грн
Фонд оплати праці: 980,000 грн

## Висновок

Компанія демонструє стабільне зростання. Прогноз на Q2 — збільшення доходів на 10%.`,
      department: "accounting",
      access: ["manager", "admin"],
      createdAt: "2026-04-10",
      createdBy: "u1",
    },
    {
      id: "d4",
      title: "IT стандарти розробки",
      content: `# IT Стандарти розробки WorkHub

## Мови та технології

Основний стек: HTML5, CSS3, JavaScript ES6+
Backend: Node.js, Express
База даних: PostgreSQL

## Правила написання коду

- Використовуй ESLint для перевірки коду
- Назви змінних — camelCase
- Коментарі обов'язкові для складної логіки
- Максимум 80 символів на рядок

## Git Flow

- main — продакшн гілка
- develop — розробка
- feature/* — нові функції
- Обов'язковий code review перед merge`,
      department: "it",
      access: ["employee", "manager", "admin"],
      createdAt: "2026-02-20",
      createdBy: "u2",
    },
  ],

  duties: [
    {
      id: "duty1",
      userId: "u3",
      title: "Щоденний code review",
      desc: "Перевіряти код колег щодня до 12:00",
    },
    {
      id: "duty2",
      userId: "u3",
      title: "Оновлення документації",
      desc: "Підтримувати технічну документацію в актуальному стані",
    },
    {
      id: "duty3",
      userId: "u3",
      title: "Участь у daily standup",
      desc: "Щоденна зустріч команди о 9:30",
    },
    {
      id: "duty4",
      userId: "u5",
      title: "Публікації в соцмережах",
      desc: "Публікувати 3 пости на тиждень згідно контент-плану",
    },
    {
      id: "duty5",
      userId: "u6",
      title: "Обробка рахунків",
      desc: "Опрацьовувати вхідні рахунки щодня до 16:00",
    },
  ],

  notes: [],

  accessLog: [],

  joinRequests: [],
};

// ══════════════════════════════════════════════
//  Функції роботи з даними
// ══════════════════════════════════════════════

function initData() {
  if (!localStorage.getItem(DB.USERS)) {
    localStorage.setItem(DB.USERS, JSON.stringify(INITIAL_DATA.users));
  }
  if (!localStorage.getItem(DB.DEPTS)) {
    localStorage.setItem(DB.DEPTS, JSON.stringify(INITIAL_DATA.departments));
  }
  if (!localStorage.getItem(DB.NEWS)) {
    localStorage.setItem(DB.NEWS, JSON.stringify(INITIAL_DATA.news));
  }
  if (!localStorage.getItem(DB.TASKS)) {
    localStorage.setItem(DB.TASKS, JSON.stringify(INITIAL_DATA.tasks));
  }
  if (!localStorage.getItem(DB.DOCS)) {
    localStorage.setItem(DB.DOCS, JSON.stringify(INITIAL_DATA.docs));
  }
  if (!localStorage.getItem(DB.DUTIES)) {
    localStorage.setItem(DB.DUTIES, JSON.stringify(INITIAL_DATA.duties));
  }
  if (!localStorage.getItem(DB.NOTES)) {
    localStorage.setItem(DB.NOTES, JSON.stringify(INITIAL_DATA.notes));
  }
  if (!localStorage.getItem(DB.LOG)) {
    localStorage.setItem(DB.LOG, JSON.stringify(INITIAL_DATA.accessLog));
  }
  if (!localStorage.getItem(DB.JOIN_REQ)) {
    localStorage.setItem(DB.JOIN_REQ, JSON.stringify(INITIAL_DATA.joinRequests));
  }
}

// ── Користувачі ──
function getUsers()  { return JSON.parse(localStorage.getItem(DB.USERS)) || []; }
function saveUsers(u){ localStorage.setItem(DB.USERS, JSON.stringify(u)); }
function getUserById(id) { return getUsers().find(u => u.id === id) || null; }
function getUserByEmail(email) { return getUsers().find(u => u.email === email) || null; }

// ── Відділи ──
function getDepts()  { return JSON.parse(localStorage.getItem(DB.DEPTS)) || {}; }
function getDept(id) { return getDepts()[id] || null; }

// ── Новини ──
function getNews(publicOnly = false) {
  const news = JSON.parse(localStorage.getItem(DB.NEWS)) || [];
  return publicOnly ? news.filter(n => n.public) : news;
}
function saveNews(n) { localStorage.setItem(DB.NEWS, JSON.stringify(n)); }
function addNews(item) {
  const news = getNews();
  item.id = "n" + Date.now();
  news.unshift(item);
  saveNews(news);
  return item;
}
function deleteNews(id) {
  saveNews(getNews().filter(n => n.id !== id));
}
function updateNews(id, data) {
  const news = getNews();
  const idx = news.findIndex(n => n.id === id);
  if (idx !== -1) { news[idx] = { ...news[idx], ...data }; saveNews(news); }
}

// ── Задачі ──
function getTasks() { return JSON.parse(localStorage.getItem(DB.TASKS)) || []; }
function saveTasks(t){ localStorage.setItem(DB.TASKS, JSON.stringify(t)); }
function getTasksByDept(dept) { return getTasks().filter(t => t.department === dept); }
function getTasksByUser(uid)  { return getTasks().filter(t => t.assignedTo === uid); }
function addTask(task) {
  const tasks = getTasks();
  task.id = "t" + Date.now();
  task.createdAt = new Date().toISOString().split("T")[0];
  tasks.push(task);
  saveTasks(tasks);
  return task;
}
function updateTask(id, data) {
  const tasks = getTasks();
  const idx = tasks.findIndex(t => t.id === id);
  if (idx !== -1) { tasks[idx] = { ...tasks[idx], ...data }; saveTasks(tasks); }
}
function deleteTask(id) { saveTasks(getTasks().filter(t => t.id !== id)); }

// ── Документи ──
function getDocs()  { return JSON.parse(localStorage.getItem(DB.DOCS)) || []; }
function saveDocs(d){ localStorage.setItem(DB.DOCS, JSON.stringify(d)); }
function getDocById(id) { return getDocs().find(d => d.id === id) || null; }
function getDocsByDept(dept, userRole) {
  return getDocs().filter(d =>
    (d.department === dept || d.department === null) &&
    d.access.includes(userRole)
  );
}
function addDoc(doc) {
  const docs = getDocs();
  doc.id = "d" + Date.now();
  doc.createdAt = new Date().toISOString().split("T")[0];
  docs.push(doc);
  saveDocs(docs);
  return doc;
}
function updateDoc(id, data) {
  const docs = getDocs();
  const idx = docs.findIndex(d => d.id === id);
  if (idx !== -1) { docs[idx] = { ...docs[idx], ...data }; saveDocs(docs); }
}
function deleteDoc(id) { saveDocs(getDocs().filter(d => d.id !== id)); }

// ── Нотатки ──
function getNotes(userId) {
  const all = JSON.parse(localStorage.getItem(DB.NOTES)) || [];
  return all.filter(n => n.userId === userId);
}
function saveAllNotes(notes) { localStorage.setItem(DB.NOTES, JSON.stringify(notes)); }
function addNote(note) {
  const all = JSON.parse(localStorage.getItem(DB.NOTES)) || [];
  note.id = "note" + Date.now();
  note.createdAt = new Date().toISOString().split("T")[0];
  all.push(note);
  saveAllNotes(all);
  return note;
}
function updateNote(id, data) {
  const all = JSON.parse(localStorage.getItem(DB.NOTES)) || [];
  const idx = all.findIndex(n => n.id === id);
  if (idx !== -1) { all[idx] = { ...all[idx], ...data }; saveAllNotes(all); }
}
function deleteNote(id) {
  const all = JSON.parse(localStorage.getItem(DB.NOTES)) || [];
  saveAllNotes(all.filter(n => n.id !== id));
}

// ── Обов'язки ──
function getDuties(userId) {
  const all = JSON.parse(localStorage.getItem(DB.DUTIES)) || [];
  return all.filter(d => d.userId === userId);
}

// ── Журнал доступу ──
function getLog()   { return JSON.parse(localStorage.getItem(DB.LOG)) || []; }
function addLog(entry) {
  const log = getLog();
  entry.id  = "log" + Date.now();
  entry.timestamp = new Date().toLocaleString("uk-UA");
  log.unshift(entry);
  if (log.length > 200) log.pop();
  localStorage.setItem(DB.LOG, JSON.stringify(log));
}

// ── Заявки ──
function getJoinRequests() { return JSON.parse(localStorage.getItem(DB.JOIN_REQ)) || []; }
function addJoinRequest(req) {
  const reqs = getJoinRequests();
  req.id = "jr" + Date.now();
  req.date = new Date().toLocaleDateString("uk-UA");
  req.status = "pending";
  reqs.unshift(req);
  localStorage.setItem(DB.JOIN_REQ, JSON.stringify(reqs));
}

// ── Генерація ID ──
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

// ── Ініціалізація ──
initData();
