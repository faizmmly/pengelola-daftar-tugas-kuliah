import type { Task } from "../types";
import { daysLeft, deadlineLabel, formatDate } from "../utils/date";
import { escapeHtml } from "../utils/html";
import { dom } from "./dom";

function taskCard(t: Task): string {
  const days = daysLeft(t.deadline);
  const done = t.status === "Selesai";
  const late = !done && days < 0;
  const urgent = !done && days >= 0 && days <= 1;
  const state = done ? "is-done" : late ? "is-late" : urgent ? "is-urgent" : "is-pending";
  const chip = done
    ? ""
    : `<span class="chip ${late ? "chip-late" : urgent ? "chip-urgent" : ""}">${deadlineLabel(days)}</span>`;

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
        <button data-act="duplicate" data-id="${t.id}" class="btn-duplicate">Salin</button>
        <button data-act="delete" data-id="${t.id}" class="btn-delete">Hapus</button>
      </div>
    </li>`;
}

// tasks: sudah difilter dan diurutkan; totalAll: jumlah seluruh tugas
export function renderTaskList(tasks: Task[], totalAll: number): void {
  if (tasks.length === 0) {
    dom.list.innerHTML = `
      <li class="empty-state">
        <span class="empty-icon">${totalAll === 0 ? "📝" : "🔍"}</span>
        <p>${totalAll === 0 ? "Belum ada tugas. Tambahkan tugas pertamamu di atas!" : "Tidak ada tugas yang cocok."}</p>
      </li>`;
    return;
  }
  dom.list.innerHTML = tasks.map(taskCard).join("");
}