import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col divide-y divide-dashed divide-border/70 border-border/70 border-dashed sm:border-b dark:divide-border dark:border-border updates">
      <div className="container max-w-5xl mx-auto px-4">
        {children}
      </div>
    </div>
  );
}
