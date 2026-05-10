import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireMentor } from "../../../../lib/api-utils";
import { fetchMentorQuestions } from "../../../../lib/mentor-questions";

// GET /api/mentor/questions
// Returns all questions (postType='question') from courses where the caller is a mentor.
// Also works for admins (they see all questions).
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const mentorError = requireMentor(auth.user);
  if (mentorError) return mentorError;

  const { searchParams } = new URL(request.url);
  const questionStatus = searchParams.get("status"); // filter: open | answered | closed

  const rows = await fetchMentorQuestions(auth.user.sub, auth.user.role, questionStatus);

  return NextResponse.json({ questions: rows });
}
