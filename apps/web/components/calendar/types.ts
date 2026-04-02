export type CalendarEvent = {
  id: number;
  title: string;
  description: string | null;
  date: string;
  type: string;
  color: string | null;
  courseId: number | null;
  milestoneId: number | null;
};

export type CalendarInitialView = {
  year: number;
  month: number;
  selectedDate: string | null;
};
