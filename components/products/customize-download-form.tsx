"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CustomizeDownloadForm({
  slug,
  label,
}: {
  slug: string;
  label: string;
}) {
  const [streamName, setStreamName] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/6 p-5">
      <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Personalize This Overlay</p>
      <p className="mt-2 text-sm text-slate-300">
        Enter the buyer stream name and download a customized OBS-ready package generated from the
        real source files.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={streamName}
          onChange={(event) => setStreamName(event.target.value)}
          placeholder={label}
          className="flex-1 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none"
        />
        <Button
          disabled={loading || !streamName.trim()}
          onClick={async () => {
            setLoading(true);
            const url = `/api/customize/${slug}?streamName=${encodeURIComponent(streamName.trim())}`;
            window.location.href = url;
            setLoading(false);
          }}
        >
          {loading ? "Preparing package..." : "Download customized pack"}
        </Button>
      </div>
    </div>
  );
}
