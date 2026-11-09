import type { Task } from "../types";
import { computeDetailedStats, computeReminder } from "../utils/stats";
import { escapeHtml } from "../utils/html";
import { dom } from "./dom";

function renderDetailedStats(tasks: Task[]): void {
  const s = computeDetailedStats(tasks);
  const wasOpen = dom.statsDetail.querySelector("details")?.open ?? false;

  const courses = Object.entries(s.perCourse)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => `<li><span>${escapeHtml(name)}</span><strong>${count}</strong></li>`)
    .join("");

  dom.statsDetail.innerHTML = `
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
  const r = computeReminder(tasks);

  if (r.today === 0 && r.late === 0) {
    dom.reminder.hidden = true;
    return;
  }

  const parts: string[] = [];
  if (r.late > 0) parts.push(`${r.late} tugas lewat deadline`);
  if (r.today > 0) parts.push(`${r.today} tugas jatuh tempo hari ini`);

  dom.reminder.className = `reminder ${r.late > 0 ? "reminder-late" : "reminder-today"}`;
  dom.reminder.textContent = `⏰ ${parts.join(" • ")}`;
  dom.reminder.hidden = false;
}

export function renderStatsPanel(tasks: Task[]): void {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "Selesai").length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  dom.stats.textContent = `Total: ${total} tugas | Selesai: ${done} | Belum: ${total - done} | ${percent}%`;
  dom.progressBar.style.width = `${percent}%`;

  renderDetailedStats(tasks);
  renderReminder(tasks);
}