"use client";
import { useCallback, useEffect, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { formatDate } from "@/lib/format";
import { isPhoneEmail } from "@/lib/phone";
import type { AdminUser } from "@/types";

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    try {
      setUsers((await api.users.list()).users);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const changeRole = async (u: AdminUser, role: "user" | "admin") => {
    try {
      await api.users.setRole(u.id, role);
      setUsers((l) => l.map((x) => (x.id === u.id ? { ...x, role } : x)));
      toast.success(`${u.name ?? u.email} is now ${role === "admin" ? "an admin" : "a customer"}`);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const remove = async (u: AdminUser) => {
    if (!window.confirm(`Delete the account of ${u.name ?? u.email}? Their orders stay in the system.`)) return;
    try {
      await api.users.remove(u.id);
      setUsers((l) => l.filter((x) => x.id !== u.id));
      toast.success("User deleted");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const shown = users.filter((u) => `${u.name} ${u.email} ${u.phone}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold">Users</h1>
      <label className="input input-bordered mt-4 flex w-full max-w-sm items-center gap-2">
        <Search size={16} className="text-base-content/50" />
        <input className="grow" placeholder="Search name, email or phone" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search users" />
      </label>

      <div className="mt-4 overflow-x-auto rounded-box bg-base-100">
        <table className="table">
          <thead><tr><th>Name</th><th>Contact</th><th>Joined</th><th>Role</th><th /></tr></thead>
          <tbody>
            {shown.map((u) => {
              const me = u.id === session?.user?.id;
              return (
                <tr key={u.id}>
                  <td className="font-medium">{u.name ?? "—"} {me && <span className="badge badge-sm badge-primary badge-soft ml-1">You</span>}</td>
                  <td className="text-sm">{isPhoneEmail(u.email) ? u.phone : u.email}</td>
                  <td className="text-sm">{u.createdAt ? formatDate(u.createdAt) : "—"}</td>
                  <td>
                    <select aria-label={`Role for ${u.name ?? u.email}`} className="select select-sm" value={u.role ?? "user"} disabled={me} onChange={(e) => changeRole(u, e.target.value as "user" | "admin")}>
                      <option value="user">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td><button className="btn btn-ghost btn-sm btn-square text-error" disabled={me} aria-label={`Delete ${u.name ?? u.email}`} onClick={() => remove(u)}><Trash2 size={16} /></button></td>
                </tr>
              );
            })}
            {!loading && shown.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-base-content/55">No users found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
