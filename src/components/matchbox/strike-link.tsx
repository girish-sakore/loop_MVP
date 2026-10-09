"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import { burst } from "@/lib/matchbox/sparks";

/** Big matchbox button that links somewhere and throws sparks on tap. */
export default function StrikeLink({ href, children }: { href: string; children: ReactNode }) {
  function onClick(e: MouseEvent) {
    burst(e.clientX || innerWidth / 2, e.clientY || innerHeight / 2);
  }
  return (
    <Link href={href} className="go" onClick={onClick}>
      {children}
    </Link>
  );
}
