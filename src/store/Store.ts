export class Store<T extends { id: number }> {
  private items: T[] = []; // array
  private key: string;

  constructor(key: string) {
    this.key = key;
    const raw = localStorage.getItem(key);
    if (raw) this.items = JSON.parse(raw) as T[];
  }

  getAll(): T[] {
    return [...this.items];
  }

  add(item: T): void {
    this.items.push(item);
    this.save();
  }

  update(id: number, patch: Partial<T>): void {
    this.items = this.items.map((i) => (i.id === id ? { ...i, ...patch } : i));
    this.save();
  }

  remove(id: number): void {
    this.items = this.items.filter((i) => i.id !== id);
    this.save();
  }

  private save(): void {
    localStorage.setItem(this.key, JSON.stringify(this.items));
  }
}