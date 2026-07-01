import { createFileRoute } from "@tanstack/react-router";
import { User } from "lucide-react";
import { ModulePlaceholder } from "@/components/app/module-placeholder";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "Profile — Baapedu" }] }),
  component: () => (
    <ModulePlaceholder title="Profile" description="Manage your personal profile." Icon={User} />
  ),
});
