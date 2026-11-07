export type Status = "Belum Selesai" | "Selesai"; // type alias + union type
export type FilterStatus = "Semua" | Status; // union type lanjutan

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