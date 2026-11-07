import "./style.css";
import { Store } from "./store";
import { countBy, filterBy } from "./utils";
import type { FilterStatus, Task, TaskInput, TaskStats } from "./types";

const appName: string = import.meta.env.VITE_APP_NAME ?? "Daftar Tugas";
const appVersion: string = import.meta.env.VITE_APP_VERSION ?? "0.0.0";

let editingId: number | null = null;
let currentFilter: FilterStatus = "Semua";

const store = new Store<Task>("tasks");

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const form = $<HTMLFormElement>("task-form");
const list = $<HTMLUListElement>("task-list");
const title = $<HTMLInputElement>("title");
const course = $<HTMLInputElement>("course");
const deadline = $<HTMLInputElement>("deadline");
const submitBtn = $<HTMLButtonElement>("submit-btn");
const statsEl = $<HTMLParagraphElement>("stats");
const filters = $<HTMLDivElement>("filters");

$("app-title").textContent = appName;
$("app-version").textContent = `v${appVersion}`;
document.title = appName;

const escapeHtml = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const today = (): string => new Date().toLocaleDateString("sv-SE"); // YYYY-MM-DD

const isLate = (t: Task): boolean =>
  t.status === "Belum Selesai" && t.deadline < today();

function getStats(tasks: Task[]): TaskStats {
  return {
    total: tasks.length,
    selesai: countBy(tasks, (t) => t.status === "Selesai"),
    belum: countBy(tasks, (t) => t.status === "Belum Selesai"),
  };
}

function render(): void {
  const all = store.getAll();
  const stats = getStats(all);

  statsEl.textContent = `Total: ${stats.total} • Belum Selesai: ${stats.belum} • Selesai: ${stats.selesai}`;

  filters.querySelectorAll<HTMLButtonElement>("button").forEach((b) => {
    b.classList.toggle("active", b.dataset.filter === currentFilter);
  });

  const tasks = filterBy(
    all,
    (t) => currentFilter === "Semua" || t.status === currentFilter
  ).sort((a, b) => a.deadline.localeCompare(b.deadline));

  if (tasks.length === 0) {
    list.innerHTML = `<li class="empty">${
      all.length === 0 ? "Belum ada tugas." : "Tidak ada tugas pada filter ini."
    }</li>`;
    return;
  }

  list.innerHTML = tasks
    .map(
      (t) => `
    <li class="task ${t.status === "Selesai" ? "done" : ""} ${isLate(t) ? "late" : ""}">
      <div class="info">
        <strong>${escapeHtml(t.title)}</strong>
        <span>${escapeHtml(t.course)} • Deadline: ${escapeHtml(t.deadline)}${
          isLate(t) ? " ⚠ Lewat deadline" : ""
        }</span>
        <span class="badge">${t.status}</span>
      </div>
      <div class="actions">
        <button data-act="toggle" data-id="${t.id}">Ubah Status</button>
        <button data-act="edit" data-id="${t.id}">Edit</button>
        <button data-act="delete" data-id="${t.id}" class="danger">Hapus</button>
      </div>
    </li>`
    )
    .join("");
}

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
  } else {
    store.add({ id: Date.now(), status: "Belum Selesai", ...input });
  }

  form.reset();
  render();
});

filters.addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest("button");
  if (!btn) return;
  currentFilter = btn.dataset.filter as FilterStatus;
  render();
});

list.addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest("button");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const task = store.getAll().find((t) => t.id === id);
  if (!task) return;

  if (btn.dataset.act === "delete") {
    if (confirm("Hapus tugas ini?")) store.remove(id);
  } else if (btn.dataset.act === "toggle") {
    store.update(id, {
      status: task.status === "Selesai" ? "Belum Selesai" : "Selesai",
    });
  } else if (btn.dataset.act === "edit") {
    title.value = task.title;
    course.value = task.course;
    deadline.value = task.deadline;
    editingId = id;
    submitBtn.textContent = "Simpan Perubahan";
  }
  render();
});

render();