const $ = <T extends HTMLElement>(id: string): T =>
  document.getElementById(id) as T;

export const dom = {
  appTitle: $("app-title"),
  appVersion: $("app-version"),
  form: $<HTMLFormElement>("task-form"),
  title: $<HTMLInputElement>("title"),
  course: $<HTMLInputElement>("course"),
  deadline: $<HTMLInputElement>("deadline"),
  submitBtn: $<HTMLButtonElement>("submit-btn"),
  cancelBtn: $<HTMLButtonElement>("cancel-btn"),
  list: $<HTMLUListElement>("task-list"),
  searchInput: $<HTMLInputElement>("search-input"),
  sortSelect: $<HTMLSelectElement>("sort-select"),
  filters: $<HTMLElement>("filters"),
  stats: $<HTMLElement>("stats"),
  progressBar: $<HTMLElement>("progress-bar"),
  statsDetail: $<HTMLElement>("stats-detail"),
  reminder: $<HTMLElement>("reminder-banner"),
  confirmModal: $<HTMLElement>("confirm-modal"),
  modalCancel: $<HTMLButtonElement>("modal-cancel"),
  modalConfirm: $<HTMLButtonElement>("modal-confirm"),
  toast: $<HTMLElement>("toast"),
};