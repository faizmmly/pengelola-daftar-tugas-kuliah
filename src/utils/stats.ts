import type { Task, DetailedStats, Reminder } from "../types";
import { daysLeft } from "./date";

export function computeDetailedStats(tasks: Task[]): DetailedStats {
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

export function computeReminder(tasks: Task[]): Reminder {
  const pending = tasks.filter((t) => t.status === "Belum Selesai");
  return {
    today: pending.filter((t) => daysLeft(t.deadline) === 0).length,
    late: pending.filter((t) => daysLeft(t.deadline) < 0).length,
  };
}