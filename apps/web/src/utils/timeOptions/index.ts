// PostgreSQL TIME columns return "HH:MM:SS" — strip seconds to get "HH:MM".
export function normalizeTime(time: string | null | undefined): string | null {
  if (!time) return null;
  return time.length > 5 ? time.slice(0, 5) : time;
}

export interface TimeOption {
  value: string;
  label: string;
}

export const TIME_OPTIONS: TimeOption[] = (() => {
  const options: TimeOption[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      const value = `${hh}:${mm}`;
      const period = h < 12 ? "AM" : "PM";
      const displayH = h % 12 === 0 ? 12 : h % 12;
      const label = `${displayH}:${mm} ${period}`;
      options.push({ value, label });
    }
  }
  return options;
})();

export function formatTime(time: string): string {
  const [hh, mm] = time.split(":");
  const h = parseInt(hh, 10);
  const period = h < 12 ? "AM" : "PM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${mm} ${period}`;
}

export function sortItemsByTime<T extends { time: string | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.time && b.time) return a.time.localeCompare(b.time);
    if (a.time && !b.time) return -1;
    if (!a.time && b.time) return 1;
    return 0;
  });
}

export function getCurrentTime(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function getLastActivityTime<T extends { time: string | null }>(items: T[]): string | null {
  const sortedItems = sortItemsByTime(items);
  for (let i = sortedItems.length - 1; i >= 0; i--) {
    if (sortedItems[i].time) {
      return sortedItems[i].time;
    }
  }
  return null;
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export function shouldShowMoveIncompleteButton<T extends { time: string | null; isDone?: boolean }>(
  items: T[],
  date?: Date
): boolean {
  // Only show button today
  if (date && !isToday(date)) return false;

  // Don't show if no items or all items are done
  const incompleteItems = items.filter((item) => !item.isDone);
  if (incompleteItems.length === 0) return false;

  // Don't show if all incomplete items have no timing
  const incompleteTimed = incompleteItems.filter((item) => item.time);
  if (incompleteTimed.length === 0) return false;

  // Show if current time is at or after the last timed incomplete activity
  const lastTime = getLastActivityTime(incompleteTimed);
  if (!lastTime) return false;

  const currentTime = getCurrentTime();
  return currentTime >= lastTime;
}
