import { ArrowUpRight } from "lucide-react";
import { useDashboardLinks } from "@/lib/dashboardLinks";
import { useClock } from "@/lib/useClock";
import { Controls } from "@/components/Controls";
import { StatusDot } from "@/components/StatusDot";
import { openDashboardLinkFromAnchor } from "@/lib/linkNavigation";
import { cn } from "@/lib/utils";

/**
 * Bento — a dense, magazine-style mosaic of unequal tiles. A large clock /
 * greeting hero anchors the top-left; services tumble around it.
 */
export default function Bento() {
  const clock = useClock();
  const dashboard = useDashboardLinks();
  const links = dashboard.links;
  const title = dashboard.title ?? "homebase";

  // Tile size pattern: the first app gets a wide tile, the rest are 1x1.
  const sizeFor = (i: number) =>
    i === 0 ? "col-span-2 sm:row-span-2" : i === 3 ? "sm:col-span-2" : "";

  return (
    <main className="relative min-h-screen overflow-hidden bg-background font-sans text-foreground">
      <div className="bloom-mesh" aria-hidden="true">
        <div className="bloom-blob b1" />
        <div className="bloom-blob b2" />
        <div className="bloom-blob b3" />
        <div className="bloom-blob b4" />
        <div className="bloom-blob b5" />
      </div>
      <div className="bloom-grain" aria-hidden="true" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-10 pt-6 sm:px-6 sm:pt-10">
        <header className="mb-5 flex items-center justify-between gap-4">
          <span
            className="text-lg font-semibold tracking-tight"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            {title}
          </span>
          <Controls />
        </header>

        <div className="grid auto-rows-[150px] grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {/* Hero clock tile */}
          <div
            className="hp-rise col-span-2 row-span-2 flex flex-col justify-between overflow-hidden rounded-sketch border border-border bg-primary p-6 text-primary-foreground shadow-sketch"
            style={{ animationDelay: "0ms" }}
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium uppercase tracking-widest">
                {clock.greeting}
              </span>
              <span className="text-sm opacity-80">{clock.date}</span>
            </div>
            <div>
              <div
                className="text-7xl font-extrabold leading-none tracking-tight tabular-nums sm:text-8xl"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                {clock.time}
              </div>
              <p className="mt-3 max-w-sm text-sm opacity-80">
                {links.filter((l) => l.status === "online").length} of {links.length} services online ·
                everything you run, one tap away.
              </p>
            </div>
          </div>

          {links.length === 0 ? (
            <div className="hp-rise col-span-2 flex flex-col justify-center rounded-sketch border border-dashed border-border bg-card/80 p-5 shadow-sketch-sm backdrop-blur sm:col-span-2">
              <h2
                className="text-xl font-semibold tracking-tight"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                No links configured yet — add them in config.json
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Place a valid config.json beside the static build and refresh this page.
              </p>
            </div>
          ) : null}

          {links.map((link, i) => {
            const Icon = link.icon;
            return (
              <a
                key={link.name}
                href={link.href}
                target={link.newTab ? "_blank" : undefined}
                rel={link.newTab ? "noreferrer" : undefined}
                onClick={(event) => openDashboardLinkFromAnchor(event, link)}
                style={{ animationDelay: `${80 + i * 55}ms` }}
                className={cn(
                  "hp-rise group relative flex flex-col justify-between overflow-hidden rounded-sketch border border-border bg-card/80 p-4 shadow-sketch-sm backdrop-blur transition-all hover:-translate-y-1 hover:bg-card hover:shadow-sketch",
                  sizeFor(i),
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex size-10 items-center justify-center rounded-sketch-sm border border-border bg-background text-foreground">
                    {Icon ? <Icon className="size-5" aria-hidden="true" /> : null}
                  </div>
                  <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3
                      className="text-lg font-semibold leading-tight"
                      style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                    >
                      {link.name}
                    </h3>
                    <StatusDot status={link.status} pulse={false} />
                  </div>
                  {link.description ? (
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{link.description}</p>
                  ) : null}
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </main>
  );
}
