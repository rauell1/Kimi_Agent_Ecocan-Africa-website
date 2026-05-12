"use client";

import { useState, useEffect } from "react";
import {
  Users, Search, Loader2, Shield, UsersRound, HardHat, Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api/client";

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

const ROLES = [
  { value: "admin", label: "Admin", icon: Shield, color: "bg-water-deep text-white" },
  { value: "coordinator", label: "Coordinator", icon: UsersRound, color: "bg-civic text-white" },
  { value: "field_officer", label: "Field Officer", icon: HardHat, color: "bg-sun text-water-deep" },
  { value: "viewer", label: "Viewer", icon: Eye, color: "bg-secondary text-foreground" },
] as const;

function getRoleBadge(role: string) {
  const found = ROLES.find((r) => r.value === role);
  return found ?? ROLES[3];
}

export function UsersPanel() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [changingRole, setChangingRole] = useState<string | null>(null);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await api.get<{ users: UserRow[] }>("/users");
      setUsers(data.users);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleChangeRole(userId: string, newRole: string) {
    setChangingRole(userId);
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      toast.success("Role updated");
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setChangingRole(null);
    }
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  const roleCounts = users.reduce(
    (acc, u) => {
      acc[u.role] = (acc[u.role] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage user accounts and roles.</p>
        </div>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage user accounts and roles. {users.length} total.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ROLES.map((r) => (
          <div
            key={r.value}
            className="rounded-xl border border-border/70 bg-card p-4"
          >
            <div className="flex items-center gap-2">
              <r.icon className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {r.label}
              </p>
            </div>
            <p className="mt-1 font-display text-2xl font-semibold">
              {roleCounts[r.value] ?? 0}
            </p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={loadUsers}>
          Refresh
        </Button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 font-display text-xl font-semibold">
            {search ? "No matching users" : "No users yet"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {search ? "Try a different search term." : "Users will appear here once they sign up."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
          <div className="max-h-[480px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                  <TableHead className="text-xs uppercase tracking-widest">Name</TableHead>
                  <TableHead className="text-xs uppercase tracking-widest">Email</TableHead>
                  <TableHead className="text-xs uppercase tracking-widest">Role</TableHead>
                  <TableHead className="text-xs uppercase tracking-widest">Created</TableHead>
                  <TableHead className="text-xs uppercase tracking-widest text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => {
                  const badge = getRoleBadge(u.role);
                  return (
                    <TableRow key={u.id} className="hover:bg-secondary/20">
                      <TableCell className="font-medium">
                        {u.name ?? "-" }
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {u.email}
                      </TableCell>
                      <TableCell>
                        <Badge className={badge.color}>{badge.label}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(u.createdAt).toLocaleDateString("en-KE", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Select
                          value={u.role}
                          onValueChange={(v) => handleChangeRole(u.id, v)}
                          disabled={changingRole === u.id}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs mx-auto">
                            {changingRole === u.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <SelectValue />
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map((r) => (
                              <SelectItem key={r.value} value={r.value}>
                                {r.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
