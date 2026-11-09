import type { Store } from "../store/Store";
import type { Task, TaskInput } from "../types";
import { todayStr } from "../utils/date";
import { dom } from "./dom";
import { showToast } from "./toast";

let editingId: number | null = null;

function resetFormMode(): void {
  editingId = null;
  dom.form.reset();
  dom.submitBtn.textContent = "Tambah Tugas";
  dom.cancelBtn.hidden = true;
}

export function startEdit(task: Task): void {
  dom.title.value = task.title;
  dom.course.value = task.course;
  dom.deadline.value = task.deadline;
  editingId = task.id;
  dom.submitBtn.textContent = "Simpan Perubahan";
  dom.cancelBtn.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
  dom.title.focus({ preventScroll: true });
}

export function initForm(store: Store<Task>, onChange: () => void): void {
  dom.form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input: TaskInput = {
      title: dom.title.value.trim(),
      course: dom.course.value.trim(),
      deadline: dom.deadline.value,
    };

    if (!input.title || !input.course) {
      showToast("Judul dan mata kuliah tidak boleh kosong", "danger");
      return;
    }

    if (editingId === null && input.deadline < todayStr()) {
      showToast("Deadline sudah lewat, pilih hari ini atau setelahnya", "danger");
      dom.deadline.focus();
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
    dom.title.focus();
    onChange();
  });

  dom.cancelBtn.addEventListener("click", () => {
    resetFormMode();
    showToast("Edit dibatalkan", "success");
  });
}