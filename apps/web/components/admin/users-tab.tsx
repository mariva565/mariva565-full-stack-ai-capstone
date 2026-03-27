"use client";

import { useEffect, useState } from "react";

type AdminUser = {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: string;
};

export function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users || []);
    }
    setLoading(false);
  }

  async function handleRoleChange(userId: number, newRole: string) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } else {
      const data = await res.json();
      alert(data.message || "Failed to update role");
    }
  }

  async function handleDelete(userId: number, email: string) {
    if (!confirm(`Delete user ${email}? This will remove all their data.`)) return;
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } else {
      const data = await res.json();
      alert(data.message || "Failed to delete user");
    }
  }

  if (loading) {
    return <p className="text-slate-500 dark:text-slate-400">Loading users...</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Name</th>
            <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Email</th>
            <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Role</th>
            <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Joined</th>
            <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="py-3 font-medium text-slate-900 dark:text-white">
                {user.name}
              </td>
              <td className="py-3 text-slate-600 dark:text-slate-400">{user.email}</td>
              <td className="py-3">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className="rounded border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </td>
              <td className="py-3 text-slate-500 dark:text-slate-400">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="py-3">
                <button
                  onClick={() => handleDelete(user.id, user.email)}
                  className="text-xs font-medium text-red-500 hover:text-red-700 dark:text-red-400"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <p className="mt-4 text-center text-slate-500 dark:text-slate-400">
          No users found.
        </p>
      )}
    </div>
  );
}
