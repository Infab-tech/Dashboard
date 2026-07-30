export interface ActivityDayPoint {
  date: string; // YYYY-MM-DD
  created: number;
  changed: number;
  completed: number;
  hasNote: boolean;
}

interface ActivityEvent {
  eventType: string;
  occurredOn: Date;
}

/**
 * Buckets TaskHistoryEvents (from Excel-import diffing) and DailyLog dates into
 * one row per day, for the ActivityStrip chart. Pure data-shaping — no chart
 * library or JSX here, so it can run in a Server Component before the chart's
 * client component ever mounts.
 */
export function aggregateActivityByDay(events: ActivityEvent[], dailyLogDates: Date[]): ActivityDayPoint[] {
  const toKey = (date: Date) => date.toISOString().slice(0, 10);
  const byDay = new Map<string, ActivityDayPoint>();

  const ensure = (key: string): ActivityDayPoint => {
    let point = byDay.get(key);
    if (!point) {
      point = { date: key, created: 0, changed: 0, completed: 0, hasNote: false };
      byDay.set(key, point);
    }
    return point;
  };

  for (const event of events) {
    const point = ensure(toKey(event.occurredOn));
    if (event.eventType === "COMPLETED") point.completed++;
    else if (event.eventType === "STATUS_CHANGED") point.changed++;
    else if (event.eventType === "CREATED") point.created++;
  }

  for (const date of dailyLogDates) {
    ensure(toKey(date)).hasNote = true;
  }

  return [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date));
}
