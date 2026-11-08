import "./style.css";
import { Store } from "./store";
import type { Task, TaskInput, FilterStatus, SortBy } from "./types";
import { daysLeft, deadlineLabel, formatDate, sortItems, computeDetailedStats, computeReminder } from "./utils";

const appName: string = import.meta.env.VITE_APP_NAME ?? "Daftar Tugas";
const appVersion: string = import.meta.env.VITE_APP_VERSION ?? "0.0.0";
let editingId: number | null = null;
let currentFilter: FilterStatus = "Semua"; // Status filter aktif
let currentSort: SortBy = "deadline";

const comparators: Record<SortBy, (a: Task, b: Task) => number> = {
  deadline: (a, b) => {
    if (a.status !== b.status) return a.status === "Belum Selesai" ? -1 : 1;
    return a.deadline.localeCompare(b.deadline);
  },
  terbaru: (a, b) => b.id - a.id,
  nama: (a, b) => a.title.localeCompare(b.title, "id"),
};
const sortSelect = document.getElementById("sort-select") as HTMLSelectElement;
let pendingDeleteId: number | null = null; // Menyimpan ID tugas untuk modal hapus

const store = new Store<Task>("tasks");

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const form = $<HTMLFormElement>("task-form");
const list = $<HTMLUListElement>("task-list");
const title = $<HTMLInputElement>("title");
const course = $<HTMLInputElement>("course");
const deadline = $<HTMLInputElement>("deadline");
const submitBtn = $<HTMLButtonElement>("submit-btn");
const cancelBtn = $<HTMLButtonElement>("cancel-btn");

const todayStr = (): string => new Date().toLocaleDateString("sv-SE"); // YYYY-MM-DD

function resetFormMode(): void {
  editingId = null;
  form.reset();
  submitBtn.textContent = "Tambah Tugas";
  cancelBtn.hidden = true;
}
const searchInput = document.getElementById("search-input") as HTMLInputElement;
const statsEl = document.getElementById("stats") as HTMLElement;
const filtersContainer = document.getElementById("filters");
const statsDetail = document.getElementById("stats-detail");
const reminderEl = document.getElementById("reminder-banner");

// Elemen Modal Kustom & Toast
const confirmModal = document.getElementById("confirm-modal");
const btnCancelModal = document.getElementById("modal-cancel");
const btnConfirmModal = document.getElementById("modal-confirm");

$("app-title").textContent = appName;
$("app-version").textContent = `v${appVersion}`;
document.title = appName;

const escapeHtml = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// Fungsi Toast Notification
function showToast(message: string, type: "success" | "danger" = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.className = "toast";
  }, 3000);
}

function renderDetailedStats(tasks: Task[]): void {
  if (!statsDetail) return;
  const s = computeDetailedStats(tasks);
  const wasOpen = statsDetail.querySelector("details")?.open ?? false;

  const courses = Object.entries(s.perCourse)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => `<li><span>${escapeHtml(name)}</span><strong>${count}</strong></li>`)
    .join("");

  statsDetail.innerHTML = `
    <div class="stat-card stat-late"><strong>${s.lewat}</strong><span>Lewat deadline</span></div>
    <div class="stat-card stat-week"><strong>${s.mingguIni}</strong><span>7 hari ke depan</span></div>
    <div class="stat-card stat-done"><strong>${s.selesai}</strong><span>Selesai</span></div>
    ${
      courses
        ? `<details class="course-stats" ${wasOpen ? "open" : ""}>
            <summary>Tugas per mata kuliah</summary>
            <ul>${courses}</ul>
          </details>`
        : ""
    }`;
}

function renderReminder(tasks: Task[]): void {
  if (!reminderEl) return;
  const r = computeReminder(tasks);

  if (r.today === 0 && r.late === 0) {
    reminderEl.hidden = true;
    return;
  }

  const parts: string[] = [];
  if (r.late > 0) parts.push(`${r.late} tugas lewat deadline`);
  if (r.today > 0) parts.push(`${r.today} tugas jatuh tempo hari ini`);

  reminderEl.className = `reminder ${r.late > 0 ? "reminder-late" : "reminder-today"}`;
  reminderEl.textContent = `⏰ ${parts.join(" • ")}`;
  reminderEl.hidden = false;
}

