"use client";

import { useCallback, useEffect, useState } from "react";
import { readErrorMessage } from "../../lib/http";
import { ConfirmModal } from "../ui/confirm-modal";
import { Toast, type ToastTone } from "../ui/toast";
import { SkeletonTable } from "./skeleton-table";
import { Pagination } from "./pagination";
import {
  dispatchAdminDataChanged,
  useAdminRefresh,
} from "./admin-refresh";
import { useAdminContext } from "./admin-context";
import {
  PREMIUM_DARK_BUTTON,
  PREMIUM_DARK_CARD_BG,
  PREMIUM_DARK_INPUT,
} from "../layout/premium-dark-styles";

type Membership = {
  id: number;
  courseId: number;
  courseTitle: string;
  userId: number;
  userName: string;
  userEmail: string;
  role: string;
  joinedAt: string;
};

type CourseOption = { id: number; title: string };
type UserOption = { id: number; name: string; email: string };

const PAGE_SIZE = 15;

export function MembersTab() {
  const [members, setMembers] = useState<Membership[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState("");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<{ tone: ToastTone; message: string } | null>(null);
  const [toDelete, setToDelete] = useState<Membership | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [roleChangeBusy, setRoleChangeBusy] = useState<number | null>(null);

  // Add form
  const [addCourseId, setAddCourseId] = useState("");
  const [addUserId, setAddUserId] = useState("");
  const [addRole, setAddRole] = useState("student");
  const [addBusy, setAddBusy] = useState(false);

  const { searchQuery } = useAdminContext();

  const fetchAll = useCallback(() => {
    void (async () => {
      setLoading(true);
      const [mRes, cRes, uRes] = await Promise.all([
        fetch("/api/admin/members"),
        fetch("/api/admin/courses"),
        fetch("/api/admin/users"),
      ]);
      if (mRes.ok) setMembers((await mRes.json()).members ?? []);
      if (cRes.ok) setCourses((await cRes.json()).courses ?? []);
      if (uRes.ok) setUsers((await uRes.json()).users ?? []);
      setLoading(false);
    })();
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { setPage(1); }, [searchQuery, courseFilter]);
  useAdminRefresh({ onManualRefresh: fetchAll });

  const filtered = members.filter((m) => {
    if (courseFilter && m.courseId !== parseInt(courseFilter, 10)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        m.userName.toLowerCase().includes(q) ||
        m.userEmail.toLowerCase().includes(q) ||
        m.courseTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleAdd() {
    if (!addCourseId || !addUserId) {
      setToast({ tone: "error", message: "Select a course and a user." });
      return;
    }
    setAddBusy(true);
    const res = await fetch("/api/admin/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: parseInt(addCourseId, 10), userId: parseInt(addUserId, 10), role: addRole }),
    });
    setAddBusy(false);
    if (res.ok) {
      setToast({ tone: "success", message: "Membership added." });
      setAddCourseId("");
      setAddUserId("");
      setAddRole("student");
      await fetchAll();
      dispatchAdminDataChanged();
    } else {
      setToast({ tone: "error", message: await readErrorMessage(res, "Failed to add membership.") });
    }
  }

  async function handleRoleToggle(m: Membership) {
    const newRole = m.role === "mentor" ? "student" : "mentor";
    setRoleChangeBusy(m.id);
    const res = await fetch(`/api/admin/members/${m.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    setRoleChangeBusy(null);
    if (res.ok) {
      setMembers((prev) => prev.map((x) => (x.id === m.id ? { ...x, role: newRole } : x)));
      dispatchAdminDataChanged();
    } else {
      setToast({ tone: "error", message: await readErrorMessage(res, "Failed to update role.") });
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleteBusy(true);
    const res = await fetch(`/api/admin/members/${toDelete.id}`, { method: "DELETE" });
    setDeleteBusy(false);
    if (res.ok) {
      setMembers((prev) => prev.filter((m) => m.id !== toDelete.id));
      setToDelete(null);
      dispatchAdminDataChanged();
    } else {
      setToast({ tone: "error", message: await readErrorMessage(res, "Failed to remove membership.") });
    }
  }

  if (loading) return <SkeletonTable rows={5} columns={5} />;

  return (
    <>
      {/* Add membership form */}
      <div className={`mb-6 rounded-2xl border border-slate-200 bg-white/60 p-4 dark:border-slate-700/60 ${PREMIUM_DARK_CARD_BG}`}>
        <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Add Membership</h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto_auto]">
          <select
            value={addCourseId}
            onChange={(e) => setAddCourseId(e.target.value)}
            className={`min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-cyan-400/10 ${PREMIUM_DARK_INPUT}`}
          >
            <option value="">Select course…</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          <select
            value={addUserId}
            onChange={(e) => setAddUserId(e.target.value)}
            className={`min-w-0 truncate rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-cyan-400/10 ${PREMIUM_DARK_INPUT}`}
          >
            <option value="">Select user…</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
            ))}
          </select>
          <select
            value={addRole}
            onChange={(e) => setAddRole(e.target.value)}
            className={`rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-cyan-400/10 ${PREMIUM_DARK_INPUT}`}
          >
            <option value="student">student</option>
            <option value="mentor">mentor</option>
          </select>
          <button
            type="button"
            onClick={handleAdd}
            disabled={addBusy}
            className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {addBusy ? "Adding…" : "Add"}
          </button>
        </div>
      </div>

      {/* Course filter */}
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
        <label className="text-sm font-medium text-slate-600 dark:text-slate-400 shrink-0">Filter by course:</label>
        <div className="flex items-center gap-2 min-w-0">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className={`min-w-0 flex-1 sm:max-w-[200px] rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-cyan-400/10 ${PREMIUM_DARK_INPUT}`}
          >
            <option value="">All courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          <span className="text-xs text-slate-400 shrink-0">{filtered.length} memberships</span>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {paged.map((m) => (
          <div key={m.id} className={`rounded-2xl border border-slate-200 bg-white/60 p-4 dark:border-slate-700/60 ${PREMIUM_DARK_CARD_BG}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{m.userName}</p>
                <p className="text-xs text-slate-500">{m.userEmail}</p>
                <p className="mt-1 text-xs text-slate-400">{m.courseTitle}</p>
              </div>
              <MemberRoleBadge role={m.role} busy={roleChangeBusy === m.id} onClick={() => handleRoleToggle(m)} />
            </div>
            <div className="mt-3 flex justify-end">
              <button onClick={() => setToDelete(m)} className="text-xs font-medium text-red-500 hover:text-red-700">Remove</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-slate-500 dark:text-slate-400">No memberships found.</p>}
      </div>

      {/* Desktop table */}
      <div className={`hidden overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/60 p-4 shadow-sm md:block dark:border-slate-700/60 ${PREMIUM_DARK_CARD_BG}`}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">User</th>
              <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Course</th>
              <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Role</th>
              <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Joined</th>
              <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {paged.map((m) => (
              <tr key={m.id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-white/5">
                <td className="py-3">
                  <p className="font-medium text-slate-900 dark:text-white">{m.userName}</p>
                  <p className="text-xs text-slate-500">{m.userEmail}</p>
                </td>
                <td className="py-3 text-slate-600 dark:text-slate-400">{m.courseTitle}</td>
                <td className="py-3">
                  <MemberRoleBadge role={m.role} busy={roleChangeBusy === m.id} onClick={() => handleRoleToggle(m)} />
                </td>
                <td className="py-3 text-slate-500 dark:text-slate-400">
                  {new Date(m.joinedAt).toLocaleDateString()}
                </td>
                <td className="py-3">
                  <button onClick={() => setToDelete(m)} className="text-xs font-medium text-red-500 hover:text-red-700 dark:text-red-400">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="mt-4 text-center text-slate-500 dark:text-slate-400">No memberships found.</p>
        )}
      </div>

      <Pagination currentPage={page} totalItems={filtered.length} itemsPerPage={PAGE_SIZE} onPageChange={setPage} />

      <ConfirmModal
        isOpen={toDelete !== null}
        title="Remove membership?"
        description={toDelete ? `Remove ${toDelete.userName} from "${toDelete.courseTitle}"?` : ""}
        confirmLabel="Remove"
        busy={deleteBusy}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />

      {toast ? <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} /> : null}
    </>
  );
}

function MemberRoleBadge({ role, busy, onClick }: { role: string; busy: boolean; onClick: () => void }) {
  const isMentor = role === "mentor";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      title="Click to toggle role"
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
        isMentor
          ? "bg-brand-100 text-brand-700 hover:bg-brand-200 dark:bg-brand-500/20 dark:text-brand-100 dark:hover:bg-brand-500/30"
          : `bg-slate-100 text-slate-600 hover:bg-slate-200 dark:border dark:border-slate-700/60 ${PREMIUM_DARK_BUTTON}`
      }`}
    >
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        {isMentor ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        )}
      </svg>
      {role}
    </button>
  );
}
