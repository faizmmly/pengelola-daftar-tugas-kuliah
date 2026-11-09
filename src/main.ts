import "./style.css";
import { Store } from "./store/Store";
import type { Task, FilterStatus, SortBy } from "./types";
import { sortItems } from "./utils/collection";
import { dom } from "./ui/dom";
import { showToast } from "./ui/toast";
import { initModal, openDeleteModal } from "./ui/modal";
import { renderStatsPanel } from "./ui/statsPanel";
import { renderTaskList } from "./ui/taskList";
import { initForm, startEdit } from "./ui/form";

// Konfigurasi dari .env (non-rahasia)
const appName: string = import.meta.env.VITE_APP_NAME ?? "Daftar Tugas";
const appVersion: string = import.meta.env.VITE_APP_VERSION ?? "0.0.0";

let currentFilter: FilterStatus = "Semua";
let currentSort: SortBy = "deadline";

const comparators: Record<SortBy, (a: Task, b: Task) => number> = {
  deadline: (a, b) => {
    if (a.status !== b.status) return a.status === "Belum Selesai" ? -1 : 1;
    return a.deadline.localeCompare(b.deadline);
  },
  terbaru: (a, b) => b.id - a.id,
  nama: (a, b) => a.title.localeCompare(b.title, "id"),
};

const store = new Store<Task>("tasks");

dom.appTitle.textContent = appName;
dom.appVersion.textContent = `v${appVersion}`;
document.title = appName;

function render(): void {
  const all = store.getAll();
  const keyword = dom.searchInput.value.toLowerCase();

  const filtered = all.filter((t) => {
    const matchesFilter = currentFilter === "Semua" || t.status === currentFilter;
    const matchesSearch =
      t.title.toLowerCase().includes(keyword) ||
      t.course.toLowerCase().includes(keyword);
    return matchesFilter && matchesSearch;
  });

  renderStatsPanel(all);
  renderTaskList(sortItems(filtered, comparators[currentSort]), all.length);
}

initForm(store, render);

initModal((id) => {
  store.remove(id);
  showToast("Tugas berhasil dihapus!", "danger");
  render();
});

// Aksi pada kartu: toggle, edit, salin, hapus
dom.list.addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest("button");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const task = store.getAll().find((t) => t.id === id);
  if (!task) return;

  switch (btn.dataset.act) {
    case "delete":
      openDeleteModal(id);
      break;
    case "toggle": {
      const newStatus = task.status === "Selesai" ? "Belum Selesai" : "Selesai";
      store.update(id, { status: newStatus });
      showToast(`Status diubah menjadi ${newStatus}`, "success");
      render();
      break;
    }
    case "edit":
      startEdit(task);
      break;
    case "duplicate":
      store.add({
        id: Date.now(),
        title: `${task.title} (salinan)`,
        course: task.course,
        deadline: task.deadline,
        status: "Belum Selesai",
      });
      showToast("Tugas berhasil disalin!", "success");
      render();
      break;
  }
});

dom.searchInput.addEventListener("input", render);

dom.sortSelect.addEventListener("change", () => {
  currentSort = dom.sortSelect.value as SortBy;
  render();
});

dom.filters.addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest("button");
  if (!btn) return;
  dom.filters.querySelectorAll("button").forEach((el) => el.classList.remove("active"));
  btn.classList.add("active");
  currentFilter = btn.getAttribute("data-filter") as FilterStatus;
  render();
});

render();