import { dom } from "./dom";

export type ToastType = "success" | "danger"; // union type

export function showToast(message: string, type: ToastType = "success"): void {
  dom.toast.textContent = message;
  dom.toast.className = `toast show ${type}`;
  setTimeout(() => {
    dom.toast.className = "toast";
  }, 3000);
}