function render(): void {
  const allTasks = store.getAll();
  const keyword = searchInput ? searchInput.value.toLowerCase() : "";

  // Filter berdasarkan status & pencarian teks
  const filteredTasks = allTasks.filter((task) => {
    const matchesFilter =
      currentFilter === "Semua" ||
      (currentFilter === "Selesai" && task.status === "Selesai") ||
      (currentFilter === "Belum Selesai" && task.status === "Belum Selesai");

    const matchesSearch =
      task.title.toLowerCase().includes(keyword) ||
      task.course.toLowerCase().includes(keyword);

    return matchesFilter && matchesSearch;
  });

  // Hitung statistik tugas
  const total = allTasks.length;
  const completedCount = allTasks.filter((t) => t.status === "Selesai").length;
  const percent = total === 0 ? 0 : Math.round((completedCount / total) * 100);
  if (statsEl) {
    statsEl.textContent = `Total: ${total} tugas | Selesai: ${completedCount} | Belum: ${total - completedCount} | ${percent}%`;
  }
  const bar = document.getElementById("progress-bar");
  if (bar) bar.style.width = `${percent}%`;

   renderDetailedStats(allTasks);
   renderReminder(allTasks);

    if (filteredTasks.length === 0) {
    list.innerHTML = `
      <li class="empty-state">
        <span class="empty-icon">${total === 0 ? "📝" : "🔍"}</span>
        <p>${total === 0 ? "Belum ada tugas. Tambahkan tugas pertamamu di atas!" : "Tidak ada tugas yang cocok."}</p>
      </li>`;
    return;
  }

  const sortedTasks = sortItems(filteredTasks, comparators[currentSort]);

  list.innerHTML = sortedTasks
    .map((t) => {
      const days = daysLeft(t.deadline);
      const done = t.status === "Selesai";
      const late = !done && days < 0;
      const urgent = !done && days >= 0 && days <= 1;
      const state = done ? "is-done" : late ? "is-late" : urgent ? "is-urgent" : "is-pending";
      const chip = done ? "" : `<span class="chip ${late ? "chip-late" : urgent ? "chip-urgent" : ""}">${deadlineLabel(days)}</span>`;

      return `
    <li class="task-item ${state}">
      <div class="task-info">
        <h3>${escapeHtml(t.title)}</h3>
        <div class="task-meta">
          <span class="meta-course">📚 ${escapeHtml(t.course)}</span>
          <span class="meta-deadline">📅 ${formatDate(t.deadline)} ${chip}</span>
          <span class="badge ${done ? "selesai" : "belum"}">${t.status}</span>
        </div>
      </div>
      <div class="task-actions">
        <button data-act="toggle" data-id="${t.id}" class="btn-toggle">${done ? "↩ Batalkan" : "✓ Selesai"}</button>
        <button data-act="edit" data-id="${t.id}" class="btn-edit">Edit</button>
        <button data-act="delete" data-id="${t.id}" class="btn-delete">Hapus</button>
      </div>
    </li>`;
    })
    .join("");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const input: TaskInput = {
    title: title.value.trim(),
    course: course.value.trim(),
    deadline: deadline.value,
  };

  if (!input.title || !input.course) {
    showToast("Judul dan mata kuliah tidak boleh kosong", "danger");
    return;
  }

  // Tugas baru tidak boleh punya deadline yang sudah lewat
  if (editingId === null && input.deadline < todayStr()) {
    showToast("Deadline sudah lewat, pilih hari ini atau setelahnya", "danger");
    deadline.focus();
    return;
  }

  if (editingId !== null) {
    store.update(editingId, input);
    showToast("Tugas berhasil diperbarui!", "success");
  } else {
    store.add({ id: Date.now(), status: "Belum Selesai", ...input });
    showToast("Tugas berhasil ditambahkan!", "success");
  }

  resetFormMode();
  title.focus();
  render();
});

cancelBtn.addEventListener("click", () => {
  resetFormMode();
  showToast("Edit dibatalkan", "success");
});

// Event listener untuk tombol aksi di dalam list (Toggle, Edit, Hapus)
list.addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest("button");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const task = store.getAll().find((t) => t.id === id);
  if (!task) return;

  if (btn.dataset.act === "delete") {
    // Gunakan modal kustom pengganti confirm() bawaan browser
    pendingDeleteId = id;
    if (confirmModal) confirmModal.classList.add("show");
  } else if (btn.dataset.act === "toggle") {
    const newStatus = task.status === "Selesai" ? "Belum Selesai" : "Selesai";
    store.update(id, { status: newStatus });
    showToast(`Status diubah menjadi ${newStatus}`, "success");
    } else if (btn.dataset.act === "edit") {
    title.value = task.title;
    course.value = task.course;
    deadline.value = task.deadline;
    editingId = id;
    submitBtn.textContent = "Simpan Perubahan";
    cancelBtn.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
    title.focus({ preventScroll: true });
  }
  render();
});

// Logika Tombol Batal pada Modal Konfirmasi Hapus
if (btnCancelModal && confirmModal) {
  btnCancelModal.addEventListener("click", () => {
    confirmModal.classList.remove("show");
    pendingDeleteId = null;
  });
}

// Logika Tombol Konfirmasi Hapus pada Modal Kustom
if (btnConfirmModal && confirmModal) {
  btnConfirmModal.addEventListener("click", () => {
    if (pendingDeleteId !== null) {
      store.remove(pendingDeleteId);
      showToast("Tugas berhasil dihapus!", "danger");
      pendingDeleteId = null;
      render();
    }
    confirmModal.classList.remove("show");
  });
}

// Event listener untuk kotak pencarian (Real-time search)
if (searchInput) {
  searchInput.addEventListener("input", () => {
    render();
  });
}


if (sortSelect) {
  sortSelect.addEventListener("change", () => {
    currentSort = sortSelect.value as SortBy;
    render();
  });
}

// Event listener untuk tombol filter (Semua, Belum Selesai, Selesai)
if (filtersContainer) {
  filtersContainer.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest("button");
    if (!btn) return;
    
    // Hapus kelas active dari semua tombol filter secara aman
    filtersContainer.querySelectorAll("button").forEach((el) => {
      (el as HTMLElement).classList.remove("active");
    });
    
    // Tambahkan kelas active ke tombol yang sedang diklik
    btn.classList.add("active");

    currentFilter = btn.getAttribute("data-filter") as FilterStatus;
    render();
  });
}

render();