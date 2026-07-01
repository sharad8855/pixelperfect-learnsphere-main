import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { ModulePlaceholder } from "@/components/app/module-placeholder";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — Baapedu" }] }),
  component: () => (
    <ModulePlaceholder title="Settings" description="Manage account preferences and notifications." Icon={Settings} />
  ),
});
