import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app/app-sidebar";
import { AppHeader } from "@/components/app/app-header";
import { useAuthStore } from "@/lib/auth-store";

export const Route = createFileRoute("/_app")({
  ssr: false,
  beforeLoad: () => {
    const state = useAuthStore.getState();
    const { token, client } = state;
    if (!token) throw redirect({ to: "/login" });
    if (!client) throw redirect({ to: "/organizations" });
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
