import "./style.css";
import { Store } from "./store";
import type { Task, TaskInput } from "./types";

const appName: string = import.meta.env.VITE_APP_NAME ?? "Daftar Tugas";
const appVersion: string = import.meta.env.VITE_APP_VERSION ?? "0.0.0";
let editingId: number | null = null;

const store = new Store<Task>("tasks");

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const form = $<HTMLFormElement>("task-form");
const list = $<HTMLUListElement>("task-list");
const title = $<HTMLInputElement>("title");
const course = $<HTMLInputElement>("course");
const deadline = $<HTMLInputElement>("deadline");
const submitBtn = $<HTMLButtonElement>("submit-btn");

$("app-title").textContent = appName;
$("app-version").textContent = `v${appVersion}`;
document.title = appName;

const escapeHtml = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function render(): void {
  const tasks = store.getAll();
  if (tasks.length === 0) {
    list.innerHTML = `<li class="empty">Belum ada tugas.</li>`;
    return;
  }
  list.innerHTML = tasks
    .map(
      (t) => `
    <li class="task ${t.status === "Selesai" ? "done" : ""}">
      <div class="info">
        <strong>${escapeHtml(t.title)}</strong>
        <span>${escapeHtml(t.course)} • Deadline: ${escapeHtml(t.deadline)}</span>
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