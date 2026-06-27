import { useMemo, useRef, useState } from "react";
import { useDashboardLinks } from "@/lib/dashboardLinks";
import { useClock } from "@/lib/useClock";
import { Controls } from "@/components/Controls";
import { cn } from "@/lib/utils";

const MONO = "'IBM Plex Mono', ui-monospace, monospace";

/**
 * Console — a keyboard-first terminal start page. Type to filter services,
 * ↑/↓ to move, Enter opens the highlighted match. Monospace throughout.
 */
export default function Console() {
  const clock = useClock();
  const dashboard = useDashboardLinks();
  const links = dashboard.links;
  const title = dashboard.title ?? "homebase";
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return links;
    return links.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.description?.toLowerCase().includes(q) ||
        l.group.toLowerCase().includes(q),
    );
  }, [links, query]);

  function open(index: number) {
    const link = results[index];
    if (!link) return;
    if (link.newTab) window.open(link.href, "_blank", "noreferrer");
    else window.location.href = link.href;
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      open(selected);
    }
  }

  return (
    <main
      className="relative flex min-h-screen items-start justify-center bg-background px-4 pb-28 pt-10 text-foreground sm:items-center sm:pt-10"
      style={{ fontFamily: MONO }}
    >
      <div className="bloom-mesh" aria-hidden="true">
        <div className="bloom-blob b1" />
        <div className="bloom-blob b2" />
        <div className="bloom-blob b3" />
        <div className="bloom-blob b4" />
        <div className="bloom-blob b5" />
      </div>
      <div className="bloom-grain" aria-hidden="true" />

      <div className="hp-fade relative z-10 w-full max-w-3xl">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{clock.date.toLowerCase()}</span>
          <Controls />
        </div>

        <div className="overflow-hidden rounded-sketch border border-border bg-card/90 shadow-sketch backdrop-blur">
          {/* Title bar */}
          <div className="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-2.5">
            <span className="size-3 rounded-full bg-destructive" />
            <span className="size-3 rounded-full bg-warn" />
            <span className="size-3 rounded-full bg-good" />
            <span className="ml-3 text-xs text-muted-foreground">
              {title.toLowerCase()} — {clock.timeWithSeconds}
            </span>
          </div>

          {/* Prompt */}
          <div
            className="flex items-center gap-2 border-b border-border px-4 py-3.5 text-sm"
            onClick={() => inputRef.current?.focus()}
          >
            <span className="select-none text-good">➜</span>
            <span className="select-none text-primary">~</span>
            <span className="select-none text-muted-foreground">open</span>
            <input
              ref={inputRef}
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelected(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="type to filter…"
              aria-label="Filter services"
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              style={{ fontFamily: MONO }}
            />
            <span className="hp-caret inline-block h-4 w-2 bg-foreground" aria-hidden="true" />
          </div>

          {/* Results */}
          <ul className="max-h-[52vh] overflow-y-auto py-1.5 text-sm">
            {links.length === 0 ? (
              <li className="px-4 py-8 text-center text-muted-foreground">
                No links configured yet — add them in config.json
              </li>
            ) : null}
            {links.length > 0 && results.map((link, i) => {
              const active = i === selected;
              return (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target={link.newTab ? "_blank" : undefined}
                    rel={link.newTab ? "noreferrer" : undefined}
                    onMouseEnter={() => setSelected(i)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 transition-colors",
                      active ? "bg-primary-soft" : "hover:bg-primary-soft/50",
                    )}
                  >
                    <span className={cn("w-4 select-none", active ? "text-primary" : "text-transparent")}>
                      ▸
                    </span>
                    <span
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        link.status === "online"
                          ? "bg-good"
                          : link.status === "idle"
                            ? "bg-warn"
                            : "bg-destructive",
                      )}
                    />
                    <span className="w-32 shrink-0 font-medium text-card-foreground">{link.name}</span>
                    <span className="flex-1 truncate text-muted-foreground">{link.description}</span>
                    <span className="shrink-0 text-xs uppercase tracking-wider text-muted-foreground/70">
                      {link.group}
                    </span>
                  </a>
                </li>
              );
            })}
            {links.length > 0 && results.length === 0 && (
              <li className="px-4 py-6 text-center text-muted-foreground">no matches — clear the filter</li>
            )}
          </ul>

          {/* Footer hints */}
          <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/40 px-4 py-2 text-[11px] text-muted-foreground">
            <span>
              {results.length} result{results.length === 1 ? "" : "s"}
            </span>
            <span className="flex items-center gap-3">
              <kbd className="rounded border border-border bg-card px-1.5 py-0.5">↑↓</kbd> navigate
              <kbd className="rounded border border-border bg-card px-1.5 py-0.5">↵</kbd> open
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
