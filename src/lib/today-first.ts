export type TodayActionKind = "training" | "habit" | "checkin" | "nutrition";

export type TodayAction = {
  kind: TodayActionKind;
  title: string;
  detail: string;
  completed: boolean;
  scheduledMinutes: number;
  to: "/training" | "/habits" | "/check-ins" | "/nutrition";
};

export function minutesNow(date = new Date()) {
  return date.getHours() * 60 + date.getMinutes();
}

export function prioritizeToday(actions: TodayAction[], now = new Date()) {
  const minute = minutesNow(now);
  return [...actions].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const aDistance = a.scheduledMinutes >= minute ? a.scheduledMinutes - minute : 1440 + a.scheduledMinutes - minute;
    const bDistance = b.scheduledMinutes >= minute ? b.scheduledMinutes - minute : 1440 + b.scheduledMinutes - minute;
    return aDistance - bDistance;
  });
}

export function dayGreeting(date = new Date()) {
  if (date.getHours() < 12) return "Bom dia";
  if (date.getHours() < 18) return "Boa tarde";
  return "Boa noite";
}
