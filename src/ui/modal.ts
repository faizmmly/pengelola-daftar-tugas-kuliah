import { dom } from "./dom";

let pendingId: number | null = null;

function close(): void {
  dom.confirmModal.classList.remove("show");
  pendingId = null;
}

export function openDeleteModal(id: number): void {
  pendingId = id;
  dom.confirmModal.classList.add("show");
}

export function initModal(onConfirm: (id: number) => void): void {
  dom.modalCancel.addEventListener("click", close);
  dom.modalConfirm.addEventListener("click", () => {
    if (pendingId !== null) onConfirm(pendingId);
    close();
  });
}