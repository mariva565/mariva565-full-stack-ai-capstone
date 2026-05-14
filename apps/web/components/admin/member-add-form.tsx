"use client";

import {
  PREMIUM_DARK_CARD_BG,
  PREMIUM_DARK_INPUT,
} from "../layout/premium-dark-styles";

type CourseOption = { id: number; title: string };
type UserOption = { id: number; name: string; email: string };

type MemberAddFormProps = {
  courses: CourseOption[];
  users: UserOption[];
  courseId: string;
  userId: string;
  role: string;
  busy: boolean;
  onCourseChange: (value: string) => void;
  onUserChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onAdd: () => void;
};

export function MemberAddForm({
  courses,
  users,
  courseId,
  userId,
  role,
  busy,
  onCourseChange,
  onUserChange,
  onRoleChange,
  onAdd,
}: MemberAddFormProps) {
  return (
    <div className={`mb-6 rounded-2xl border border-slate-200 bg-white/60 p-4 dark:border-slate-700/60 ${PREMIUM_DARK_CARD_BG}`}>
      <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Add Membership</h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto_auto]">
        <select
          value={courseId}
          onChange={(event) => onCourseChange(event.target.value)}
          className={`min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-cyan-400/10 ${PREMIUM_DARK_INPUT}`}
        >
          <option value="">Select course...</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>{course.title}</option>
          ))}
        </select>
        <select
          value={userId}
          onChange={(event) => onUserChange(event.target.value)}
          className={`min-w-0 truncate rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-cyan-400/10 ${PREMIUM_DARK_INPUT}`}
        >
          <option value="">Select user...</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
          ))}
        </select>
        <select
          value={role}
          onChange={(event) => onRoleChange(event.target.value)}
          className={`rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-cyan-400/10 ${PREMIUM_DARK_INPUT}`}
        >
          <option value="student">student</option>
          <option value="mentor">mentor</option>
        </select>
        <button
          type="button"
          onClick={onAdd}
          disabled={busy}
          className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {busy ? "Adding..." : "Add"}
        </button>
      </div>
    </div>
  );
}
