"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface NewsPost {
  id: string;
  title: string;
  slug: string | null;
  content: string;
  excerpt: string | null;
  coverUrl: string | null;
  status: string;
  authorId: string | null;
  createdAt: string;
  updatedAt: string;
}

export function NewsPanel({ editId }: { editId?: string }) {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<NewsPost | null>(null);
  const [form, setForm] = useState({ title: "", content: "", excerpt: "", status: "draft" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<{ posts: NewsPost[] }>("/news")
      .then((d) => setPosts(d.posts ?? []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (editId) {
      const post = posts.find((p) => p.id === editId);
      if (post) {
        setEditing(post);
        setForm({ title: post.title, content: post.content, excerpt: post.excerpt ?? "", status: post.status });
        setDialogOpen(true);
      }
    }
  }, [editId, posts]);

  function openCreate() {
    setEditing(null);
    setForm({ title: "", content: "", excerpt: "", status: "draft" });
    setDialogOpen(true);
  }

  function openEdit(post: NewsPost) {
    setEditing(post);
    setForm({ title: post.title, content: post.content, excerpt: post.excerpt ?? "", status: post.status });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      if (editing) {
        const updated = await api.put<Partial<NewsPost>>(`/news/${editing.id}`, form);
        setPosts((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...updated } as NewsPost : p)));
        toast.success("Post updated");
      } else {
        const created = await api.post<NewsPost>("/news", form);
        setPosts((prev) => [created, ...prev]);
        toast.success("Post created");
      }
      setDialogOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save post");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this post?")) return;
    try {
      await api.delete(`/news/${id}`);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete post");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">News</h1>
        <Button onClick={openCreate}><Plus className="mr-1.5 h-4 w-4" />New Post</Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-muted-foreground">No news posts yet.</p>
          <Button className="mt-4" onClick={openCreate}>Create your first post</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-card px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{post.title}</div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{new Date(post.createdAt).toLocaleDateString("en-KE")}</span>
                  <Badge variant="outline" className="text-[10px]">{post.status}</Badge>
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => openEdit(post)}><Pencil className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(post.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Post" : "New Post"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="news-title">Title</Label>
              <Input id="news-title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="news-excerpt">Excerpt</Label>
              <Input id="news-excerpt" value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} className="mt-1.5" placeholder="Brief summary…" />
            </div>
            <div>
              <Label htmlFor="news-content">Content</Label>
              <textarea id="news-content" value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={8} className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <Label htmlFor="news-status">Status</Label>
              <select id="news-status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : editing ? "Update Post" : "Create Post"}</Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
