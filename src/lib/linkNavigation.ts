import type { MouseEvent } from "react";
import type { LinkItem } from "@/lib/dashboardLinks";

const PROBE_TIMEOUT_MS = 1200;

async function canReach(url: string, timeoutMs = PROBE_TIMEOUT_MS): Promise<boolean> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    await fetch(url, {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-store",
      signal: controller.signal,
    });
    return true;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function getReachableHref(link: LinkItem): Promise<string> {
  if (!link.fallbackHref) return link.href;
  if (await canReach(link.href)) return link.href;
  if (await canReach(link.fallbackHref)) return link.fallbackHref;
  return link.href;
}

async function navigateToLink(link: LinkItem, openedWindow?: Window | null) {
  const href = await getReachableHref(link);
  if (openedWindow) openedWindow.location.href = href;
  else if (link.newTab) window.open(href, "_blank", "noreferrer");
  else window.location.href = href;
}

export function openDashboardLink(link: LinkItem) {
  if (!link.fallbackHref) {
    if (link.newTab) window.open(link.href, "_blank", "noreferrer");
    else window.location.href = link.href;
    return;
  }

  const openedWindow = link.newTab ? window.open("about:blank", "_blank") : null;
  if (openedWindow) openedWindow.opener = null;
  void navigateToLink(link, openedWindow);
}

export function openDashboardLinkFromAnchor(event: MouseEvent<HTMLAnchorElement>, link: LinkItem) {
  if (!link.fallbackHref) return;

  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }

  event.preventDefault();
  openDashboardLink(link);
}
