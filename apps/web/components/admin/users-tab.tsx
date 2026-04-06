"use client";

import { useEffect, useState } from "react";

import { readErrorMessage } from "../../lib/http";
import { ConfirmModal } from "../ui/confirm-modal";
import { UserModal } from "./user-modal";
import { RoleBadge } from "./role-badge";
import { RoleConfirmModal } from "./role-confirm-modal";
import { useAdminContext } from "./admin-context";
import { useFilteredData } from "./use-filtered-data";
import { Pagination } from "./pagination";
import { ExportButton } from "./export-button";
import { SkeletonTable } from "./skeleton-table";

type AdminUser = {
  id: number;
  email: string;
  name: string;
  role: string;
  avatarUrl: string | null;
  blocked: boolean;
  createdAt: string;
};

const SEARCHABLE: (keyof AdminUser)[] = ["name", "email", "role"];

export function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState<Pick<AdminUser, "id" | "email"> | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roleChangeUser, setRoleChangeUser] = useState<AdminUser | null>(null);
  const [roleBusy, setRoleBusy] = useState(false);
  const [page, setPage] = useState(1);

  const { searchQuery, viewAsFilter, settings } = useAdminContext();
  const filtered = useFilteredData(users, searchQuery, SEARCHABLE, viewAsFilter, "email");
  const paged = filtered.slice((page - 1) * settings.itemsPerPage, page * settings.itemsPerPage);

  useEffect(() => { setPage(1); }, [searchQuery]);
  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users || []);
    }
    setLoading(false);
  }

  async function confirmRoleChange() {
    if (!roleChangeUser) return;
    const newRole = roleChangeUser.role === "admin" ? "user" : "admin";
    setRoleBusy(true);
    const res = await fetch(`/api/admin/users/${roleChangeUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    setRoleBusy(false);
    if (res.ok) {
      setUsers((prev) => prev.map((u) => (u.id === roleChangeUser.id ? { ...u, role: newRole } : u)));
      setRoleChangeUser(null);
    } else {
      const data = await res.json();
      alert(data.message || "Failed to update role");
    }
  }

  async function toggleBlock(user: AdminUser) {
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocked: !user.blocked }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, blocked: !user.blocked } : u)));
    }
  }

  async function confirmDeleteUser() {
    if (!userToDelete) return;
    setDeleteBusy(true);
    const res = await fetch(`/api/admin/users/${userToDelete.id}`, { method: "DELETE" });
    setDeleteBusy(false);
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setUserToDelete(null);
    } else {
      alert(await readErrorMessage(res, "Failed to delete user."));
    }
  }

  if (loading) {
    return <SkeletonTable rows={5} columns={6} />;
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <ExportButton
          data={filtered as unknown as Record<string, unknown>[]}
          headers={["Name", "Email", "Role", "Status", "Joined"]}
          keys={["name", "email", "role", "blocked", "createdAt"]}
          filename="users"
        />
        <button
          onClick={() => setShowCreateModal(true)}
          className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          + Create User
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">User</th>
              <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Email</th>
              <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Role</th>
              <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Status</th>
              <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Joined</th>
              <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {paged.map((user) => (
              <tr key={user.id} className={user.blocked ? "opacity-60" : ""}>
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&size=32`}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&size=32`;
                      }}
                    />
                    <span className="font-medium text-slate-900 dark:text-white">{user.name}</span>
                  </div>
                </td>
                <td className="py-3 text-slate-600 dark:text-slate-400">{user.email}</td>
                <td className="py-3">
                  <RoleBadge role={user.role} onClick={() => setRoleChangeUser(user)} />
                </td>
                <td className="py-3">
                  <button
                    onClick={() => toggleBlock(user)}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                      user.blocked
                        ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-300"
                        : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300"
                    }`}
                  >
                    {user.blocked ? "Blocked" : "Active"}
                  </button>
                </td>
                <td className="py-3 text-slate-500 dark:text-slate-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <button onClick={() => setEditingUser(user)} className="text-xs font-medium text-brand-500 hover:text-brand-700 dark:text-brand-400">Edit</button>
                    <button onClick={() => setUserToDelete({ id: user.id, email: user.email })} className="text-xs font-medium text-red-500 hover:text-red-700 dark:text-red-400">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="mt-4 text-center text-slate-500 dark:text-slate-400">No users found.</p>
        )}
      </div>

      <Pagination currentPage={page} totalItems={filtered.length} itemsPerPage={settings.itemsPerPage} onPageChange={setPage} />

      <RoleConfirmModal
        isOpen={roleChangeUser !== null}
        userName={roleChangeUser?.name ?? ""}
        currentRole={roleChangeUser?.role ?? "user"}
        busy={roleBusy}
        onConfirm={confirmRoleChange}
        onCancel={() => setRoleChangeUser(null)}
      />

      <ConfirmModal
        isOpen={userToDelete !== null}
        title="Delete user?"
        description={userToDelete ? `Delete ${userToDelete.email} and remove all of their data.` : ""}
        confirmLabel="Delete user"
        busy={deleteBusy}
        onCancel={() => setUserToDelete(null)}
        onConfirm={confirmDeleteUser}
      />

      <UserModal
        isOpen={showCreateModal || editingUser !== null}
        user={editingUser}
        onClose={() => { setShowCreateModal(false); setEditingUser(null); }}
        onSaved={fetchUsers}
      />
    </>
  );
}
