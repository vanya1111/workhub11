// ═══════════════════════════════════════════
//  WorkHub — Авторизація та сесії
// ═══════════════════════════════════════════

// ── Ролі та їх рівні ──
const ROLES = {
  guest:    0,
  user:     1,
  employee: 2,
  manager:  3,
  admin:    4,
};

const ROLE_LABELS = {
  guest:    "Гість",
  user:     "Користувач",
  employee: "Співробітник",
  manager:  "Керівник",
  admin:    "Адміністратор",
};

// ── Сесія ──────────────────────────────────
function getSession() {
  const s = sessionStorage.getItem(DB.SESSION);
  return s ? JSON.parse(s) : null;
}

function setSession(user) {
  const session = {
    id:         user.id,
    name:       user.name,
    email:      user.email,
    role:       user.role,
    department: user.department,
    position:   user.position,
    avatar:     user.avatar,
    avatarColor:user.avatarColor,
  };
  sessionStorage.setItem(DB.SESSION, JSON.stringify(session));
  return session;
}

function clearSession() {
  sessionStorage.removeItem(DB.SESSION);
}

function isLoggedIn() {
  return getSession() !== null;
}

function hasRole(minRole) {
  const session = getSession();
  if (!session) return false;
  return (ROLES[session.role] || 0) >= (ROLES[minRole] || 0);
}

function isEmployee() {
  const s = getSession();
  return s && (s.role === "employee" || s.role === "manager" || s.role === "admin");
}

// ── Логін ──────────────────────────────────
function login(emailOrLogin, password) {
  const users = getUsers();
  const user  = users.find(
    u => (u.email === emailOrLogin.trim().toLowerCase()) && u.password === password
  );

  if (!user) {
    addLog({ action: "LOGIN_FAIL", email: emailOrLogin, role: "—", detail: "Невірний логін або пароль" });
    return { ok: false, message: "Невірний логін або пароль" };
  }

  if (user.blocked) {
    addLog({ action: "LOGIN_BLOCKED", email: emailOrLogin, role: user.role, detail: "Акаунт заблокований" });
    return { ok: false, message: "Акаунт заблоковано. Зверніться до адміністратора." };
  }

  const session = setSession(user);
  addLog({ action: "LOGIN_OK", email: user.email, role: user.role, detail: `Вхід: ${user.name}` });

  return { ok: true, session };
}

// ── Реєстрація (публічний user) ────────────
function register(name, email, password) {
  const trimEmail = email.trim().toLowerCase();

  if (!name.trim())         return { ok: false, message: "Введіть ім'я" };
  if (!trimEmail)           return { ok: false, message: "Введіть email" };
  if (password.length < 6) return { ok: false, message: "Пароль мінімум 6 символів" };

  const existing = getUserByEmail(trimEmail);
  if (existing) return { ok: false, message: "Акаунт з таким email вже існує" };

  const initials = name.trim().split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
  const colors   = [
    "linear-gradient(135deg,#7C3AED,#3B82F6)",
    "linear-gradient(135deg,#059669,#0EA5E9)",
    "linear-gradient(135deg,#DC2626,#F59E0B)",
    "linear-gradient(135deg,#7C3AED,#EC4899)",
  ];
  const avatarColor = colors[Math.floor(Math.random() * colors.length)];

  const newUser = {
    id:          genId(),
    name:        name.trim(),
    email:       trimEmail,
    password,
    role:        "user",
    department:  null,
    position:    "Публічний користувач",
    avatar:      initials,
    avatarColor,
    createdAt:   new Date().toISOString().split("T")[0],
    blocked:     false,
  };

  const users = getUsers();
  users.push(newUser);
  saveUsers(users);

  addLog({ action: "REGISTER", email: trimEmail, role: "user", detail: `Реєстрація: ${name}` });

  return { ok: true, user: newUser };
}

// ── Вихід ──────────────────────────────────
function logout() {
  const s = getSession();
  if (s) addLog({ action: "LOGOUT", email: s.email, role: s.role, detail: `Вихід: ${s.name}` });
  clearSession();
  window.location.href = getRootPath() + "index.html";
}

// ── Захист сторінки ────────────────────────
// minRole: мінімальна роль для доступу
// redirectUrl: куди редиректити якщо немає доступу
function requireAuth(minRole = "user", redirectUrl = null) {
  const session = getSession();

  if (!session) {
    addLog({ action: "ACCESS_DENIED", email: "—", role: "guest", detail: `Спроба доступу без авторизації: ${location.pathname}` });
    window.location.href = getRootPath() + "index.html";
    return null;
  }

  if (session.blocked) {
    clearSession();
    window.location.href = getRootPath() + "index.html";
    return null;
  }

  if (ROLES[session.role] < ROLES[minRole]) {
    addLog({ action: "ACCESS_DENIED", email: session.email, role: session.role, detail: `Недостатньо прав: ${location.pathname}` });
    window.location.href = redirectUrl || (getRootPath() + "pages/forbidden.html");
    return null;
  }

  addLog({ action: "ACCESS_OK", email: session.email, role: session.role, detail: `Доступ: ${location.pathname}` });
  return session;
}

// ── Тільки для внутрішніх (employee+) ──────
function requireEmployee(redirectUrl = null) {
  return requireAuth("employee", redirectUrl);
}

// ── Тільки для адміна ──────────────────────
function requireAdmin(redirectUrl = null) {
  return requireAuth("admin", redirectUrl);
}

// ── Визначити шлях до кореня ───────────────
function getRootPath() {
  const path = location.pathname;
  if (path.includes("/pages/")) return "../";
  return "./";
}

// ── Редирект після входу ───────────────────
function redirectByRole(role) {
  const root = getRootPath();
  switch(role) {
    case "admin":
      window.location.href = root + "pages/admin.html";
      break;
    case "manager":
    case "employee":
      window.location.href = root + "pages/dashboard.html";
      break;
    default:
      window.location.href = root + "pages/public-profile.html";
  }
}
