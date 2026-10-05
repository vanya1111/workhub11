// ═══════════════════════════════════════════
//  WorkHub — Логіка нотаток
// ═══════════════════════════════════════════

let currentSession  = null;
let currentNoteId   = null;
let currentFilter   = "all";
let allNotes        = [];

// ── Ініціалізація ──────────────────────────
function initNotes(session) {
  currentSession = session;
  renderSidebarUser(session);
  renderTopbarUser(session);
  loadNotes();

  // Якщо прийшли з документа (передали noteData через sessionStorage)
  const pending = sessionStorage.getItem("wh_pending_note");
  if (pending) {
    sessionStorage.removeItem("wh_pending_note");
    const data = JSON.parse(pending);
    createNoteFromDoc(data);
  }
}

// ── Завантажити нотатки ────────────────────
function loadNotes() {
  allNotes = getNotes(currentSession.id);
  renderNotesList(allNotes);
}

// ── Рендер списку ──────────────────────────
function renderNotesList(notes) {
  const el = document.getElementById("notesList");
  if (!el) return;

  const filtered = notes.filter(n => {
    if (currentFilter === "plain")  return !n.docId;
    if (currentFilter === "linked") return !!n.docId;
    return true;
  });

  if (!filtered.length) {
    el.innerHTML = `<div class="notes-empty">
      ${currentFilter === "linked" ? "Нотаток з документів немає" : "Нотаток поки немає"}
    </div>`;
    return;
  }

  el.innerHTML = filtered.map(n => `
    <div
      class="note-list-item ${n.id === currentNoteId ? "active" : ""}"
      onclick="openNote('${n.id}')"
    >
      <div class="nli-title">${escHtml(n.title || "Без назви")}</div>
      <div class="nli-preview">${escHtml(n.text || "").substring(0, 60) || "Порожня нотатка"}</div>
      <div class="nli-meta">
        <span class="nli-date">${formatDate(n.createdAt)}</span>
        ${n.docId ? `<span class="nli-linked">📎 З документа</span>` : ""}
      </div>
    </div>
  `).join("");
}

// ── Відкрити нотатку ───────────────────────
function openNote(id) {
  currentNoteId = id;
  const note = allNotes.find(n => n.id === id);
  if (!note) return;

  // Оновити active в списку
  document.querySelectorAll(".note-list-item").forEach(el => {
    el.classList.toggle("active", el.onclick?.toString().includes(id));
  });
  // Простіше — перерендеримо
  renderNotesList(allNotes);

  // Показати форму
  showEditor();

  // Заповнити поля
  document.getElementById("noteTitle").value = note.title || "";
  document.getElementById("noteText").value  = note.text  || "";

  // Лінк на документ
  const docLink    = document.getElementById("noteDocLink");
  const quotedText = document.getElementById("noteQuotedText");

  if (note.docId) {
    const doc = getDocById(note.docId);
    docLink.style.display = "flex";
    document.getElementById("ndlDocName").textContent = doc ? doc.title : "Документ видалено";

    if (note.quotedText) {
      quotedText.style.display = "block";
      document.getElementById("nqtContent").textContent = note.quotedText;
    } else {
      quotedText.style.display = "none";
    }
  } else {
    docLink.style.display    = "none";
    quotedText.style.display = "none";
  }

  // Мета
  document.getElementById("noteMeta").textContent =
    `Створено: ${formatDate(note.createdAt)}`;
}

// ── Показати редактор ──────────────────────
function showEditor() {
  document.getElementById("notesEmptyState").style.display = "none";
  document.getElementById("noteEditForm").style.display    = "flex";
}

// ── Приховати редактор ─────────────────────
function hideEditor() {
  document.getElementById("notesEmptyState").style.display = "flex";
  document.getElementById("noteEditForm").style.display    = "none";
  currentNoteId = null;
}

// ── Нова нотатка ───────────────────────────
function createNote() {
  const note = addNote({
    userId:     currentSession.id,
    title:      "",
    text:       "",
    docId:      null,
    quotedText: null,
    paraIndex:  null,
  });
  allNotes.unshift(note);
  renderNotesList(allNotes);
  openNote(note.id);
  document.getElementById("noteTitle")?.focus();
}

// ── Нотатка з документа ────────────────────
function createNoteFromDoc(data) {
  // data = { docId, docTitle, quotedText, paraIndex }
  const note = addNote({
    userId:     currentSession.id,
    title:      `З документа: ${data.docTitle}`,
    text:       "",
    docId:      data.docId,
    quotedText: data.quotedText,
    paraIndex:  data.paraIndex,
  });
  allNotes.unshift(note);
  renderNotesList(allNotes);
  openNote(note.id);
  showToast("Нотатку створено з документа!", "success");
}

// ── Зберегти поточну нотатку ───────────────
function saveCurrentNote() {
  if (!currentNoteId) return;

  const title = document.getElementById("noteTitle")?.value.trim() || "";
  const text  = document.getElementById("noteText")?.value.trim()  || "";

  updateNote(currentNoteId, { title, text });

  // Оновити в локальному масиві
  const idx = allNotes.findIndex(n => n.id === currentNoteId);
  if (idx !== -1) {
    allNotes[idx].title = title;
    allNotes[idx].text  = text;
  }

  renderNotesList(allNotes);
  showToast("Нотатку збережено ✅", "success");
}

// ── Видалити поточну нотатку ───────────────
function deleteCurrentNote() {
  if (!currentNoteId) return;
  if (!confirm("Видалити цю нотатку?")) return;

  deleteNote(currentNoteId);
  allNotes = allNotes.filter(n => n.id !== currentNoteId);
  hideEditor();
  renderNotesList(allNotes);
  showToast("Нотатку видалено", "success");
}

// ── Перейти до пов'язаного документа ───────
function goToLinkedDoc() {
  const note = allNotes.find(n => n.id === currentNoteId);
  if (!note || !note.docId) return;

  // Зберігаємо в sessionStorage інфо про те яку нотатку відкрили
  sessionStorage.setItem("wh_highlight_doc", JSON.stringify({
    docId:     note.docId,
    paraIndex: note.paraIndex,
    noteId:    note.id,
  }));

  window.location.href = "docs.html";
}

// ── Фільтрація ─────────────────────────────
function filterNotes(type, btn) {
  currentFilter = type;
  document.querySelectorAll(".notes-filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderNotesList(allNotes);
}

// ── Автозбереження при Ctrl+S ──────────────
document.addEventListener("keydown", e => {
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
    saveCurrentNote();
  }
});
