import type { Task, DetailedStats } from "./types";

export function filterBy<T>(items: T[], predicate: (item: T) => boolean): T[] {
  return items.filter(predicate);
}


export function countBy<T>(items: T[], predicate: (item: T) => boolean): number {
  return items.filter(predicate).length;
}

export function daysLeft(deadline: string): number {
  const msPerDay = 86_400_000;
  const todayStr = new Date().toLocaleDateString("sv-SE"); // YYYY-MM-DD
  const d = new Date(`${deadline}T00:00:00`).getTime();
  const t = new Date(`${todayStr}T00:00:00`).getTime();
  return Math.round((d - t) / msPerDay);
}

export function deadlineLabel(days: number): string {
  if (days < 0) return `Lewat ${Math.abs(days)} hari`;
  if (days === 0) return "Hari ini";
  if (days === 1) return "Besok";
  return `${days} hari lagi`;
}

export function formatDate(deadline: string): string {
  return new Date(`${deadline}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Generic: bisa dipakai untuk array tipe apa pun, tidak mengubah array asli
export function sortItems<T>(items: T[], compare: (a: T, b: T) => number): T[] {
  return [...items].sort(compare);
}

export function computeDetailedStats(tasks: Task[]): DetailedStats {
  // reduce: kelompokkan jumlah tugas per mata kuliah
  const perCourse = tasks.reduce<Record<string, number>>((acc, t) => {
    acc[t.course] = (acc[t.course] ?? 0) + 1;
    return acc;
  }, {});

  const pending = tasks.filter((t) => t.status === "Belum Selesai");

  return {
    total: tasks.length,
    selesai: tasks.length - pending.length,
    belum: pending.length,
    lewat: pending.filter((t) => daysLeft(t.deadline) < 0).length,
    mingguIni: pending.filter((t) => {
      const d = daysLeft(t.deadline);
      return d >= 0 && d <= 7;
    }).length,
    perCourse,
  };
}