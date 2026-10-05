// ═══════════════════════════════════════════
//  WorkHub — Логіка документів
// ═══════════════════════════════════════════

let docsSession    = null;
let currentDocId   = null;
let selectionData  = null;

// ── Ініціалізація ──────────────────────────
function initDocs(session) {
  docsSession = session;
  renderSidebarUser(session);
  renderTopbarUser(session);
  renderDocsList(session);
  initSelectionHandler();

  // Перевірити чи треба підсвітити параграф (прийшли з нотаток)
  const highlight = sessionStorage.getItem("wh_highlight_doc");
  if (highlight) {
    sessionStorage.removeItem("wh_highlight_doc");
    const data = JSON.parse(highlight);
    setTimeout(() => {
      openDoc(data.docId, data.paraIndex);
    }, 300);
  }
}

// ── Рендер списку документів ───────────────
function renderDocsList(session) {
  const el   = document.getElementById("docsList");
  if (!el) return;

  const docs = session.department
    ? getDocsByDept(session.department, session.role)
    : getDocs().filter(d => d.access.includes(session.role));

  if (!docs.length) {
    el.innerHTML = `<div class="notes-empty">Документів немає</div>`;
    return;
  }

  el.innerHTML = docs.map(d => `
    <div
      class="doc-list-item ${d.id === currentDocId ? "active" : ""}"
      onclick="openDoc('${d.id}')"
    >
      <div class="dli-icon">📄</div>
      <div class="dli-info">
        <div class="dli-title">${escHtml(d.title)}</div>
        <div class="dli-date">${formatDate(d.createdAt)}</div>
      </div>
    </div>
  `).join("");
}

// ── Відкрити документ ──────────────────────
function openDoc(docId, highlightParaIndex = null) {
  currentDocId = docId;
  const doc    = getDocById(docId);
  if (!doc) return;

  // Оновити активний у списку
  document.querySelectorAll(".doc-list-item").forEach(el => {
    el.classList.toggle("active", el.onclick?.toString().includes(docId));
  });

  // Показати вміст
  document.getElementById("docsEmptyState").style.display  = "none";
  document.getElementById("docContentWrap").style.display  = "block";

  // Заголовок
  document.getElementById("docTitle").textContent = doc.title;
  document.getElementById("docMeta").textContent  =
    `Створено: ${formatDate(doc.createdAt)} · Доступ: ${doc.access.map(r => ROLE_LABELS[r]).join(", ")}`;

  // Кнопки для менеджера/адміна
  const actionsEl = document.getElementById("docActions");
  if (docsSession && (docsSession.role === "manager" || docsSession.role === "admin")) {
    actionsEl.innerHTML = `
      <button class="btn-secondary btn-sm" onclick="location.href='admin.html'">
        ✏️ Редагувати
      </button>
    `;
  } else {
    actionsEl.innerHTML = "";
  }

  // Рендер вмісту
  renderDocContent(doc, highlightParaIndex);
}

// ── Рендер вмісту документа (Markdown-like) ─
function renderDocContent(doc, highlightParaIndex = null) {
  const el = document.getElementById("docContent");
  if (!el) return;

  const lines = (doc.content || "").split("\n");
  let html    = "";
  let paraIdx = 0;

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    const isHighlighted = highlightParaIndex !== null && paraIdx === highlightParaIndex;
    const hlClass = isHighlighted ? " highlighted-para" : "";

    if (trimmed.startsWith("# ")) {
      html += `<h1 class="doc-h1${hlClass}" data-para="${paraIdx}">${escHtml(trimmed.slice(2))}</h1>`;
    } else if (trimmed.startsWith("## ")) {
      html += `<h2 class="doc-h2${hlClass}" data-para="${paraIdx}">${escHtml(trimmed.slice(3))}</h2>`;
    } else if (trimmed.startsWith("### ")) {
      html += `<h3 class="doc-h3${hlClass}" data-para="${paraIdx}">${escHtml(trimmed.slice(4))}</h3>`;
    } else if (/^\d+\./.test(trimmed)) {
      html += `<div class="doc-list-item-text${hlClass}" data-para="${paraIdx}">${escHtml(trimmed)}</div>`;
    } else if (trimmed.startsWith("-")) {
      html += `<div class="doc-bullet${hlClass}" data-para="${paraIdx}">
        <span class="doc-bullet-dot">•</span>${escHtml(trimmed.slice(1).trim())}
      </div>`;
    } else {
      html += `<p class="doc-para${hlClass}" data-para="${paraIdx}">${escHtml(trimmed)}</p>`;
    }

    paraIdx++;
  });

  el.innerHTML = html;

  // Прокрутити до підсвіченого параграфа
  if (highlightParaIndex !== null) {
    setTimeout(() => {
      const highlighted = el.querySelector(".highlighted-para");
      if (highlighted) {
        highlighted.scrollIntoView({ behavior: "smooth", block: "center" });
        // Анімація підсвічування
        highlighted.classList.add("highlight-pulse");
        setTimeout(() => highlighted.classList.remove("highlight-pulse"), 3000);
      }
    }, 200);
  }
}

// ── Обробник виділення тексту ──────────────
function initSelectionHandler() {
  const popup = document.getElementById("selectionPopup");
  if (!popup) return;

  document.addEventListener("mouseup", e => {
    // Якщо клік на popup — не закривати
    if (popup.contains(e.target)) return;

    const selection = window.getSelection();
    const text      = selection?.toString().trim();

    if (text && text.length > 3) {
      // Знайти параграф
      const range    = selection.getRangeAt(0);
      const paraEl   = range.startContainer.parentElement?.closest("[data-para]");
      const paraIndex = paraEl ? parseInt(paraEl.dataset.para) : null;

      // Зберегти дані виділення
      selectionData = {
        text,
        paraIndex,
      };

      // Показати popup поруч з виділенням
      const rect = range.getBoundingClientRect();
      popup.style.display = "flex";
      popup.style.top  = `${rect.top + window.scrollY - 44}px`;
      popup.style.left = `${rect.left + rect.width / 2 - 80}px`;
    } else {
      popup.style.display = "none";
      selectionData = null;
    }
  });

  // Закрити popup при кліку в будь-яке місце
  document.addEventListener("mousedown", e => {
    if (!popup.contains(e.target)) {
      popup.style.display = "none";
    }
  });
}

// ── Додати виділений текст в нотатки ───────
function addSelectionToNote() {
  if (!selectionData || !currentDocId) return;

  const doc = getDocById(currentDocId);
  if (!doc) return;

  // Зберегти в sessionStorage і перейти на сторінку нотаток
  sessionStorage.setItem("wh_pending_note", JSON.stringify({
    docId:      currentDocId,
    docTitle:   doc.title,
    quotedText: selectionData.text,
    paraIndex:  selectionData.paraIndex,
  }));

  // Закрити popup
  document.getElementById("selectionPopup").style.display = "none";
  window.getSelection()?.removeAllRanges();

  showToast("Відкриваємо нотатки...", "success");
  setTimeout(() => { window.location.href = "notes.html"; }, 600);
}

// ── Копіювати виділений текст ──────────────
function copySelection() {
  if (!selectionData) return;
  navigator.clipboard?.writeText(selectionData.text).then(() => {
    showToast("Скопійовано в буфер обміну", "success");
    document.getElementById("selectionPopup").style.display = "none";
    window.getSelection()?.removeAllRanges();
  });
}
