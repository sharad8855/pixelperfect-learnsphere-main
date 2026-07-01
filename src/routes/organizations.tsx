import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { authApi } from "@/lib/auth-api";
import { useAuthStore, type AuthClient } from "@/lib/auth-store";
import { toast } from "sonner";
import { Loader2, Building2, ArrowRight, LogOut, Search } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/organizations")({
  ssr: false,
  beforeLoad: () => {
    if (!useAuthStore.getState().token) throw redirect({ to: "/login" });
  },
  component: OrgSelector,
});

const PAGE_SIZE = 20;

function OrgSelector() {
  const [clients, setClients] = useState<AuthClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selecting, setSelecting] = useState<string | null>(null);
  const setStoreClients = useAuthStore((s) => s.setClients);
  const setClient = useAuthStore((s) => s.setClient);
  const setRoleAndPermissions = useAuthStore((s) => s.setRoleAndPermissions);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  async function handlePick(client: AuthClient) {
    if (!user) return;
    setSelecting(client.id);
    setClient(client);
    try {
      const u = await authApi.getUser(client.id, user.id);
      const mapping = u?.user?.user_mappings?.[0];
      const roleName = mapping?.role?.name || null;
      if (mapping?.role_id) {
        try {
          const perms = await authApi.getPermissions(client.id, mapping.role_id);
          setRoleAndPermissions(mapping.role_id, roleName, perms?.permissions ?? []);
        } catch {
          setRoleAndPermissions(mapping.role_id, roleName, []);
        }
      }
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Failed to set organization");
      setSelecting(null);
    }
  }

  const fetchPage = useCallback(
    async (nextPage: number, term: string, replace: boolean) => {
      if (replace) setLoading(true);
      else setLoadingMore(true);
      try {
        const res = await authApi.getClients({
          page: nextPage,
          limit: PAGE_SIZE,
          search: term || undefined,
        });
        const list = res?.clients ?? [];
        setClients((prev) => {
          const merged = replace ? list : [...prev, ...list];
          setStoreClients(merged);
          return merged;
        });
        setPage(nextPage);
        setTotalPages(
          res?.totalPages ??
            (res?.total
              ? Math.max(1, Math.ceil(res.total / PAGE_SIZE))
              : list.length < PAGE_SIZE
                ? nextPage
                : nextPage + 1),
        );
        if (replace && list.length === 1 && !term) {
          await handlePick(list[0]);
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to load organizations");
        if (replace) {
          setClients([]);
          setStoreClients([]);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Single debounced effect — handles both initial load (search="") and search updates
  useEffect(() => {
    const t = setTimeout(() => {
      fetchPage(1, search, true);
    }, search ? 350 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);


  const canLoadMore = page < totalPages && !loading;

  return (
    <div className="min-h-screen bg-hero-gradient">
      <header className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-6">
        <Logo />
        <Button
          variant="ghost"
          onClick={() => {
            logout();
            navigate({ to: "/login" });
          }}
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Choose an organization</h1>
        <p className="mt-1 text-muted-foreground">
          Select the workspace you want to enter.
        </p>

        <div className="relative mt-6">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search organizations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading…
            </div>
          ) : clients.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
              No organizations found for your account.
            </div>
          ) : (
            <>
              {clients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handlePick(c)}
                  disabled={selecting !== null}
                  className="group flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 disabled:opacity-60 cursor-pointer"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-foreground group-hover:text-primary transition-colors text-[15px] leading-snug">
                      {c.name}
                    </div>
                    {c.subdomain && (
                      <div className="text-xs text-muted-foreground mt-0.5 font-medium">
                        {c.subdomain}
                      </div>
                    )}
                  </div>
                  {selecting === c.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                  ) : (
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover:text-primary group-hover:translate-x-1 shrink-0" />
                  )}
                </button>
              ))}

              {canLoadMore && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={loadingMore}
                    onClick={() => fetchPage(page + 1, search, false)}
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
                      </>
                    ) : (
                      <>Load more</>
                    )}
                  </Button>
                </div>
              )}

              <div className="pt-2 text-center text-xs text-muted-foreground">
                Page {page}
                {totalPages > 1 ? ` of ${totalPages}` : ""} · {clients.length} shown
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
