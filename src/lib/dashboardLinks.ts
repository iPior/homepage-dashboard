import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bot,
  ChartNoAxesCombined,
  Container,
  Film,
  Gauge,
  HardDrive,
  HeartPulse,
  KeyRound,
  Network,
  Send,
} from "lucide-react";

export type DashboardConfig = {
  title?: string;
  links: LinkItem[];
};

export type LinkStatus = "online" | "idle" | "offline";

export type LinkIconName =
  | "Bot"
  | "ChartNoAxesCombined"
  | "Container"
  | "Film"
  | "Gauge"
  | "HardDrive"
  | "HeartPulse"
  | "KeyRound"
  | "Network"
  | "Send";

export type LinkItem = {
  name: string;
  description?: string;
  href: string;
  icon?: LucideIcon;
  group: string;
  status?: LinkStatus;
  newTab?: boolean;
};

export type JsonLinkItem = Omit<LinkItem, "icon"> & {
  icon?: LinkIconName;
};

const ICONS: Record<LinkIconName, LucideIcon> = {
  Bot,
  ChartNoAxesCombined,
  Container,
  Film,
  Gauge,
  HardDrive,
  HeartPulse,
  KeyRound,
  Network,
  Send,
};

const EMPTY_CONFIG: DashboardConfig = {
  links: [],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIconName(value: unknown): value is LinkIconName {
  return typeof value === "string" && value in ICONS;
}

function isLinkStatus(value: unknown): value is LinkStatus {
  return value === "online" || value === "idle" || value === "offline";
}

function validateOptionalString(value: unknown, field: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string") throw new Error(`${field} must be a string.`);
  return value;
}

function validateOptionalBoolean(value: unknown, field: string): boolean | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "boolean") throw new Error(`${field} must be a boolean.`);
  return value;
}

function validateRequiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${field} must be a non-empty string.`);
  }
  return value;
}

function toLinkItem(link: JsonLinkItem): LinkItem {
  return {
    ...link,
    icon: link.icon ? ICONS[link.icon] : undefined,
  };
}

function parseLinkItem(value: unknown, index: number): LinkItem {
  if (!isRecord(value)) throw new Error(`links[${index}] must be an object.`);

  const icon = value.icon;
  if (icon !== undefined && !isIconName(icon)) {
    throw new Error(`links[${index}].icon must be one of: ${Object.keys(ICONS).join(", ")}.`);
  }

  const status = value.status;
  if (status !== undefined && !isLinkStatus(status)) {
    throw new Error(`links[${index}].status must be online, idle, or offline.`);
  }

  return toLinkItem({
    name: validateRequiredString(value.name, `links[${index}].name`),
    description: validateOptionalString(value.description, `links[${index}].description`),
    href: validateRequiredString(value.href, `links[${index}].href`),
    icon,
    group: validateOptionalString(value.group, `links[${index}].group`) ?? "Links",
    status,
    newTab: validateOptionalBoolean(value.newTab, `links[${index}].newTab`),
  });
}

function parseDashboardConfig(value: unknown): DashboardConfig {
  if (!isRecord(value)) throw new Error("config.json must contain an object.");

  const title = validateOptionalString(value.title, "title");
  const rawLinks = value.links;
  if (rawLinks === undefined) return { title, links: [] };
  if (!Array.isArray(rawLinks)) throw new Error("links must be an array.");

  return {
    title,
    links: rawLinks.map(parseLinkItem),
  };
}

async function fetchDashboardConfig(): Promise<DashboardConfig> {
  try {
    const response = await fetch("/config.json");
    if (!response.ok) {
      const error = `Could not load /config.json: HTTP ${response.status}.`;
      console.error(error);
      return EMPTY_CONFIG;
    }

    return parseDashboardConfig(await response.json());
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const readableError = `Could not load /config.json: ${message}`;
    console.error(readableError, error);
    return EMPTY_CONFIG;
  }
}

export function useDashboardLinks() {
  const [config, setConfig] = useState<DashboardConfig>(EMPTY_CONFIG);

  useEffect(() => {
    let active = true;

    fetchDashboardConfig().then((nextConfig) => {
      if (active) setConfig(nextConfig);
    });

    return () => {
      active = false;
    };
  }, []);

  return config;
}
