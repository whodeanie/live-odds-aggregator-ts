"use client";

import { useEffect, useState } from "react";

export function Freshness({ fetchedAt, cached }: { fetchedAt: string; cached: boolean }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const ageSec = Math.max(0, Math.round((now - new Date(fetchedAt).getTime()) / 1000));
  const label = cached ? "cached" : "live";
  const color = ageSec < 30 ? "#a6d49a" : ageSec < 90 ? "#d4a574" : "#d49a7a";
  return (
    <span style={{ color, fontSize: 12 }}>
      {label} ({ageSec}s old)
    </span>
  );
}
