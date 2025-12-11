import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="container max-w-6xl mx-auto px-4">
        {children}
      </div>
    </div>
  );
}
