import "./style.css";
import { Store } from "./store";
import type { Task, TaskInput, FilterStatus } from "./types";

const appName: string = import.meta.env.VITE_APP_NAME ?? "Daftar Tugas";
const appVersion: string = import.meta.env.VITE_APP_VERSION ?? "0.0.0";
let editingId: number | null = null;
let currentFilter: FilterStatus = "Semua"; // Status filter aktif
let pendingDeleteId: number | null = null; // Menyimpan ID tugas untuk modal hapus

const store = new Store<Task>("tasks");

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const form = $<HTMLFormElement>("task-form");
const list = $<HTMLUListElement>("task-list");
const title = $<HTMLInputElement>("title");
const course = $<HTMLInputElement>("course");
const deadline = $<HTMLInputElement>("deadline");
const submitBtn = $<HTMLButtonElement>("submit-btn");
const searchInput = document.getElementById("search-input") as HTMLInputElement;
const statsEl = document.getElementById("stats") as HTMLElement;
const filtersContainer = document.getElementById("filters");

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
  if (statsEl) {
    statsEl.textContent = `Total: ${total} tugas | Selesai: ${completedCount} | Belum: ${total - completedCount}`;
  }

  if (filteredTasks.length === 0) {
    list.innerHTML = `<li class="empty-state">Tidak ada tugas yang ditemukan.</li>`;
    return;
  }

  list.innerHTML = filteredTasks
    .map(
      (t) => `
    <li class="task-item">
      <div class="task-info">
        <h3>${escapeHtml(t.title)}</h3>
        <div class="task-meta">
          <span>📚 ${escapeHtml(t.course)}</span>
          <span>📅 Deadline: ${escapeHtml(t.deadline)}</span>
          <span class="badge ${t.status === "Selesai" ? "selesai" : "belum"}">${t.status}</span>
        </div>
      </div>
      <div class="task-actions">
        <button data-act="toggle" data-id="${t.id}" class="btn-toggle">Ubah Status</button>
        <button data-act="edit" data-id="${t.id}" class="btn-edit">Edit</button>
        <button data-act="delete" data-id="${t.id}" class="btn-delete">Hapus</button>
      </div>
    </li>`
    )
    .join("");
}

// Event listener untuk form tambah/edit
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const input: TaskInput = {
    title: title.value.trim(),
    course: course.value.trim(),
    deadline: deadline.value,
  };
  
  if (editingId !== null) {
    store.update(editingId, input);
    editingId = null;
    submitBtn.textContent = "Tambah Tugas";
    showToast("Tugas berhasil diperbarui!", "success");
  } else {
    store.add({ id: Date.now(), status: "Belum Selesai", ...input });
    showToast("Tugas berhasil ditambahkan!", "success");
  }
  
  form.reset();
  render();
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
    window.scrollTo({ top: 0, behavior: "smooth" });
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