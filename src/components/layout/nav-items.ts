import {
  Home,
  Users,
  GitBranch,
  KanbanSquare,
  Map,
  Sunrise,
  Scale,
  Trophy,
  Inbox,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

// Desktop sidebar order (spec §6).
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/pipeline", label: "Pipeline", icon: GitBranch },
  { href: "/board", label: "Board", icon: KanbanSquare },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/standup", label: "Standup", icon: Sunrise },
  { href: "/decisions", label: "Decisions", icon: Scale },
  { href: "/wins", label: "Wins", icon: Trophy },
  { href: "/inbox", label: "Inbox", icon: Inbox },
];

// Mobile bottom nav: 5 primary, rest in the "More" drawer (spec §6).
export const MOBILE_PRIMARY = ["/", "/clients", "/board", "/roadmap"];
export const MOBILE_MORE = ["/pipeline", "/standup", "/decisions", "/wins", "/inbox"];
