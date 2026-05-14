"use client";

import { useCallback, useEffect, useState } from "react";
import { readErrorMessage } from "../../lib/http";
import { ConfirmModal } from "../ui/confirm-modal";
import { Toast, type ToastTone } from "../ui/toast";
import { SkeletonTable } from "./skeleton-table";
import { Pagination } from "./pagination";
import { MemberAddForm } from "./member-add-form";
import { MemberRoleBadge } from "./member-role-badge";
import {
  dispatchAdminDataChanged,
  useAdminRefresh,
} from "./admin-refresh";
import { useAdminContext } from "./admin-context";
import { buildPagedListUrl } from "./paged-list-utils";
import {
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
  const [totalMembers, setTotalMembers] = useState(0);
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
        fetch(buildPagedListUrl("/api/admin/members", {
          page,
          limit: PAGE_SIZE,
          search: searchQuery,
          courseId: courseFilter,
        })),
        fetch("/api/admin/courses?page=1&limit=200"),
        fetch("/api/admin/users?page=1&limit=200"),
      ]);
      if (mRes.ok) {
        const data = await mRes.json();
        setMembers(data.members ?? []);
        setTotalMembers(data.total ?? 0);
      }
      if (cRes.ok) setCourses((await cRes.json()).courses ?? []);
      if (uRes.ok) setUsers((await uRes.json()).users ?? []);
      setLoading(false);
    })();
  }, [courseFilter, page, searchQuery]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { setPage(1); }, [searchQuery, courseFilter]);
  useAdminRefresh({ onManualRefresh: fetchAll });

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
      setToDelete(null);
      if (members.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await fetchAll();
      }
      dispatchAdminDataChanged();
    } else {
      setToast({ tone: "error", message: await readErrorMessage(res, "Failed to remove membership.") });
    }
  }

  if (loading) return <SkeletonTable rows={5} columns={5} />;

  return (
    <>
      <MemberAddForm
        courses={courses}
        users={users}
        courseId={addCourseId}
        userId={addUserId}
        role={addRole}
        busy={addBusy}
        onCourseChange={setAddCourseId}
        onUserChange={setAddUserId}
        onRoleChange={setAddRole}
        onAdd={handleAdd}
      />

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
          <span className="text-xs text-slate-400 shrink-0">{totalMembers} memberships</span>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {members.map((m) => (
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
        {totalMembers === 0 && <p className="text-center text-slate-500 dark:text-slate-400">No memberships found.</p>}
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
            {members.map((m) => (
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
        {totalMembers === 0 && (
          <p className="mt-4 text-center text-slate-500 dark:text-slate-400">No memberships found.</p>
        )}
      </div>

      <Pagination currentPage={page} totalItems={totalMembers} itemsPerPage={PAGE_SIZE} onPageChange={setPage} />

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
