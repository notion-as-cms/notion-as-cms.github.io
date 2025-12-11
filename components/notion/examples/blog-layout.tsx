/**
 * Example: Blog Layout
 *
 * Copy this to `app/blog/layout.tsx` in your project.
 * Controls the width and styling of the blog section.
 */

import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="container max-w-5xl mx-auto px-4">
      {children}
    </div>
  );
}
