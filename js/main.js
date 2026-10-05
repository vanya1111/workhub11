// ═══════════════════════════════════════════
//  WorkHub — Логіка головної сторінки
// ═══════════════════════════════════════════

// ── Navbar scroll ──────────────────────────
window.addEventListener("scroll", () => {
  const nav = document.getElementById("navbar");
  if (nav) nav.classList.toggle("scrolled", window.scrollY > 20);
});

// ── Burger menu ────────────────────────────
function toggleMenu() {
  const links = document.getElementById("navLinks");
  if (links) links.classList.toggle("open");
}

// Закрити меню при кліку на посилання
document.querySelectorAll(".nav-links a").forEach(a => {
  a.addEventListener("click", () => {
    document.getElementById("navLinks")?.classList.remove("open");
  });
});

// ── Модальні вікна ─────────────────────────
function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove("active");
  document.body.style.overflow = "";
  clearModalErrors();
}

function closeModalOutside(event, id) {
  if (event.target === event.currentTarget) closeModal(id);
}

function switchModal(fromId, toId) {
  closeModal(fromId);
  setTimeout(() => openModal(toId), 150);
}

// Escape для закриття
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    closeModal("loginModal");
    closeModal("registerModal");
  }
});

function clearModalErrors() {
  ["loginError", "registerError", "registerSuccess"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
}

// ── Показати/приховати пароль ──────────────
function togglePass(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === "password") {
    input.type = "text";
    btn.textContent = "🙈";
  } else {
    input.type = "password";
    btn.textContent = "👁";
  }
}

// ── Логін ──────────────────────────────────
function handleLogin(event) {
  event.preventDefault();

  const email    = document.getElementById("loginEmail")?.value.trim() || "";
  const password = document.getElementById("loginPassword")?.value || "";
  const errorEl  = document.getElementById("loginError");

  if (!email || !password) {
    showError(errorEl, "Заповніть всі поля");
    return;
  }

  const result = login(email, password);

  if (!result.ok) {
    showError(errorEl, result.message);
    shakeModal("loginModal");
    return;
  }

  closeModal("loginModal");
  showToast("Вхід успішний! Завантаження...", "success");

  setTimeout(() => redirectByRole(result.session.role), 800);
}

// ── Реєстрація ─────────────────────────────
function handleRegister(event) {
  event.preventDefault();

  const name      = document.getElementById("regName")?.value.trim() || "";
  const email     = document.getElementById("regEmail")?.value.trim() || "";
  const password  = document.getElementById("regPassword")?.value || "";
  const errorEl   = document.getElementById("registerError");
  const successEl = document.getElementById("registerSuccess");

  if (!name || !email || !password) {
    showError(errorEl, "Заповніть всі поля");
    return;
  }

  const result = register(name, email, password);

  if (!result.ok) {
    showError(errorEl, result.message);
    shakeModal("registerModal");
    return;
  }

  // Показати успіх
  errorEl.style.display = "none";
  successEl.style.display = "block";
  successEl.textContent = "✅ Реєстрація успішна! Переходимо...";

  // Автоматично логінимо
  const loginResult = login(email, password);
  if (loginResult.ok) {
    setTimeout(() => {
      closeModal("registerModal");
      showToast("Ласкаво просимо до WorkHub!", "success");
      setTimeout(() => redirectByRole(loginResult.session.role), 600);
    }, 1000);
  }
}

// ── Форма «Хочеш до нас?» ──────────────────
function submitJoinForm(event) {
  event.preventDefault();

  const form    = event.target;
  const inputs  = form.querySelectorAll("input, select, textarea");
  const data    = {};

  inputs.forEach(input => {
    if (input.name || input.placeholder) {
      const key = input.placeholder || input.name || "field";
      data[key] = input.value;
    }
  });

  addJoinRequest({
    name:       form.querySelector("input[type='text']")?.value || "",
    email:      form.querySelector("input[type='email']")?.value || "",
    department: form.querySelector("select")?.value || "",
    message:    form.querySelector("textarea")?.value || "",
  });

  // Замінити форму на повідомлення про успіх
  const wrapper = form.parentElement;
  form.style.display = "none";

  const success = document.createElement("div");
  success.className = "join-success";
  success.innerHTML = `
    <div class="join-success-icon">✅</div>
    <h3>Заявку відправлено!</h3>
    <p>Дякуємо за інтерес до WorkHub. Ми розглянемо вашу заявку та зв'яжемось з вами найближчим часом.</p>
  `;
  wrapper.appendChild(success);

  showToast("Заявку успішно відправлено!", "success");
}

// ── Хелпери ────────────────────────────────
function showError(el, message) {
  if (!el) return;
  el.textContent = message;
  el.style.display = "block";
}

function shakeModal(id) {
  const modal = document.querySelector(`#${id} .modal`);
  if (!modal) return;
  modal.classList.add("shake");
  setTimeout(() => modal.classList.remove("shake"), 500);
}

// ── Toast ───────────────────────────────────
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className   = `toast ${type} show`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.className = "toast"; }, 3000);
}

// ── Активний пункт меню при скролі ─────────
const sections = document.querySelectorAll("section[id]");
const navItems = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach(section => {
    const top = section.offsetTop - 100;
    if (window.scrollY >= top) current = section.getAttribute("id");
  });
  navItems.forEach(a => {
    a.classList.remove("active-link");
    if (a.getAttribute("href") === `#${current}`) a.classList.add("active-link");
  });
});

// ── Якщо вже залогінений ───────────────────
(function checkAlreadyLoggedIn() {
  const session = getSession();
  if (session) {
    // Показати кнопку «Перейти в систему» замість входу/реєстрації
    const actions = document.querySelector(".nav-actions");
    if (actions) {
      actions.innerHTML = `
        <span class="nav-user-greeting">Привіт, ${session.name.split(" ")[0]} 👋</span>
        <button class="btn-primary" onclick="redirectByRole('${session.role}')">
          Перейти в систему
        </button>
        <button class="btn-ghost" onclick="logout()">Вийти</button>
      `;
    }
  }
})();

// ── Анімація появи елементів при скролі ────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(".feature-card, .dept-card, .news-card, .team-card").forEach(el => {
  el.classList.add("animate-on-scroll");
  observer.observe(el);
});
