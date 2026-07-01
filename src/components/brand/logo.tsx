import { GraduationCap } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <GraduationCap className="h-5 w-5" strokeWidth={2.4} />
      </div>
      <span className="text-xl font-extrabold tracking-tight">Baapedu</span>
    </div>
  );
}
