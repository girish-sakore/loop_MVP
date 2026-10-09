"use client";

import type { MouseEvent } from "react";
import { burst } from "@/lib/matchbox/sparks";
import { CatBadge } from "./icons";

export default function CatButton() {
  function onClick(e: MouseEvent<HTMLButtonElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 30);
  }
  return (
    <button className="cat" aria-label="Strike a spark" title="Strike!" onClick={onClick}>
      <CatBadge />
    </button>
  );
}
