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
