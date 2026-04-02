import { CalendarClientPage } from "../../components/calendar/calendar-client-page";
import { getCalendarEvents, getCalendarInitialView } from "../../lib/calendar-data";
import { getRequestUserOrRedirect } from "../../lib/server-auth";

export default async function CalendarPage() {
  const user = await getRequestUserOrRedirect();
  const initialView = getCalendarInitialView();
  const initialEvents = await getCalendarEvents(user.sub, initialView.monthKey);

  return <CalendarClientPage initialEvents={initialEvents} initialView={initialView} />;
}
