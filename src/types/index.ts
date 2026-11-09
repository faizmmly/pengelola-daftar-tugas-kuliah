export type Status = "Belum Selesai" | "Selesai"; // type alias + union type
export type FilterStatus = "Semua" | Status; // union type lanjutan
export type SortBy = "deadline" | "terbaru" | "nama"; // union type

export interface Task {
  id: number; // number
  title: string; // string
  course: string;
  deadline: string;
  status: Status;
}

export interface TaskStats {
  total: number;
  selesai: number;
  belum: number;
}

export type TaskInput = Omit<Task, "id" | "status">;

export interface DetailedStats {
  total: number;
  selesai: number;
  belum: number;
  lewat: number; // belum selesai dan lewat deadline
  mingguIni: number; // belum selesai, deadline 0-7 hari ke depan
  perCourse: Record<string, number>; // jumlah tugas per mata kuliah
}

export interface Reminder {
  today: number; // belum selesai, deadline hari ini
  late: number; // belum selesai, deadline sudah lewat
}