"use client";

import { useEffect, useState } from "react";
import { Droplet, Calendar, User as UserIcon, Loader2, Newspaper } from "lucide-react";

interface NewsPost {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverUrl: string | null;
  status: string;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

export function NewsPublicPage() {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news?public=true")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="flex-1">
      {/* Header */}
      <section className="border-b border-border/60 bg-gradient-to-b from-secondary/40 to-background">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-water-light/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-civic/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-civic">News & Updates</p>
          <h1 className="mt-3 font-display text-5xl font-semibold sm:text-6xl">Stories from the field.</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Latest news, insights and updates from KYPW&apos;s water governance work across Kenya.
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-shimmer rounded-2xl bg-gradient-to-r from-muted via-muted/60 to-muted" style={{ height: "380px" }} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
              <Newspaper className="h-10 w-10 text-primary/60" />
            </div>
            <h3 className="mt-6 font-display text-2xl font-semibold">No news yet</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Check back soon for the latest stories and updates from KYPW.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <article
                key={post.id}
                className={`group overflow-hidden rounded-2xl border border-border/70 bg-card transition-all duration-500 hover:-translate-y-1 hover:shadow-elevated ${
                  index === 0 ? "md:col-span-2 lg:col-span-2" : ""
                }`}
              >
                {/* Cover */}
                <div className={`relative overflow-hidden bg-gradient-hero ${index === 0 ? "aspect-[2/1]" : "aspect-[4/3]"}`}>
                  {post.coverUrl ? (
                    <img
                      src={post.coverUrl}
                      alt={post.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-primary-foreground/30">
                      <Droplet className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  {index === 0 && (
                    <div className="absolute left-4 top-4">
                      <span className="rounded-full bg-background/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-civic">
                        Latest
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className={`font-display font-semibold leading-tight ${index === 0 ? "text-2xl" : "text-xl"}`}>
                    {post.title}
                  </h3>

                  {post.excerpt && (
                    <p className={`mt-2 text-muted-foreground ${index === 0 ? "text-sm line-clamp-3" : "text-sm line-clamp-2"}`}>
                      {post.excerpt}
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(post.createdAt).toLocaleDateString("en-KE", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    {post.author && (
                      <span className="inline-flex items-center gap-1.5">
                        <UserIcon className="h-3.5 w-3.5" />
                        {post.author.name ?? post.author.email}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
