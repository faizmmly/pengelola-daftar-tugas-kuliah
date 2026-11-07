export type Status = "Belum Selesai" | "Selesai"; // type alias + union type

export interface Task {
  id: number; // number
  title: string; // string
  course: string;
  deadline: string;
  status: Status;
}

export type TaskInput = Omit<Task, "id" | "status">;